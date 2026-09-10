import { useState, useEffect } from "react"

export default function AppTestPage() {
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTest = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const res = await fetch("/api/app/test")
      const text = await res.text()
      setResponse(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTest()
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">App Test</h1>
      <p className="text-muted-foreground mb-6">
        GET <code className="rounded bg-muted px-1.5 py-0.5 text-sm">/api/app/test</code>
      </p>
      <button
        onClick={fetchTest}
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Retry"}
      </button>
      <div className="mt-6 w-full max-w-lg rounded-lg border p-4">
        {loading && <p className="text-muted-foreground">Fetching...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {response && (
          <pre className="whitespace-pre-wrap text-sm">{response}</pre>
        )}
      </div>
    </div>
  )
}
