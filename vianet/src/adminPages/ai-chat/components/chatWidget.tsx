import { useState } from "react"
import { MessageSquare, X, Send } from "lucide-react"

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Chat Panel - 90vh with margins */}
      {open && (
        <div className="fixed top-[5vh] right-4 bottom-[5vh] z-50 w-full sm:w-96 rounded-xl border bg-background shadow-2xl animate-in slide-in-from-right-5 duration-300 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
            <h3 className="font-semibold text-sm">AI Chat</h3>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto p-4">
            <div className="self-start rounded-lg bg-muted px-3 py-2 text-sm max-w-[80%]">
              Hello! How can I help you today?
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t px-4 py-3 shrink-0">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
