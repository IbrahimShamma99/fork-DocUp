"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

type TMessage = { id: number; role: "user" | "assistant"; content: string }

let nextId = 1

const SUGGESTIONS = ["/ml", "/nextjs", "????", "#essays", "#notes", "/react", "#dev"]

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

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<TMessage[]>([])
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, sending, open])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  const replaceQuery = (curr: string, slot: string) => {
    const pattern = /\/\s(?=\S)|#\s(?=\S)|(?<=^|\s)[a-z0-9]+/gi
    let replaced = false
    const next = curr.replace(pattern, (m) => {
      if (replaced) return m
      replaced = true
      return m.trim().startsWith("/") || m.trim().startsWith("#") ? slot : slot
    })
    return replaced ? next.trim() : curr.length ? `${curr.replace(/\s*$/, "")} ${slot}` : slot
  }

  const applySuggestion = (slot: string) => {
    setDraft((d) => replaceQuery(d, slot))
    inputRef.current?.focus()
  }

  const send = async () => {
    const text = draft.trim()
    if (!text || sending) return

    setError(null)
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
        setError(data.error || `Request failed (${res.status})`)
        return
      }

      setMessages((m) => [
        ...m,
        { id: nextId++, role: "assistant", content: data.reply || "…" },
      ])
    } catch {
      setError("Network error — the server might be offline.")
    } finally {
      setSending(false)
    }
  }

  const closeButton = (
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
  )

  const drawerContent = (
    <>
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/20 transition-all duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0 invisible"
        }`}
      />
      <aside
        aria-hidden={!open}
        tabIndex={open ? undefined : -1}
        className={`fixed bottom-0 right-0 z-50 flex w-full flex-col bg-background shadow-2xl transition-all duration-300
          left-0 top-auto h-[85vh] max-h-[85vh] rounded-t-2xl border-t border-border
          sm:left-auto sm:top-12 sm:h-[calc(100dvh-48px)] sm:max-h-none sm:max-w-[320px] sm:rounded-none sm:border-l sm:border-t-0
          ${
            open
              ? "translate-y-0 sm:translate-x-0 sm:translate-y-0 opacity-100"
              : "translate-y-full sm:translate-x-full sm:translate-y-0 opacity-0 invisible"
          }`}
      >
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
                onClick={() => {
                  setMessages([])
                  setError(null)
                }}
                title="Clear chat"
                aria-label="Clear chat"
                className="flex h-7 px-2 items-center justify-center rounded-md text-[11px] font-medium text-faint transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                Clear
              </button>
            )}
            {closeButton}
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-background px-4 py-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <AssistantIcon />
              <div>
                <p className="text-[14px] font-semibold text-foreground">
                  Ask me anything
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                  I can summarize posts, find topics, and help you explore
                  the blog.
                </p>
              </div>

              <div className="mt-2 flex max-w-[240px] flex-wrap items-center justify-center gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => applySuggestion(s)}
                    className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11.5px] font-medium text-muted transition-colors hover:border-accent hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] leading-relaxed text-red-500">
              {error}
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-end gap-2.5 ${
                m.role === "user" ? "justify-end" : ""
              }`}
            >
              {m.role === "assistant" && <AssistantIcon />}
              <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-[13.5px] leading-relaxed text-foreground">
                {m.content}
              </p>
            </div>
          ))}

          {sending && (
            <div className="flex items-end gap-2.5">
              <AssistantIcon />
              <div className="flex gap-1 rounded-2xl border border-border bg-surface px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint [animation-delay:240ms]" />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Compose */}
        <footer className="shrink-0 border-t border-border bg-background p-3">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {SUGGESTIONS.slice(0, 4).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => applySuggestion(s)}
                className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted transition-colors hover:border-accent hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>

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
        <span>Ask AI</span>
      </button>

      {mounted ? createPortal(drawerContent, document.body) : null}
    </>
  )
}