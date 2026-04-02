import TopBar from "./components/TopBar"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto w-full max-w-2xl px-4 pb-24">
        <section className="pt-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            DocUp
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            A minimal blog powered by Notion. Posts coming soon.
          </p>
        </section>
      </main>
    </div>
  )
}