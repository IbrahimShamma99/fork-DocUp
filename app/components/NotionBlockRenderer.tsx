import Image from "next/image"
import RichText from "./RichText"

type BlockType = {
  id: string
  type: string
  children?: BlockType[]
  object?: string
  [key: string]: any
}

function getTexts(block: BlockType): any[] | undefined {
  const data = block[block.type]
  return data?.rich_text
}

function BlockImage({ block }: { block: BlockType }) {
  const img = block.image
  const url = img?.external?.url || img?.file?.url
  const caption = img?.caption
  if (!url) return null
  return (
    <figure className="my-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
        <Image
          src={url}
          alt={caption?.map((c: any) => c.plain_text).join("") || ""}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
      {caption?.length ? (
        <figcaption className="mt-2 text-center text-[13px] text-muted">
          <RichText rich_text={caption} />
        </figcaption>
      ) : null}
    </figure>
  )
}

function BlockTable({ block }: { block: BlockType }) {
  const rows = block.children?.filter((c) => c.type === "table_row") || []
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-[14px]">
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className="border-b border-border last:border-b-0 odd:bg-surface/50"
            >
              {(row.table_row?.cells || []).map((cell: any[], j: number) => (
                <td key={j} className="px-3 py-2 align-top">
                  <RichText rich_text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BlockCode({ block }: { block: BlockType }) {
  const code = block.code
  const language = code?.language || "text"
  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border bg-surface">
      {language !== "text" && (
        <div className="flex items-center border-b border-border px-4 py-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
            {language}
          </span>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-[14px] leading-relaxed text-foreground">
        <code className="font-mono">
          {code?.rich_text?.map((t: any) => t.plain_text).join("")}
        </code>
      </pre>
    </div>
  )
}

function BlockCallout({ block }: { block: BlockType }) {
  const callout = block.callout
  const icon =
    callout?.icon?.type === "emoji" ? callout.icon.emoji : null
  return (
    <div className="my-6 flex gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      {icon && <span className="text-[18px] leading-relaxed">{icon}</span>}
      <div className="flex-1 min-w-0">
        <RichText rich_text={callout?.rich_text} />
        <BlockChildren children={block.children} />
      </div>
    </div>
  )
}

function BlockLink({
  href,
  caption,
  title,
}: {
  href?: string
  caption?: any[]
  title: string
}) {
  if (!href) return null
  return (
    <div className="my-6">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border border-border p-3 transition-colors hover:bg-surface"
      >
        <div className="text-[14px] font-medium text-foreground">
          {caption?.length ? <RichText rich_text={caption} /> : title}
        </div>
        <div className="mt-1 truncate text-[12px] text-faint">
          {href}
        </div>
      </a>
    </div>
  )
}

const headingClasses: Record<string, string> = {
  heading_1: "mt-10 mb-1 text-[30px] font-bold tracking-tight",
  heading_2: "mt-8 mb-1 text-[22px] font-bold",
  heading_3: "mt-6 mb-1 text-[19px] font-semibold",
}

function NotionBlockRenderer({ block }: { block: BlockType }) {
  const type = block.type
  const texts = getTexts(block)

  switch (type) {
    case "bulleted_list_item":
    case "numbered_list_item":
    case "table_row":
      return null
    case "paragraph":
      if (!texts?.length) return <div className="h-6" />
      return (
        <p className="my-[5px] leading-[1.65]">
          <RichText rich_text={texts} />
        </p>
      )
    case "heading_1":
    case "heading_2":
    case "heading_3":
      return (
        <div id={block.id} className={headingClasses[type]}>
          <RichText rich_text={texts} />
        </div>
      )
    case "to_do":
      return (
        <div className="my-[5px] flex items-start gap-[6px] leading-[1.65]">
          <input
            type="checkbox"
            checked={block.to_do?.checked || false}
            readOnly
            className="mt-[5px] h-[15px] w-[15px] shrink-0 accent-accent"
          />
          <div className={block.to_do?.checked ? "line-through opacity-60" : ""}>
            <RichText rich_text={texts} />
          </div>
        </div>
      )
    case "code":
      return <BlockCode block={block} />
    case "quote":
      return (
        <blockquote className="my-6 border-l-[3px] border-faint/60 pl-4 text-[16px] leading-[1.65]">
          <RichText rich_text={texts} />
        </blockquote>
      )
    case "callout":
      return <BlockCallout block={block} />
    case "image":
      return <BlockImage block={block} />
    case "divider":
      return <hr className="my-8 border-border" />
    case "table":
      return <BlockTable block={block} />
    case "toggle":
      return (
        <details className="my-2">
          <summary className="cursor-pointer py-[5px] text-[16px] font-medium leading-[1.65]">
            <RichText rich_text={texts} />
          </summary>
          {block.children?.length ? (
            <div className="mt-1 ml-6">
              <BlockChildren children={block.children} />
            </div>
          ) : null}
        </details>
      )
    case "bookmark":
      return (
        <BlockLink href={block.bookmark?.url} caption={texts} title="Bookmark" />
      )
    case "embed":
    case "video":
    case "audio":
      return (
        <BlockLink
          href={block[type]?.url}
          caption={block[type]?.caption}
          title={type}
        />
      )
    case "pdf":
    case "file":
      return (
        <BlockLink
          href={block[type]?.file?.url || block[type]?.external?.url}
          caption={block[type]?.caption}
          title={type}
        />
      )
    case "equation":
      return (
        <div className="my-6 overflow-x-auto rounded-lg bg-surface px-4 py-3 text-center font-mono text-[15px]">
          {block.equation?.expression}
        </div>
      )
    case "child_page":
    case "child_database":
      return null
    default:
      if (block[type]?.rich_text?.length) {
        return (
          <p className="my-[5px] leading-[1.65]">
            <RichText rich_text={block[type].rich_text} />
          </p>
        )
      }
      return null
  }
}

function BlockChildren({ children }: { children?: BlockType[] }) {
  if (!children?.length) return null
  return <>{renderBlocks(children)}</>
}

export function renderBlocks(blocks: BlockType[]) {
  const out: React.ReactNode[] = []
  let i = 0
  while (i < blocks.length) {
    const type = blocks[i].type
    if (type === "bulleted_list_item" || type === "numbered_list_item") {
      const group: BlockType[] = []
      while (i < blocks.length && blocks[i].type === type) {
        group.push(blocks[i])
        i++
      }
      const Tag = type === "bulleted_list_item" ? "ul" : "ol"
      out.push(
        <Tag
          key={group[0].id}
          className={`my-2 space-y-[2px] pl-[22px] leading-[1.65] ${
            type === "bulleted_list_item"
              ? "list-[disc]"
              : "list-[decimal]"
          }`}
        >
          {group.map((b) => (
            <li key={b.id}>
              <RichText rich_text={getTexts(b)} />
              <BlockChildren children={b.children} />
            </li>
          ))}
        </Tag>
      )
    } else {
      out.push(<NotionBlockRenderer key={blocks[i].id} block={blocks[i]} />)
      i++
    }
  }
  return out
}

export default NotionBlockRenderer