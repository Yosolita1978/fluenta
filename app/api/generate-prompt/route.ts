import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

const VALID_LEVELS = ["beginner", "intermediate", "expert"] as const;
const GENERATION_TIMEOUT = 10000;

const SYSTEM_PROMPT = `You generate English pronunciation practice sentences for language learners. Return ONLY the sentence — no quotes, no explanation, no punctuation other than what belongs in the sentence.

Rules per level:
- beginner: 5–10 words, everyday vocabulary, simple grammar. Example: "Can I have a glass of water?"
- intermediate: 10–20 words, varied vocabulary, compound or complex sentences. Example: "The conference was postponed because several speakers canceled at the last minute."
- expert: 15–30 words, challenging phonetics, idioms, technical or academic language. Example: "The entrepreneur thoroughly analyzed the pharmaceutical company's quarterly earnings before restructuring the portfolio."`;

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limit = checkRateLimit(`${ip}:generate`, { maxPerMinute: 5, maxPerDay: 50 });
    if (!limit.allowed) {
      return NextResponse.json(
        { sentence: null, error: "rate_limited" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((limit.retryAfterMs ?? 60000) / 1000)) },
        }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { sentence: null, error: "not_configured" },
        { status: 200 }
      );
    }

    const level = request.nextUrl.searchParams.get("level");
    if (!level || !VALID_LEVELS.includes(level as (typeof VALID_LEVELS)[number])) {
      return NextResponse.json(
        { sentence: null, error: "invalid_level" },
        { status: 400 }
      );
    }

    const model = process.env.OPENAI_MODEL || "gpt-4";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GENERATION_TIMEOUT);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Generate one ${level} level pronunciation practice sentence.` },
        ],
        max_tokens: 150,
        temperature: 0.9,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      return NextResponse.json(
        { sentence: null, error: "generation_failed" },
        { status: 200 }
      );
    }

    const data = await response.json();
    const sentence = data.choices?.[0]?.message?.content?.trim();

    if (!sentence) {
      return NextResponse.json(
        { sentence: null, error: "generation_failed" },
        { status: 200 }
      );
    }

    return NextResponse.json({ sentence });
  } catch {
    return NextResponse.json(
      { sentence: null, error: "generation_failed" },
      { status: 200 }
    );
  }
}
