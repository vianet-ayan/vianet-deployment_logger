import * as Sentry from "@sentry/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Zap } from "lucide-react"

export default function SentryTest() {
  const sendError = () => {
    throw new Error("Sentry test error from admin dashboard — " + new Date().toISOString())
  }

  const sendCaptureException = () => {
    try {
      throw new Error("Captured exception via Sentry.captureException — " + new Date().toISOString())
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  const sendMessage = () => {
    Sentry.captureMessage("Test message from admin dashboard", "warning")
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-lg">
      <h1 className="text-2xl font-bold tracking-tight">Sentry Test</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={18} />
            Throw Error
          </CardTitle>
          <CardDescription>
            Throws an unhandled error caught by Sentry's global error handler.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={sendError}>
            Throw Error
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={18} />
            captureException
          </CardTitle>
          <CardDescription>
            Catches the error and sends it to Sentry manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={sendCaptureException}>
            Send Exception
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={18} />
            captureMessage
          </CardTitle>
          <CardDescription>
            Sends a plain warning message to Sentry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={sendMessage}>
            Send Message
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
