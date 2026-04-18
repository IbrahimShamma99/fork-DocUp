import type { TPost } from "@/app/lib/types"
import Image from "next/image"

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

export default function PostCard({ post }: { post: TPost }) {
  const date = post.date?.start_date || post.createdTime

  return (
    <div className="group flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-surface">
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[15px] font-medium text-foreground group-hover:text-accent">
          {post.title}
        </h2>
        {post.summary && (
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {post.summary}
          </p>
        )}
        <time className="mt-1 block text-[12px] text-faint">
          {formatDate(date)}
        </time>
      </div>
      {post.thumbnail && (
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md">
          <Image
            src={post.thumbnail}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
    </div>
  )
}