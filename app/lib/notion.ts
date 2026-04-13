import { Client } from "@notionhq/client"
import type { TPost } from "./types"

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
      title: getTitleProperty(props),
      slug: getSlugProperty(props),
      summary: getSummaryProperty(props),
      thumbnail: getThumbnailProperty(props),
      createdTime: page.created_time,
    }
  })
}

function getTitleProperty(props: Record<string, any>): string {
  return (props.title?.title || []).map((t: any) => t.plain_text).join("")
}

function getSlugProperty(props: Record<string, any>): string {
  return (props.slug?.rich_text || []).map((t: any) => t.plain_text).join("")
}

function getSummaryProperty(props: Record<string, any>): string {
  const p = props.summary || props.Summary
  return (p?.rich_text || []).map((t: any) => t.plain_text).join("")
}

function getThumbnailProperty(props: Record<string, any>): string | undefined {
  const p = props.thumbnail || props.Thumbnail
  if (!p || p.type !== "files" || !p.files?.length) return undefined
  const file = p.files[0]
  if (file.type === "external" && file.external?.url) return file.external.url
  if (file.type === "file" && file.file?.url) return file.file.url
  return undefined
}