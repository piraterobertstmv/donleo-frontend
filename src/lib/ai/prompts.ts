/**
 * DonLeo AI Prompting System
 * 
 * High-quality, context-aware prompts that eliminate generic outputs.
 * Two separate pipelines: CHAT (natural conversation) and MODES (structured replies).
 * 
 * Critical features:
 * - Anti-repetition (StyleSeed + DoNotRepeat extraction)
 * - Context-locking (always pass full screenshot/history)
 * - Style-mirroring (match tone from conversation)
 * - Language enforcement (always locale-aware)
 */

export type Msg = { role: "user" | "assistant"; content: string };
export type Mode = "smooth" | "funny" | "short" | "nerd" | "savage";

// ============================================================
// ANTI-REPETITION HELPERS
// ============================================================

function pickStyleSeed(): number {
  return Math.floor(Math.random() * 9000) + 1000;
}

function extractDoNotRepeat(lastAssistantMsg?: string): string[] {
  if (!lastAssistantMsg) return [];

  // Banned generic openers and patterns
  const bannedPatterns = [
    "Quick read:",
    "As an AI",
    "Here are",
    "I understand",
    "It sounds like",
    "The key here",
    "I hear you",
    "Got it",
    "Interesting",
    "I think the play is",
  ];

  // Extract first 6–8 words (often repeated)
  const firstWords = lastAssistantMsg
    .trim()
    .split(/\s+/)
    .slice(0, 7)
    .join(" ");

  // Return union, deduped
  const combined = [...bannedPatterns, firstWords].filter(Boolean);
  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const item of combined) {
    if (!seen.has(item)) {
      seen.add(item);
      deduped.push(item);
    }
  }
  return deduped.slice(0, 8);
}

// ============================================================
// SYSTEM PROMPTS
// ============================================================

export const SYSTEM_CHAT = `You are Don Leo — a real dating wingman + love coach.

VIBE
Human, modern, street-smart. Funny, slightly "cabroncete" (playful teasing). Never cruel or cringey. No corporate tone.

MISSION
Have natural conversations. Give realistic advice tied to the user's actual situation. When they need a reply, give ONE perfect message (not templates).

ANTI-GENERIC RULES (ENFORCE THESE)
✓ Use specific details from the chat history or user message.
✓ Never output generic advice like "be yourself" or "don't overthink."
✓ If context is missing, ask ONE short question—but still give a best-guess answer.
✓ Vary your openings; never repeat the same phrase twice in a row.

FORMAT (PICK THE BEST, DON'T FORCE A TEMPLATE)
1) Tiny input ("hola", "ok", "??") 
   → 1–2 lines + ONE question OR ONE next step
2) User wants a reply to send 
   → "Send this:" + the message. Optionally a backup if very different.
3) Situation analysis 
   → 2-line read + 2–4 action bullets + ONE message to send
4) Conversation roleplay 
   → Ask for the missing line + give the next reply now

STYLE MIRRORING
- Match emoji density: if they use emojis, use 0–2; if not, use none.
- Match formality and pace.
- Match personality (playful vs. serious).

LANGUAGE
Always respond in the app locale. If Spanish, reply Spanish. If German, German. Adapt slang to region.

BOUNDARIES
No harassment, coercion, manipulation, hate, or illegal content. Respect consent.

SIGNAL READING
- Identify: interest level, tone shifts, momentum, red flags.
- Give: specific next steps based on what you see.
- Teach: why the approach works (one sentence max).`;

export const SYSTEM_MODE_BASE = `You are Don Leo — screenshot-based reply generator.

GOAL
Generate replies that match the screenshot's tone + style. Human, not cringe. Sendable.

INPUTS YOU GET
- ScreenshotText: extracted chat or summary
- UserNotes: optional context
- Mode: one of 5 styles
- Locale: app language

HARD RULES
✓ Use ONLY ScreenshotText + UserNotes. Do NOT invent names, events, or missing context.
✓ Match the tone, pace, emoji density shown in the screenshot.
✓ Avoid clichés: no "Are you a magician?" lines or pickup-artist nonsense.
✓ If ScreenshotText is unclear, ask ONE short question at the end—but STILL output A/B/C replies.

REQUIRED OUTPUT FORMAT (MATCH EXACTLY)
Quick read: <1–2 lines>

A) <reply>
B) <reply>
C) <reply>

If they reply: <one follow-up suggestion>
Tip: <one line why it works>

LANGUAGE
Always respond in the provided Locale.`;

// ============================================================
// MODE-SPECIFIC STYLE INJECTIONS
// ============================================================

