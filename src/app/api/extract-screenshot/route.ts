import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { images } = body

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "images array (base64) is required" },
        { status: 400 }
      )
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

    const backendResponse = await fetch(`${backendUrl}/api/ai/extract-screenshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images }),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: "Extract failed", details: errorData },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json({ text: data.text || "" })
  } catch (error) {
    console.error("Extract API error:", error)
    return NextResponse.json(
      {
        error: "Failed to extract text",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
