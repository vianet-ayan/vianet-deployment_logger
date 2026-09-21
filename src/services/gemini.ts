import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
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

export async function chatCompletion(
  messages: GeminiMessage[],
  options: { model?: string; systemInstruction?: string } = {}
): Promise<string> {
  const model = options.model || getDefaultModel()

  const response = await ai.models.generateContent({
    model,
    contents: messages.map(m => ({
      role: m.role,
      parts: m.parts,
    })),
    config: options.systemInstruction ? { systemInstruction: options.systemInstruction } : undefined,
  })

  console.log('[gemini] response:', JSON.stringify(response).slice(0, 500))
  return response.text || ''
}

export async function* chatCompletionStream(
  messages: GeminiMessage[],
  options: { model?: string; systemInstruction?: string } = {}
): AsyncGenerator<string, void, unknown> {
  const model = options.model || getDefaultModel()

  const response = await ai.models.generateContentStream({
    model,
    contents: messages.map(m => ({
      role: m.role,
      parts: m.parts,
    })),
    config: options.systemInstruction ? { systemInstruction: options.systemInstruction } : undefined,
  })

  for await (const chunk of response) {
    const text = chunk.text
    if (text) yield text
  }
}
