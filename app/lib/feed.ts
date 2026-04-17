import type { TPost } from "./types"

export function normalizePost(post: TPost) {
  return {
    title: (post.title || "").toLowerCase(),
    tags: (post.tags || []).map((tag) => tag.toLowerCase()),
    category: (post.category || "").toLowerCase(),
  }
}

export function filterPosts(posts: TPost[], query: string): TPost[] {
  const q = query.trim().toLowerCase()
  return posts.filter((post) =>
    normalizePost(post).title.includes(q)
  )
}