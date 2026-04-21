"use client"

import type { TPost } from "@/app/lib/types"
import PostCard from "./PostCard"

function pluralize(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}

export default function Feed({ posts }: { posts: TPost[] }) {
  const count = posts.length

  return (
    <div className="w-full pt-16">
      <section className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          DocUp
        </h1>
      </section>

      <p className="mb-4 text-[12px] text-faint">
        {pluralize(count, "post")}
      </p>

      <div className="flex flex-col">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}