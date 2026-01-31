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

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    // Call backend AI endpoint instead of OpenAI directly
    const backendResponse = await fetch(`${backendUrl}/api/ai/modes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locale: locale || "en",
        mode,
        userNotes,
        extractedScreenshotText,
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
