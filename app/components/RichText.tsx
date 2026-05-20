type RichTextItem = {
  plain_text: string
  href?: string | null
  annotations?: {
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
    code?: boolean
  }
}

function renderSpan(item: RichTextItem, key: number) {
  let node: React.ReactNode = item.plain_text
  const a = item.annotations || {}

  if (a.code) {
    node = (
      <code
        key={key}
        className="rounded bg-surface px-[0.3em] py-[0.1em] font-mono text-[0.9em]"
      >
        {node}
      </code>
    )
  }
  if (a.bold) node = <strong key={key}>{node}</strong>
  if (a.italic) node = <em key={key}>{node}</em>
  if (a.strikethrough) node = <del key={key}>{node}</del>
  if (a.underline) node = <u key={key}>{node}</u>
  if (item.href) {
    node = (
      <a
        key={key}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline underline-offset-2 decoration-accent/40 hover:decoration-accent"
      >
        {node}
      </a>
    )
  }
  return node
}

export default function RichText({ rich_text }: { rich_text?: RichTextItem[] }) {
  if (!rich_text?.length) return null
  return (
    <>
      {rich_text.map((item, i) => renderSpan(item, i))}
    </>
  )
}