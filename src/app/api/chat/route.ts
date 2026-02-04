import { NextRequest, NextResponse } from "next/server";
import { buildChatPayload } from "@/lib/ai/prompts";

export const runtime = "edge";

interface ChatRequest {
  locale: string;
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>;
  userMessage: string;
  images?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { locale, chatHistory, userMessage, images } = body;

    const hasText = Boolean(userMessage?.trim());
    const hasImages = Boolean(images?.length);

    if (!hasText && !hasImages) {
      return NextResponse.json(
        { error: "userMessage or images is required" },
        { status: 400 }
      );
    }

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    // Call backend AI endpoint instead of OpenAI directly
    const backendResponse = await fetch(`${backendUrl}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locale: locale || "en",
        chatHistory: chatHistory || [],
        userMessage: userMessage || "",
        images: images || [],
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error("Backend API error:", errorData);
      return NextResponse.json(
        { error: "Backend API call failed", details: errorData },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    const response = data.response || "";

    if (!response) {
      return NextResponse.json(
        { error: "No response from backend" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response,
      locale,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
