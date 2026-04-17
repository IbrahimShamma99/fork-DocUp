import type { TPost } from "./types"

export type TFeedMode = "tag" | "category" | "text"

export type TFeedParsed = {
  mode: TFeedMode
  modeChar: string
  term: string
  hasQuery: boolean
  hasFilter: boolean
  hasSuggestion: boolean
}

export function parseQuery(raw: string): TFeedParsed {
  const trimmed = raw.trim()
  const first = trimmed.charAt(0)

  if (first === "/") {
    return {
      mode: "tag",
      modeChar: "/",
      term: trimmed.slice(1).toLowerCase(),
      hasQuery: trimmed.length > 0,
      hasFilter: true,
      hasSuggestion: trimmed.length > 1,
    }
  }

  if (first === "#") {
    return {
      mode: "category",
      modeChar: "#",
      term: trimmed.slice(1).toLowerCase(),
      hasQuery: trimmed.length > 0,
      hasFilter: true,
      hasSuggestion: trimmed.length > 1,
    }
  }

  return {
    mode: "text",
    modeChar: "",
    term: trimmed.toLowerCase(),
    hasQuery: trimmed.length > 0,
    hasFilter: false,
    hasSuggestion: false,
  }
}

export function normalizePost(post: TPost) {
  return {
    title: (post.title || "").toLowerCase(),
    summary: (post.summary || "").toLowerCase(),
    tags: (post.tags || []).map((tag) => tag.toLowerCase()),
    category: (post.category || "").toLowerCase(),
  }
}

export function collectValues(
  posts: TPost[],
  mode: TFeedMode
): string[] {
  const set = new Set<string>()
  posts.forEach((post) => {
    const n = normalizePost(post)
    if (mode === "tag") n.tags.forEach((t) => set.add(t))
    else if (mode === "category" && n.category) set.add(n.category)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export function suggestMatches(
  posts: TPost[],
  mode: TFeedMode,
  term: string
): string[] {
  const q = term.toLowerCase()
  const list = collectValues(posts, mode)
  if (!q) return list
  return list.filter((item) => item.includes(q))
}

export function filterPosts(
  posts: TPost[],
  parsed: TFeedParsed
): TPost[] {
  if (!parsed.hasQuery) return posts

  if (!parsed.hasFilter) {
    const q = parsed.term
    return posts.filter((post) => {
      const n = normalizePost(post)
      return n.title.includes(q) || n.summary.includes(q)
    })
  }

  if (!parsed.hasSuggestion) return posts

  const q = parsed.term
  if (parsed.mode === "tag") {
    return posts.filter((post) =>
      normalizePost(post).tags.some((tag) => tag.includes(q))
    )
  }
  return posts.filter((post) =>
    normalizePost(post).category.includes(q)
  )
}
