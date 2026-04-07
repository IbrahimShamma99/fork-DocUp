import { getPosts } from "./lib/notion"
import Feed from "./components/Feed"
import TopBar from "./components/TopBar"

export const dynamic = "force-dynamic"

export default async function Home() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto w-full max-w-2xl px-4 pb-24">
        <Feed posts={posts} />
      </main>
    </div>
  )
}