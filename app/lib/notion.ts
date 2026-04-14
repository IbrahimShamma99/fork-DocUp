import { Client } from "@notionhq/client"
import type { TPost } from "./types"

function getTextProperty(prop: any): string {
  if (!prop) return ""
  const type = prop.type
  if (type === "title") {
    return (prop.title || []).map((t: any) => t.plain_text).join("")
  }
  if (type === "rich_text") {
    return (prop.rich_text || []).map((t: any) => t.plain_text).join("")
  }
  return ""
}

function getFirstTextProperty(props: Record<string, any>): string {
  for (const key of ["Name", "Title", "name", "title"]) {
    if (props[key]) {
      const value = getTextProperty(props[key])
      if (value) return value
    }
  }
  const titleProp = Object.values(props).find((p: any) => p?.type === "title")
  if (titleProp) return getTextProperty(titleProp)
  return ""
}

function getFileProperty(prop: any): string | undefined {
  if (!prop || prop.type !== "files" || !prop.files?.length) return undefined
  const file = prop.files[0]
  if (file.type === "external" && file.external?.url) return file.external.url
  if (file.type === "file" && file.file?.url) return file.file.url
  return undefined
}

let _notion: Client | undefined

function getClient(): Client | undefined {
  const token =
    process.env.NOTION_TOKEN || process.env.NEXT_PUBLIC_NOTION_TOKEN
  if (!token) return undefined
  if (!_notion) _notion = new Client({ auth: token })
  return _notion
}

let _dataSourceId: string | undefined

async function getDataSourceId(): Promise<string | undefined> {
  const databaseId =
    process.env.NOTION_DATABASE_ID || process.env.NEXT_PUBLIC_NOTION_PAGE_ID
  if (!databaseId) return undefined
  const notion = getClient()
  if (!notion) return undefined
  _dataSourceId = await resolveDataSource(notion, databaseId)
  return _dataSourceId
}

async function resolveDataSource(
  notion: Client,
  id: string
): Promise<string | undefined> {
  try {
    await notion.dataSources.retrieve({ data_source_id: id })
    return id
  } catch {
    // fall through to database lookup
  }
  try {
    const db: any = await notion.databases.retrieve({ database_id: id })
    const dataSourceId = db?.data_sources?.[0]?.id
    if (dataSourceId) return dataSourceId
  } catch (e) {
    console.error("Notion database retrieval failed:", (e as any).message)
  }
  return undefined
}

export async function getPosts(): Promise<TPost[]> {
  const notion = getClient()
  const dataSourceId = await getDataSourceId()
  if (!notion || !dataSourceId) {
    console.error("NOTION_DATABASE_ID (or NOTION_TOKEN) is not set")
    return []
  }

  let allResults: any[] = []
  let cursor: string | undefined

  try {
    do {
      const response: any = await notion.dataSources.query({
        data_source_id: dataSourceId,
        start_cursor: cursor,
        page_size: 100,
        result_type: "page",
      })
      allResults = allResults.concat(response.results)
      cursor = response.has_more ? response.next_cursor : undefined
    } while (cursor)
  } catch (e) {
    console.error("Failed to fetch Notion data source:", e)
    return []
  }

  return allResults.map((page: any) => {
    const props = page.properties || {}
    return {
      id: page.id,
      title: getFirstTextProperty(props),
      slug: getTextProperty(props.slug || props.Slug),
      summary: getTextProperty(props.summary || props.Summary),
      thumbnail: getFileProperty(props.thumbnail || props.Thumbnail),
      createdTime: page.created_time,
    }
  })
}