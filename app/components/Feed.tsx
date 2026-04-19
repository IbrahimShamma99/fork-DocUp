"use client"

import type { TPost } from "@/app/lib/types"
import PostCard from "./PostCard"

export default function Feed({ posts }: { posts: TPost[] }) {
  return (
    <div className="w-full pt-16">
      <section className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          DocUp
        </h1>
      </section>

      <div className="flex flex-col">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}