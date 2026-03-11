import { NextRequest, NextResponse } from "next/server";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { checkRateLimit } from "@/lib/rateLimit";

interface PhonemeResult {
  phoneme: string;
  accuracyScore: number;
}

interface WordResult {
  word: string;
  accuracyScore: number;
  errorType: string;
  phonemes: PhonemeResult[];
}

interface AssessmentResult {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  words: WordResult[];
}

const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10 MB
const ANALYSIS_TIMEOUT = 15000; // 15 seconds

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP: 20 requests per minute
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limit = checkRateLimit(ip);
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

    const audioBytes = await request.arrayBuffer();

    if (audioBytes.byteLength === 0) {
      return NextResponse.json(
        { error: "empty_audio", message: "No audio data received." },
        { status: 400 }
      );
    }

    if (audioBytes.byteLength > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: "audio_too_large", message: "Audio file is too large." },
        { status: 400 }
      );
    }

    // Audio arrives as WAV (converted client-side)
    const result = await Promise.race([
      runAssessment(key, region, audioBytes),
      timeout(ANALYSIS_TIMEOUT),
    ]);

    if (result === null) {
      return NextResponse.json(
        { error: "timeout", message: "Analysis took too long. Try again." },
        { status: 504 }
      );
    }

    if (result.words.length === 0) {
      return NextResponse.json(
        { error: "no_speech", message: "No speech detected. Try speaking louder." },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "assessment_failed", message: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}

function timeout(ms: number): Promise<null> {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

async function runAssessment(
  key: string,
  region: string,
  wavBuffer: ArrayBuffer
): Promise<AssessmentResult> {
  const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
  speechConfig.speechRecognitionLanguage = "en-US";

  const pushStream = sdk.AudioInputStream.createPushStream(
    sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
  );
  pushStream.write(wavBuffer);
  pushStream.close();

  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

  const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
    "",
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    false
  );
  pronunciationConfig.enableProsodyAssessment = true;

  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  pronunciationConfig.applyTo(recognizer);

  const allWords: WordResult[] = [];
  let overallScores = {
    accuracyScore: 0,
    fluencyScore: 0,
    completenessScore: 0,
    prosodyScore: 0,
  };

  await new Promise<void>((resolve, reject) => {
    recognizer.recognized = (_s, e) => {
      if (
        e.result.reason === sdk.ResultReason.RecognizedSpeech &&
        e.result.text
      ) {
        const pronResult =
          sdk.PronunciationAssessmentResult.fromResult(e.result);

        overallScores = {
          accuracyScore: pronResult.accuracyScore,
          fluencyScore: pronResult.fluencyScore,
          completenessScore: pronResult.completenessScore,
          prosodyScore: pronResult.prosodyScore,
        };

        const detailJson = e.result.properties.getProperty(
          sdk.PropertyId.SpeechServiceResponse_JsonResult
        );
        const detail = JSON.parse(detailJson);
        const nBest = detail?.NBest?.[0];

        if (nBest?.Words) {
          for (const w of nBest.Words) {
            allWords.push({
              word: w.Word,
              accuracyScore: w.PronunciationAssessment?.AccuracyScore ?? 0,
              errorType: w.PronunciationAssessment?.ErrorType ?? "Unknown",
              phonemes: (w.Phonemes ?? []).map(
                (p: {
                  Phoneme: string;
                  PronunciationAssessment?: { AccuracyScore?: number };
                }) => ({
                  phoneme: p.Phoneme,
                  accuracyScore:
                    p.PronunciationAssessment?.AccuracyScore ?? 0,
                })
              ),
            });
          }
        }
      }
    };

    recognizer.canceled = (_s, e) => {
      recognizer.close();
      if (e.reason === sdk.CancellationReason.Error) {
        reject(new Error(e.errorDetails));
      } else {
        resolve();
      }
    };

    recognizer.sessionStopped = () => {
      recognizer.close();
      resolve();
    };

    recognizer.startContinuousRecognitionAsync(
      () => {},
      (err) => reject(new Error(err))
    );
  });

  return { ...overallScores, words: allWords };
}
