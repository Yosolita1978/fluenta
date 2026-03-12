import { useState, useCallback } from "react";
import { blobToWavBuffer } from "@/lib/audioUtils";

export interface PhonemeResult {
  phoneme: string;
  accuracyScore: number;
}

export interface WordResult {
  word: string;
  accuracyScore: number;
  errorType: string;
  phonemes: PhonemeResult[];
}

export interface AssessmentResult {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  words: WordResult[];
}

export type AssessmentError =
  | "no_speech"
  | "timeout"
  | "rate_limited"
  | "network"
  | "unknown";

type AssessmentStatus = "idle" | "analyzing" | "done" | "error";

interface UseAssessmentReturn {
  status: AssessmentStatus;
  result: AssessmentResult | null;
  error: AssessmentError | null;
  errorMessage: string | null;
  analyze: (audioBlob: Blob, referenceText?: string) => Promise<void>;
  reset: () => void;
}

const ERROR_MESSAGES: Record<AssessmentError, string> = {
  no_speech: "No speech detected. Try speaking louder.",
  timeout: "Analysis took too long. Try again.",
  rate_limited: "Too many requests. Wait a moment and try again.",
  network: "Connection failed. Check your internet.",
  unknown: "Something went wrong. Try again.",
};

export function usePronunciationAssessment(): UseAssessmentReturn {
  const [status, setStatus] = useState<AssessmentStatus>("idle");
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<AssessmentError | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const analyze = useCallback(async (audioBlob: Blob, referenceText?: string) => {
    setStatus("analyzing");
    setResult(null);
    setError(null);
    setErrorMessage(null);

    try {
      // Convert to WAV client-side (needs AudioContext)
      const wavBuffer = await blobToWavBuffer(audioBlob);
      const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

      const headers: Record<string, string> = {
        "Content-Type": "audio/wav",
      };
      if (referenceText) {
        headers["X-Reference-Text"] = referenceText;
      }

      const response = await fetch("/api/assess", {
        method: "POST",
        headers,
        body: wavBlob,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const serverError = body.error as string | undefined;

        if (serverError === "no_speech") {
          setError("no_speech");
          setErrorMessage(ERROR_MESSAGES.no_speech);
        } else if (serverError === "timeout") {
          setError("timeout");
          setErrorMessage(ERROR_MESSAGES.timeout);
        } else if (serverError === "rate_limited") {
          setError("rate_limited");
          setErrorMessage(ERROR_MESSAGES.rate_limited);
        } else {
          setError("unknown");
          setErrorMessage(body.message || ERROR_MESSAGES.unknown);
        }
        setStatus("error");
        return;
      }

      const data: AssessmentResult = await response.json();
      setResult(data);
      setStatus("done");
    } catch (err) {
      if (err instanceof TypeError) {
        setError("network");
        setErrorMessage(ERROR_MESSAGES.network);
      } else {
        setError("unknown");
        setErrorMessage(ERROR_MESSAGES.unknown);
      }
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setErrorMessage(null);
  }, []);

  return { status, result, error, errorMessage, analyze, reset };
}