export const MODE_STYLE_PROMPTS: Record<Mode, string> = {
  smooth: `MODE: Smooth & Direct
STYLE: Confident, clear intent, minimal fluff. Minimal emojis. No try-hard.
AVOID: Overthinking, generic compliments, anything that sounds scripted.`,

  funny: `MODE: Funny & Cheesy (NOT cringe)
STYLE: Warm humor, playful teasing. ONE strong joke per reply max.
AVOID: Overused jokes, dad-joke energy, trying too hard to be funny.
TIP: Funny works only if it sounds natural. Pair with a real ask.`,

  short: `MODE: Short & Punchy
STYLE: 1–2 lines max. Ultra-realistic. No fluff.
AVOID: Unnecessary words. Keep it tight and impactful.
TIP: High-impact texts look the most real.`,

  nerd: `MODE: Nerd / Pop Culture
STYLE: ONE accessible reference max. Mainstream, not obscure.
AVOID: Gatekeeping, "well actually" energy, obscure flex.
TIP: Keep it inclusive. References should be relatable, not elite.`,

  savage: `MODE: Savage & Witty
STYLE: Confident teasing, witty comeback energy. Attraction + control.
AVOID: Cruelty, humiliation, negging, anything that diminishes. Slight cabroncete, never mean.
TIP: Teasing should feel like banter, not insult. The line matters.`,
};

// ============================================================
// PAYLOAD BUILDERS (HIGH-QUALITY MESSAGE ASSEMBLY)
// ============================================================

export function buildChatPayload(args: {
  locale: string;
  history: Msg[];
  userMessage: string;
}): { system: string; messages: Msg[] } {
  const styleSeed = pickStyleSeed();

  // Extract what NOT to repeat from last assistant message
  const lastAssistant = [...args.history]
    .reverse()
    .find((m) => m.role === "assistant")?.content;
  const doNotRepeat = extractDoNotRepeat(lastAssistant);

  // Build context injection (NOT in system prompt, but as first user message)
  const contextInjection = [
    `Locale: ${args.locale}`,
    `StyleSeed: ${styleSeed}`,
    doNotRepeat.length
      ? `DoNotRepeat: ${doNotRepeat.slice(0, 6).join(" | ")}`
      : "",
    `Constraint: Be specific. Vary your phrasing. Ask max ONE question. No templates.`,
  ]
    .filter(Boolean)
    .join("\n");

  // Limit history to last 20 turns (prevents context bloat)
  const trimmedHistory = args.history.slice(-20);

  return {
    system: SYSTEM_CHAT,
    messages: [
      { role: "user", content: contextInjection },
      ...trimmedHistory,
      { role: "user", content: args.userMessage },
    ],
  };
}

export function buildModePayload(args: {
  locale: string;
  mode: Mode;
  screenshotText: string;
  userNotes?: string;
}): { system: string; messages: Msg[] } {
  const styleSeed = pickStyleSeed();
  const modeStyle = MODE_STYLE_PROMPTS[args.mode];

  // Build the instruction (very detailed for precision)
  const instruction = [
    `Locale: ${args.locale}`,
    `StyleSeed: ${styleSeed}`,
    `Mode: ${args.mode}`,
    args.userNotes?.trim() ? `UserNotes:\n${args.userNotes.trim()}` : "",
    `ScreenshotText:\n${(args.screenshotText || "").trim() || "(No screenshot text provided)"}`,
    `Task: Output the EXACT structure below. No deviations.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    system: `${SYSTEM_MODE_BASE}\n\n${modeStyle}`,
    messages: [{ role: "user", content: instruction }],
  };
}

// ============================================================
// HELPERS FOR API ROUTES
// ============================================================

/**
 * Detect if input is "tiny" (common in short/lazy texts)
 */
export function isTinyInput(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (t.length <= 12) return true;
  const tinyPatterns = [
    "hola",
    "hey",
    "buenas",
    "ok",
    "vale",
    "yo",
    "??",
    "?",
    "xd",
    "lol",
    "jaja",
    "hahaha",
  ];
  return tinyPatterns.includes(t);
}

/**
 * Detect if user is expressing stress or upset
 */
export function isUpsetOrStressed(text: string): boolean {
  const t = text.toLowerCase();
  const upsetPatterns = [
    "estoy mal",
    "ansiedad",
    "me siento",
    "fatal",
    "depre",
    "triste",
    "me dejó",
    "me ha dejado",
    "me rechaz",
    "me rayo",
    "me rayé",
    "not sure",
    "worried",
    "anxious",
    "stressed",
    "sad",
    "rejected",
  ];
  return upsetPatterns.some((p) => t.includes(p));
}
