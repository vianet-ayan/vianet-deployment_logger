import express from 'express'

const router = express.Router()

router.get('/', async (req, res) => {
    // 1. Set headers for JSON streaming
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')

    // 2. Open the JSON array
    res.write('[')

    let isFirst = true
    let chunkString = ''

    // 3. Loop up to 5,000
    for (let i = 1; i <= 5000; i++) {
        const prefix = isFirst ? '' : ','
        
        // Add the number to our temporary chunk string
        chunkString += prefix + JSON.stringify({ number: i })
        isFirst = false

        // 4. Every time 'i' reaches a multiple of 10, flush the chunk!
        if (i % 10 === 0) {
            res.write(chunkString)
            chunkString = '' // Reset the string for the next 10 numbers

            // Optional tiny delay (10ms) so the chunks actually stream over time
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    // 5. Close the JSON array and end the response
    res.write(']')
    res.end()
})

export default router