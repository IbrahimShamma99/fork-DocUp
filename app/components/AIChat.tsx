"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

type TMessage = { id: number; role: "user" | "assistant"; content: string }

const SUGGESTIONS = ["/ml", "/nextjs", "#essays", "#notes", "/react", "#dev"]

function AssistantIcon() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/90 text-background">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1m0-12.8l-2.1 2.1M5.6 18.4l2.1-2.1"
        />
      </svg>
    </div>
  )
}

let nextId = 1

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<TMessage[]>([])
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Scroll to bottom when messages or sending state changes
  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, sending, open])

  // Focus textarea on open
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  const send = async (textToSend?: string) => {
    const text = (textToSend ?? draft).trim()
    if (!text || sending) return

    const userMsg: TMessage = { id: nextId++, role: "user", content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setDraft("")
    setSending(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string
        error?: string
      }

      if (!res.ok) {
        const msg =
          data.error || (res.status === 503
            ? "Chat isn't configured yet — add OPENROUTER_API_KEY to .env.local and restart the dev server."
            : `Request failed (${res.status})`)
        setMessages((m) => [
          ...m,
          { id: nextId++, role: "assistant", content: msg },
        ])
        return
      }

      setMessages((m) => [
        ...m,
        { id: nextId++, role: "assistant", content: data.reply || "…" },
      ])
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: nextId++,
          role: "assistant",
          content: "Something went wrong reaching the server.",
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setDraft(suggestion)
    inputRef.current?.focus()
  }

  const drawerContent = (
    <>
      {/* Backdrop — below top bar */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/20 transition-all duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0 invisible"
        }`}
      />

      {/* Drawer — Bottom sheet modal on mobile, Right sidebar drawer on desktop */}
      <aside
        aria-hidden={!open}
        tabIndex={open ? undefined : -1}
        className={`fixed bottom-0 right-0 z-50 flex w-full flex-col bg-background shadow-2xl transition-all duration-300
          /* Mobile styles: Bottom-to-top sheet modal */
          left-0 top-auto h-[85vh] max-h-[85vh] rounded-t-2xl border-t border-border
          /* Desktop styles (sm: and up): Right side drawer */
          sm:left-auto sm:top-11 sm:h-[calc(100dvh-44px)] sm:max-h-none sm:max-w-[320px] sm:rounded-none sm:border-l sm:border-t-0
          ${
            open
              ? "translate-y-0 sm:translate-x-0 sm:translate-y-0 opacity-100"
              : "translate-y-full sm:translate-x-full sm:translate-y-0 opacity-0 invisible"
          }`}
      >
        {/* Mobile Drag Indicator */}
        <div className="flex shrink-0 items-center justify-center pt-2.5 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <header className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-4">
          <div className="flex items-center gap-2">
            <AssistantIcon />
            <span className="text-[14px] font-semibold text-foreground">AI Chat</span>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                title="Clear chat"
                aria-label="Clear chat"
                className="flex h-7 px-2 items-center justify-center rounded-md text-[11px] font-medium text-faint transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI chat"
              className="flex h-7 w-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Messages Container */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-background px-4 py-5">
          {messages.length === 0 && (
            <div className="flex items-end gap-2.5">
              <AssistantIcon />
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-surface px-3.5 py-2.5">
                <p className="text-[13.5px] leading-relaxed text-foreground">
                  Hi, I&apos;m DocUp&apos;s assistant. Ask me to filter posts by tag
                  or category, or just chat about the writing here.
                </p>
                <p className="mt-1.5 text-[11px] text-faint">Now</p>
              </div>
            </div>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-border bg-accent/90 px-3.5 py-2.5">
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-background">
                    {m.content}
                  </p>
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex items-end gap-2.5">
                <AssistantIcon />
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-surface px-3.5 py-2.5">
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-foreground">
                    {m.content}
                  </p>
                </div>
              </div>
            )
          )}

          {sending && (
            <div className="flex items-end gap-2.5">
              <AssistantIcon />
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint [animation-delay:240ms]" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Compose — pinned at bottom */}
        <footer className="shrink-0 border-t border-border bg-background p-3">
          {/* Quick Filter Suggestions Chips */}
          <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto py-0.5 text-nowrap scrollbar-none">
            <span className="shrink-0 text-[11px] font-medium text-faint">Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                className="shrink-0 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-muted transition-colors hover:border-accent hover:bg-surface-hover hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Textarea Input Container */}
          <div className="relative rounded-xl border border-border bg-surface focus-within:border-accent focus-within:bg-background transition-colors">
            <textarea
              ref={inputRef}
              rows={2}
              maxLength={400}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              placeholder="Ask anything…"
              className="w-full resize-none bg-transparent p-3 pb-8 text-[13.5px] text-foreground placeholder-faint focus:outline-none"
            />

            {/* Footer Bar inside Input Box */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
              <span className="text-[10px] font-medium text-faint">
                {draft.length}/400
              </span>
              <button
                type="button"
                onClick={() => void send()}
                disabled={!draft.trim() || sending}
                className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-[12px] font-medium text-background transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-faint"
              >
                <span>Send</span>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </footer>
      </aside>
    </>
  )

  return (
    <>
      {/* Top Header Launcher Button with Text */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close AI chat" : "Ask AI Assistant"}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[12px] font-medium transition-colors ${
          open
            ? "border-accent bg-surface-hover text-foreground"
            : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
        }`}
      >
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1m0-12.8l-2.1 2.1M5.6 18.4l2.1-2.1"
          />
        </svg>
        <span>Ask AI</span>
      </button>

      {mounted ? createPortal(drawerContent, document.body) : null}
    </>
  )
}
