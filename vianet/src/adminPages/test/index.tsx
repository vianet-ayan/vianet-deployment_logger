import { useState, useEffect } from "react"
import { getTestApi } from "../adminApi/test"

export default function AdminTestPage() {
  const [data, setData] = useState<{ message: string; timestamp: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    
    getTestApi({
      then: (result) => { if (!cancelled) setData(result) },
      catch: (err) => { if (!cancelled) setError(err.message) },
      finally: () => { if (!cancelled) setLoading(false) },
    })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Test</h1>
      <p className="text-muted-foreground mb-6">
        GET <code className="rounded bg-muted px-1.5 py-0.5 text-sm">/api/admin/test</code>
      </p>
      <div className="mt-6 w-full max-w-lg rounded-lg border p-4">
        {loading && <p className="text-muted-foreground">Fetching...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {data && (
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </div>
  )
}
