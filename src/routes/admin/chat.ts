import express from 'express'
import { GoogleGenAI } from '@google/genai'
import { GEMINI_TOOLS, executeTool } from '../../services/mcp.js'

const router = express.Router()
router.use(express.json())

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

const SYSTEM_INSTRUCTION = `You are a helpful AI assistant for the Vianet admin panel. 
You have access to database tools to query business data. 
Use tools when the user asks about sales, daybook, ledger, inventory, or any database data. 
Always explain results clearly.

For your reference, the database uses the "app" schema. You have access to the following tables in the "app" schema:
- app.access_groups
- app.api
- app.balancesheet
- app.data
- app.email_marketing
- app.google-auth
- app.iag_backup
- app.iag_backup_join
- app.inventory
- app.inventory_access_group
- app.inventory_backup_temp
- app.inventory_brand_fix_backup
- app.ledger
- app.mismatched_stock
- app.outstanding
- app.prodcache
- app.profitloss
- app.profitloss_monthly
- app.qtycache
- app.sales_records
- app.stock_backup
- app.updated_inventory_cache
- app.users
- app.vouchers`

const MODEL_NAME = 'gemini-3.5-flash-lite'

router.get('/', (_req, res) => {
  res.json({ status: '200 working chat route' })
})

router.get('/tools', (_req, res) => {
  res.json(GEMINI_TOOLS)
})

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body as {
      message: string
      history?: { role: string; parts: any[] }[]
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "A 'message' string is required in the request body." })
    }

    // 1. Build the conversation history
    const contents: any[] = [
      ...(history || []).map((h: any) => ({
        role: h.role,
        parts: h.parts,
      })),
      { role: 'user', parts: [{ text: message }] },
    ]

    // 2. Initial request to Gemini
    let response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: GEMINI_TOOLS }],
      },
    })

    const MAX_TOOL_ROUNDS = 3
    
    // 3. Loop to handle potential function calls
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const functionCalls = response.functionCalls
      
      // If Gemini didn't ask for a tool, break the loop and return the text
      if (!functionCalls || functionCalls.length === 0) break

      const functionResponses = []
      
      // Execute ALL tools Gemini requested in parallel
      for (const fc of functionCalls) {
        console.log('[chat] tool call:', fc.name, JSON.stringify(fc.args))
        const result = await executeTool(fc.name!, fc.args as Record<string, unknown>)
        
        functionResponses.push({
          name: fc.name,
          response: { result: result.content.map((c: any) => c.text).join('\n') },
        })
      }

      // FIX FOR GEMINI 3: 
      // Extract the raw model parts directly from response.candidates to preserve 
      // the internal 'thought_signature' required by Gemini 3 models.
      const modelParts = response.candidates?.[0]?.content?.parts || functionCalls.map(fc => ({ functionCall: fc }))

      contents.push({ 
        role: 'model', 
        parts: modelParts 
      })
      
      // Push ALL function responses back into the history using the standard functionResponse format
      contents.push({ 
        role: 'user', 
        parts: functionResponses.map(fr => ({ functionResponse: fr })) 
      })

      // 4. Send the tool results back to Gemini along with the signed history
      response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: GEMINI_TOOLS }],
        },
      })
    }

    // 5. Return final response to the frontend
    return res.status(200).json({ reply: response.text || '' })
    
  } catch (error: any) {
    console.error('Chat error:', error)
    return res.status(500).json({ 
      error: 'Failed to generate chat response', 
      details: error.message 
    })
  }
})

export default router