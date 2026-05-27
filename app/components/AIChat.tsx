"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const drawerContent = (
    <>
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
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
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-4">
          <span className="text-[14px] font-semibold text-foreground">AI Chat</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-5" />
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