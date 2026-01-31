import { NextRequest, NextResponse } from "next/server";
import { buildModePayload } from "@/lib/ai/prompts";

export const runtime = "edge";

interface ModeRequest {
  locale: string;
  mode: "smooth" | "funny" | "short" | "nerd" | "savage";
  userNotes?: string;
  extractedScreenshotText?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ModeRequest = await req.json();
    const { locale, mode, userNotes, extractedScreenshotText } = body;

    if (!mode) {
      return NextResponse.json(
        { error: "mode is required" },
        { status: 400 }
      );
    }

    // Build high-quality payload using DonLeo mode system prompt
    const payload = buildModePayload({
      locale: locale || "en",
      mode,
      screenshotText: extractedScreenshotText || "",
      userNotes,
    });

    // Call OpenAI API with tuned parameters for structured mode output
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
        temperature: 0.85, // Balanced: creative but focused
        presence_penalty: 0.5, // Moderate penalty on topic repetition
        frequency_penalty: 0.3, // Lighter penalty on token frequency (structured output)
        max_tokens: 550,
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
      mode,
      locale,
    });
  } catch (error) {
    console.error("Modes API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process mode request",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
