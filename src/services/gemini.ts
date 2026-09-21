const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export interface GeminiChatResponse {
  candidates: {
    content: {
      parts: { text: string }[]
      role: string
    }
    finishReason: string
  }[]
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast, efficient model for most tasks' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', description: 'Lightweight version for quick responses' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Advanced model for complex reasoning' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Balanced speed and capability' },
]

export function getAvailableModels() {
  return AVAILABLE_MODELS
}

export function getDefaultModel() {
  return AVAILABLE_MODELS[0].id
}

function buildContents(messages: GeminiMessage[]) {
  return messages.map(msg => ({ role: msg.role, parts: msg.parts }))
}

function buildBody(messages: GeminiMessage[], systemInstruction?: string) {
  const body: Record<string, unknown> = { contents: buildContents(messages) }
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] }
  }
  return body
}

export async function chatCompletion(
  messages: GeminiMessage[],
  options: { model?: string; systemInstruction?: string } = {}
): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured')

  const model = options.model || getDefaultModel()
  const url = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildBody(messages, options.systemInstruction)),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Gemini API error (${res.status}): ${error}`)
  }

  const data: GeminiChatResponse = await res.json()
  console.log('[gemini] response:', JSON.stringify(data).slice(0, 500))
  if (!data.candidates?.length) throw new Error('No response from Gemini API: ' + JSON.stringify(data))

  return data.candidates[0].content.parts.map(p => p.text).join('')
}

export async function* chatCompletionStream(
  messages: GeminiMessage[],
  options: { model?: string; systemInstruction?: string } = {}
): AsyncGenerator<string, void, unknown> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured')

  const model = options.model || getDefaultModel()
  const url = `${GEMINI_BASE_URL}/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildBody(messages, options.systemInstruction)),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Gemini API error (${res.status}): ${error}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6))
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) yield text
        } catch {
          // skip malformed chunks
        }
      }
    }
  }
}
