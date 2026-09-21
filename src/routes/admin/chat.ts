import express from 'express'
import { chatCompletion, chatCompletionStream, getAvailableModels, type GeminiMessage } from '../../services/gemini.js'
import { TOOL_DEFINITIONS, executeTool } from '../../services/mcp.js'

const router = express.Router()
router.use(express.json())

router.get('/models', (_req, res) => {
  res.json(getAvailableModels())
})

router.get('/tools', (_req, res) => {
  res.json(TOOL_DEFINITIONS)
})

router.post('/', async (req, res) => {
  const { messages, model, systemInstruction } = req.body as {
    messages: GeminiMessage[]
    model?: string
    systemInstruction?: string
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  try {
    console.log('[chat] model:', model || 'gemini-2.0-flash')
    console.log('[chat] messages:', JSON.stringify(messages))
    const reply = await chatCompletion(messages, { model, systemInstruction })
    console.log('[chat] reply length:', reply?.length)
    res.json({ reply })
  } catch (error) {
    console.error('[chat] error:', error)
    res.status(500).json({ error: (error as Error).message })
  }
})

router.post('/stream', async (req, res) => {
  const { messages, model, systemInstruction } = req.body as {
    messages: GeminiMessage[]
    model?: string
    systemInstruction?: string
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    for await (const chunk of chatCompletionStream(messages, { model, systemInstruction })) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`)
    }
    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    console.error('Chat stream error:', error)
    res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`)
    res.end()
  }
})

router.post('/tool', async (req, res) => {
  const { tool, input } = req.body as {
    tool: string
    input: Record<string, unknown>
  }

  if (!tool) {
    return res.status(400).json({ error: 'tool name is required' })
  }

  try {
    const result = await executeTool(tool, input || {})
    res.json(result)
  } catch (error) {
    console.error('Tool execution error:', error)
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
