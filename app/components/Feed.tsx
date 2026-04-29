"use client"

import { useState } from "react"
import type { TPost } from "@/app/lib/types"
import PostCard from "./PostCard"

function pluralize(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}

export default function Feed({ posts }: { posts: TPost[] }) {
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()
  const filteredPosts = q
    ? posts.filter((post) =>
        (post.title || "").toLowerCase().includes(q) ||
        (post.summary || "").toLowerCase().includes(q)
      )
    : posts

  const count = filteredPosts.length
  const total = posts.length

  return (
    <div className="w-full pt-16">
      <section className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          DocUp
        </h1>
      </section>

      <div className="relative mb-4">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full rounded-lg border border-border bg-surface py-[7px] pl-9 pr-12 text-[15px] text-foreground placeholder-faint transition-colors focus:border-accent focus:bg-background focus:outline-none"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 gap-1">
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px] font-medium text-faint">
            Search
          </kbd>
        </div>
      </div>

      <p className="mb-4 text-[12px] text-faint">
        {pluralize(count, "post")} of {pluralize(total, "post")}
      </p>

      {count === 0 ? (
        <p className="py-24 text-center text-[15px] text-muted">
          No posts found.
        </p>
      ) : (
        <div className="flex flex-col">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}