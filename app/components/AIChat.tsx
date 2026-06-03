"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

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
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

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
            {closeButton}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-5">
          <div ref={endRef} />
        </div>
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