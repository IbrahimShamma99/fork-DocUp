import { NextResponse } from "next/server"

export const runtime = "nodejs"

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const MODEL = process.env.OPENROUTER_MODEL || "openrouter/auto"

const SYSTEM_PROMPT = [
  "You are the assistant for DocUp, a minimal blog built with Next.js and Notion.",
  "Readers can filter posts by tag (prefix \"/\", e.g. /ml or /nextjs) and by category (prefix \"#\", e.g. #essays or #notes).",
  "When asked about content, suggest specific filters where useful.",
  "Keep answers concise, warm, and clearly structured. Use plain sentences, not markdown blocks.",
].join("\n")

type ChatMessage = {
  role: "user" | "assistant" | "system"
  content: string
}

export async function POST(req: Request) {
  let body: { message?: unknown; messages?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  let incomingMessages: ChatMessage[] = []
  if (Array.isArray(body.messages)) {
    incomingMessages = body.messages
      .filter(
        (m): m is ChatMessage =>
          typeof m === "object" &&
          m !== null &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .map((m) => ({ role: m.role, content: m.content.trim() }))
  } else if (typeof body.message === "string" && body.message.trim()) {
    incomingMessages = [{ role: "user", content: body.message.trim() }]
  }

  if (incomingMessages.length === 0) {
    return NextResponse.json(
      { error: "At least one message is required" },
      { status: 400 }
    )
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    const lastUserMessage = [...incomingMessages].reverse().find((m) => m.role === "user")?.content || ""
    const lower = lastUserMessage.toLowerCase()
    let fallbackReply = "Chat isn't configured yet — add OPENROUTER_API_KEY to .env.local and restart the dev server."

    if (lower.startsWith("/") || lower.includes("tag")) {
      fallbackReply = "You can filter posts by tag by typing / (e.g. /ml or /nextjs) in the search bar!"
    } else if (lower.startsWith("#") || lower.includes("category") || lower.includes("categories")) {
      fallbackReply = "You can filter posts by category by typing # (e.g. #essays or #notes) in the search bar!"
    } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
      fallbackReply = "Hello! I am DocUp's assistant. Ask me about filtering posts by tags (/ml, /nextjs) or categories (#essays, #notes)."
    }

    return NextResponse.json({ reply: fallbackReply })
  }

  const payload = {
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...incomingMessages,
    ],
    max_tokens: 512,
  }

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "DocUp",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return NextResponse.json(
        { error: `OpenRouter ${res.status}: ${text.slice(0, 200)}` },
        { status: 502 }
      )
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const reply = data?.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return NextResponse.json(
        { error: "Empty reply from model" },
        { status: 502 }
      )
    }

    return NextResponse.json({ reply })
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "OpenRouter request failed",
      },
      { status: 502 }
    )
  }
}
