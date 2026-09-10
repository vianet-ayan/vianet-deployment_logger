import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import apirouter from './routes/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use('/api', apirouter)

// Home route - HTML


app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(express.static(path.join(__dirname, '..', 'vianet', 'dist'),{
  maxAge: 0,       // Tells browser NOT to store for future use without asking
  etag: true,      // Enables ETag validation so the server knows if the file changed
  lastModified: true, // Uses last-modified header for file freshness check
}))


export default app
