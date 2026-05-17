import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPostBySlug } from "../lib/notion"
import TopBar from "../components/TopBar"

export const dynamic = "force-dynamic"

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return ""
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getPostBySlug(slug)
  if (!data) return { title: "Not Found" }
  return { title: `${data.post.title} | DocUp` }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getPostBySlug(slug)
  if (!data) notFound()

  const { post } = data
  const date = post.date?.start_date || post.createdTime

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-foreground"
        >
          ← Back to feed
        </Link>

        <article>
          <header className="mb-8">
            <h1 className="text-[30px] font-bold leading-tight tracking-tight text-foreground">
              {post.title}
            </h1>
            <div className="mt-2 flex items-center gap-1.5 text-[14px] text-muted">
              <time>{formatDate(date)}</time>
              {post.summary && (
                <>
                  <span className="text-faint">·</span>
                  <span>{post.summary}</span>
                </>
              )}
            </div>
          </header>
        </article>
      </main>
    </div>
  )
}