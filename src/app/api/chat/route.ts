import { NextRequest, NextResponse } from "next/server";
import { buildChatPayload } from "@/lib/ai/prompts";

export const runtime = "edge";

interface ChatRequest {
  locale: string;
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>;
  userMessage: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { locale, chatHistory, userMessage } = body;

    if (!userMessage?.trim()) {
      return NextResponse.json(
        { error: "userMessage is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Build high-quality payload using DonLeo system prompt
    const payload = buildChatPayload({
      locale: locale || "en",
      history: chatHistory || [],
      userMessage,
    });

    // Call OpenAI API with tuned parameters for chat
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: payload.system },
          ...payload.messages,
        ],
        temperature: 0.9, // Higher = more creative, less repetitive
        presence_penalty: 0.7, // Penalize repeating same topics
        frequency_penalty: 0.4, // Moderate penalty on token frequency
        max_tokens: 450,
        top_p: 0.95,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "OpenAI API call failed", details: errorData },
        { status: openaiResponse.status }
      );
    }

    const data = await openaiResponse.json();
    const response = data.choices?.[0]?.message?.content || "";

    if (!response) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
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
