import { NextRequest, NextResponse } from "next/server";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_TEXT_LENGTH = 500;
const SYNTHESIS_TIMEOUT = 10000;

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limit = checkRateLimit(`${ip}:synthesize`, { maxPerMinute: 10, maxPerDay: 100 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "rate_limited", message: "Too many requests. Wait a moment and try again." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((limit.retryAfterMs ?? 60000) / 1000)) },
        }
      );
    }

    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!key || !region) {
      return NextResponse.json(
        { error: "server_config", message: "Speech service is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { error: "empty_text", message: "No text provided." },
        { status: 400 }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "text_too_long", message: "Text is too long." },
        { status: 400 }
      );
    }

    const audioData = await Promise.race([
      synthesizeSpeech(key, region, text),
      timeout(SYNTHESIS_TIMEOUT),
    ]);

    if (audioData === null) {
      return NextResponse.json(
        { error: "timeout", message: "Synthesis took too long. Try again." },
        { status: 504 }
      );
    }

    return new Response(audioData, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "synthesis_failed", message: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}

function timeout(ms: number): Promise<null> {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

async function synthesizeSpeech(
  key: string,
  region: string,
  text: string
): Promise<ArrayBuffer> {
  const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
  speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
  speechConfig.speechSynthesisOutputFormat =
    sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

  return new Promise((resolve, reject) => {
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    synthesizer.speakTextAsync(
      text,
      (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(result.audioData);
        } else {
          reject(new Error(`Synthesis failed: ${result.reason}`));
        }
      },
      (error) => {
        synthesizer.close();
        reject(new Error(error));
      }
    );
  });
}
