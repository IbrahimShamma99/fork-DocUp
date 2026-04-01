import Link from "next/link"

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-12 w-full max-w-3xl items-center justify-between gap-2 px-4">
        <Link
          href="/"
          className="shrink-0 text-[14px] font-semibold text-foreground transition-colors hover:text-muted"
        >
          DocUp
        </Link>
      </div>
    </header>
  )
}