import type { TPost } from "@/app/lib/types"
import Image from "next/image"

export default function PostCard({ post }: { post: TPost }) {
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