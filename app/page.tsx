"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRecorder } from "@/hooks/useRecorder";
import {
  usePronunciationAssessment,
  AssessmentResult,
  WordResult,
} from "@/hooks/usePronunciationAssessment";
import { Level, getRandomSentence } from "@/lib/sentences";
import { useTts } from "@/hooks/useTts";

/* ─── Helpers ─── */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function scoreColor(score: number): string {
  if (score >= 80) return "var(--accent-mint)";
  if (score >= 60) return "var(--accent-amber)";
  return "var(--accent-red)";
}

function scoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Great";
  if (score >= 60) return "Fair";
  return "Needs work";
}

/* ─── Score Arc ─── */

function ScoreArc({
  label,
  score,
  hint,
  delay = 0,
}: {
  label: string;
  score: number;
  hint: string;
  delay?: number;
}) {
  const size = 88;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const offset = circumference - filled;
  const color = scoreColor(score);

  return (
    <div
      className="animate-slide-up flex flex-col items-center gap-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{
              animation: `score-fill 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay + 200}ms forwards`,
              ["--circumference" as string]: circumference,
              ["--target-offset" as string]: offset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-xl font-semibold"
            style={{ color }}
          >
            {Math.round(score)}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium tracking-wide uppercase"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      <span
        className="text-[9px] text-center leading-tight max-w-[80px]"
        style={{ color: "var(--text-muted)" }}
      >
        {hint}
      </span>
    </div>
  );
}

/* ─── Word Breakdown ─── */

function WordBreakdown({
  words,
  onPlayWord,
  playingWord,
}: {
  words: WordResult[];
  onPlayWord?: (word: string) => void;
  playingWord?: string | null;
}) {
  return (
    <div
      className="animate-slide-up flex flex-col gap-4"
      style={{ animationDelay: "500ms" }}
    >
      <h2
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        Word by word
      </h2>
      <p
        className="text-xs leading-relaxed -mt-1"
        style={{ color: "var(--text-muted)" }}
      >
        Green words sounded great. Red words need practice — check the sounds underneath for what to focus on.
      </p>
      <div className="flex flex-wrap gap-2">
        {words.map((w, i) => {
          const isLow = w.accuracyScore < 70;
          return (
            <div
              key={i}
              className="animate-pop-in flex flex-col items-center"
              style={{ animationDelay: `${600 + i * 60}ms` }}
            >
              <span
                className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all inline-flex items-center gap-1.5 ${isLow ? "cursor-pointer" : ""}`}
                style={{
                  background: isLow ? "var(--accent-red-dim)" : "var(--accent-mint-dim)",
                  color: isLow ? "var(--accent-red)" : "var(--accent-mint)",
                  animation: isLow && playingWord === w.word ? "fade-pulse 1.4s ease-in-out infinite" : "none",
                }}
                onClick={isLow ? () => onPlayWord?.(w.word) : undefined}
              >
                {w.word}
                {isLow && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.7 }}>
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.47 4.47 0 0 0 2.5-3.5z" />
                  </svg>
                )}
              </span>
              <span
                className="mt-1.5 text-[10px] font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {Math.round(w.accuracyScore)}
              </span>
              {isLow && w.phonemes.length > 0 && (
                <div className="mt-1 flex gap-0.5">
                  {w.phonemes.map((p, j) => {
                    const phonemeLow = p.accuracyScore < 70;
                    return (
                      <span
                        key={j}
                        className="rounded px-1 py-0.5 text-[10px] font-medium"
                        style={{
                          background: phonemeLow ? "var(--accent-red-dim)" : "transparent",
                          color: phonemeLow ? "var(--accent-red)" : "var(--text-muted)",
                        }}
                      >
                        {p.phoneme}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Results Panel ─── */

function ResultsPanel({
  result,
  onPlayWord,
  playingWord,
  referenceText,
  onPlaySentence,
  ttsPlaying,
}: {
  result: AssessmentResult;
  onPlayWord?: (word: string) => void;
  playingWord?: string | null;
  referenceText?: string;
  onPlaySentence?: () => void;
  ttsPlaying?: boolean;
}) {
  const avg =
    (result.accuracyScore +
      result.fluencyScore +
      result.completenessScore +
      result.prosodyScore) /
    4;

  return (
    <div className="w-full max-w-md flex flex-col gap-8 pb-16">
      {/* Overall summary */}
      <div
        className="animate-slide-up text-center"
        style={{ animationDelay: "0ms" }}
      >
        <span
          className="text-4xl font-bold"
          style={{ color: scoreColor(avg) }}
        >
          {Math.round(avg)}
        </span>
        <p
          className="mt-1 text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {scoreLabel(avg)}
        </p>
        <p
          className="mt-2 text-xs leading-relaxed max-w-[260px] mx-auto"
          style={{ color: "var(--text-muted)" }}
        >
          Your overall pronunciation score, averaged across all four categories below.
        </p>
      </div>

      {/* Score arcs */}
      <div className="grid grid-cols-4 gap-3">
        <ScoreArc label="Accuracy" hint="How close each sound is to a native speaker" score={result.accuracyScore} delay={100} />
        <ScoreArc label="Fluency" hint="Smoothness and natural pacing of your speech" score={result.fluencyScore} delay={200} />
        <ScoreArc label="Complete" hint="How much of the sentence was clearly spoken" score={result.completenessScore} delay={300} />
        <ScoreArc label="Prosody" hint="Rhythm, stress, and intonation patterns" score={result.prosodyScore} delay={400} />
      </div>

      {/* Word breakdown */}
      {result.words.length > 0 && (
        <WordBreakdown words={result.words} onPlayWord={onPlayWord} playingWord={playingWord} />
      )}

      {/* Hear full sentence */}
      {referenceText && onPlaySentence && (
        <button
          onClick={onPlaySentence}
          className="animate-slide-up flex items-center gap-2 rounded-full px-5 py-2.5 transition-all self-center"
          style={{
            animationDelay: "700ms",
            background: ttsPlaying ? "var(--accent-teal)" : "var(--bg-card)",
            border: `1px solid ${ttsPlaying ? "var(--accent-teal)" : "rgba(107, 197, 176, 0.25)"}`,
            color: ttsPlaying ? "var(--bg-deep)" : "var(--accent-teal)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.47 4.47 0 0 0 2.5-3.5zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06A9 9 0 0 0 14 3.23z" />
          </svg>
          <span className="text-sm font-medium">
            {ttsPlaying ? "Playing..." : "Hear correct pronunciation"}
          </span>
        </button>
      )}
    </div>
  );
}

/* ─── Record Button ─── */

function RecordButton({
  state,
  elapsed,
  onTap,
}: {
  state: "idle" | "recording" | "analyzing" | "done" | "error";
  elapsed: number;
  onTap: () => void;
}) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Breathing glow — idle */}
      {state === "idle" && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              background: "var(--accent-teal)",
              animation: "breathe 3s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              background: "var(--accent-teal)",
              animation: "breathe-outer 3s ease-in-out infinite 0.3s",
            }}
          />
        </>
      )}

      {/* Recording rings */}
      {state === "recording" && (
        <>
          <div
            className="absolute rounded-full border-2"
            style={{
              width: 140,
              height: 140,
              borderColor: "var(--accent-teal)",
              animation: "ring-expand 2s ease-out infinite",
            }}
          />
          <div
            className="absolute rounded-full border"
            style={{
              width: 140,
              height: 140,
              borderColor: "var(--accent-teal)",
              animation: "ring-expand-slow 2.5s ease-out infinite 0.5s",
            }}
          />
        </>
      )}

      {/* Analyzing orbital */}
      {state === "analyzing" && (
        <>
          <div
            className="absolute"
            style={{
              width: 160,
              height: 160,
              animation: "orbit 3s linear infinite",
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: 8,
                height: 8,
                top: 0,
                left: "50%",
                marginLeft: -4,
                background: "var(--accent-teal)",
                boxShadow: "0 0 12px var(--accent-teal-glow)",
              }}
            />
          </div>
          <div
            className="absolute"
            style={{
              width: 180,
              height: 180,
              animation: "orbit-reverse 4s linear infinite",
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: 6,
                height: 6,
                top: 0,
                left: "50%",
                marginLeft: -3,
                background: "var(--accent-mint)",
                opacity: 0.6,
                boxShadow: "0 0 10px rgba(91, 238, 170, 0.3)",
              }}
            />
          </div>
        </>
      )}

      {/* Main button */}
      <button
        onClick={onTap}
        disabled={state === "analyzing"}
        className="relative z-10 flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none"
        style={{
          width: 140,
          height: 140,
          background:
            state === "recording"
              ? "var(--accent-teal)"
              : state === "analyzing"
                ? "var(--bg-elevated)"
                : "var(--bg-card)",
          border: `2px solid ${
            state === "recording"
              ? "var(--accent-teal)"
              : state === "analyzing"
                ? "var(--bg-elevated)"
                : "rgba(107, 197, 176, 0.25)"
          }`,
          boxShadow:
            state === "recording"
              ? "0 0 40px var(--accent-teal-glow)"
              : state === "idle"
                ? "0 0 0 rgba(0,0,0,0)"
                : "none",
          cursor: state === "analyzing" ? "not-allowed" : "pointer",
          animation:
            state === "recording"
              ? "pulse-record 1.5s ease-in-out infinite"
              : "none",
        }}
      >
        {state === "recording" ? (
          /* Stop icon */
          <svg width="36" height="36" viewBox="0 0 24 24" fill="var(--text-primary)">
            <rect x="6" y="6" width="12" height="12" rx="3" />
          </svg>
        ) : state === "analyzing" ? (
          /* Waveform icon */
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ animation: "fade-pulse 2s ease-in-out infinite" }}
          >
            <path d="M4 12h2" />
            <path d="M8 8v8" />
            <path d="M12 5v14" />
            <path d="M16 8v8" />
            <path d="M20 12h-2" />
          </svg>
        ) : (
          /* Mic icon */
          <svg width="36" height="36" viewBox="0 0 24 24" fill="var(--accent-teal)">
            <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
            <path d="M17 11a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-3.07A7 7 0 0 0 19 11h-2z" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ─── Status Text ─── */

function StatusText({
  state,
  elapsed,
  errorMessage,
}: {
  state: "idle" | "recording" | "analyzing" | "done" | "error";
  elapsed: number;
  errorMessage: string | null;
}) {
  if (state === "recording") {
    return (
      <div className="mt-8 flex flex-col items-center gap-1">
        <span className="timer-text text-2xl font-medium" style={{ color: "var(--accent-teal)" }}>
          {formatTime(elapsed)}
        </span>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          Tap to stop
        </span>
      </div>
    );
  }

  if (state === "analyzing") {
    return (
      <div className="mt-8 flex flex-col items-center gap-2">
        <span className="text-base font-medium" style={{ color: "var(--text-secondary)" }}>
          Analyzing your speech
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 4,
                height: 4,
                background: "var(--text-muted)",
                animation: `fade-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (state === "done") {
    return (
      <p className="mt-8 text-sm" style={{ color: "var(--text-muted)" }}>
        Tap to try again
      </p>
    );
  }

  if (state === "error") {
    return (
      <p className="mt-8 text-sm font-medium text-center max-w-64 leading-relaxed" style={{ color: "var(--accent-red)" }}>
        {errorMessage}
      </p>
    );
  }

  return (
    <p className="mt-8 text-base font-medium" style={{ color: "var(--text-secondary)" }}>
      Tap to speak
    </p>
  );
}

/* ─── Playback Button ─── */

function PlaybackButton({
  audioBlob,
}: {
  audioBlob: Blob;
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const toggle = () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    // Create fresh audio each time to avoid stale state
    cleanup();
    const url = URL.createObjectURL(audioBlob);
    urlRef.current = url;
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = () => {
      setPlaying(false);
    };

    audio.play();
    setPlaying(true);
  };

  return (
    <button
      onClick={toggle}
      className="animate-slide-up flex items-center gap-2 rounded-full px-5 py-2.5 transition-all"
      style={{
        background: playing ? "var(--accent-teal)" : "var(--bg-card)",
        border: `1px solid ${playing ? "var(--accent-teal)" : "rgba(107, 197, 176, 0.25)"}`,
        color: playing ? "var(--bg-deep)" : "var(--accent-teal)",
      }}
    >
      {playing ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
      <span className="text-sm font-medium">
        {playing ? "Pause" : "Play back"}
      </span>
    </button>
  );
}

/* ─── Main Page ─── */

export default function Home() {
  const recorder = useRecorder();
  const assessment = usePronunciationAssessment();
  const tts = useTts();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [promptMode, setPromptMode] = useState(false);
  const [level, setLevel] = useState<Level>("beginner");
  const [currentSentence, setCurrentSentence] = useState(() => getRandomSentence("beginner"));
  const [showTip, setShowTip] = useState(false);
  const [generating, setGenerating] = useState(false);
  const tipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pickNewSentence = useCallback(() => {
    setCurrentSentence((prev) => getRandomSentence(level, prev));

  }, [level]);

  const generateAiSentence = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/generate-prompt?level=${level}`);
      const data = await res.json();
      if (data.sentence) {
        setCurrentSentence(data.sentence);

      } else {
        pickNewSentence();
      }
    } catch {
      pickNewSentence();
    } finally {
      setGenerating(false);
    }
  }, [level, pickNewSentence]);

  // Pick a new sentence when level changes — but only if current is curated
  const handleLevelChange = useCallback((newLevel: Level) => {
    setLevel(newLevel);
    setCurrentSentence(getRandomSentence(newLevel));

  }, []);

  useEffect(() => {
    if (recorder.status === "done" && recorder.audioBlob) {
      assessment.analyze(recorder.audioBlob, promptMode ? currentSentence : undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.status, recorder.audioBlob]);

  // "Speak longer" tip when recording < 5 seconds
  useEffect(() => {
    if (recorder.status === "done" && recorder.elapsed < 5) {
      setShowTip(true);
      tipTimeoutRef.current = setTimeout(() => setShowTip(false), 5000);
    }
    return () => {
      if (tipTimeoutRef.current) clearTimeout(tipTimeoutRef.current);
    };
  }, [recorder.status, recorder.elapsed]);

  // Scroll to results when done
  useEffect(() => {
    if (assessment.status === "done" && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [assessment.status]);

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleTap = async () => {
    if (recorder.status === "idle") {
      try {
        vibrate(50);
        setShowTip(false);
        await recorder.start();
      } catch {
        // error is set inside useRecorder for mic_denied
      }
    } else if (recorder.status === "recording") {
      vibrate([50, 50, 50]);
      recorder.stop();
    } else {
      recorder.reset();
      assessment.reset();
    }
  };

  const isAnalyzing = assessment.status === "analyzing";
  const isDone = assessment.status === "done";
  const isAssessmentError = assessment.status === "error";
  const isMicError = recorder.error === "mic_denied";

  let buttonState: "idle" | "recording" | "analyzing" | "done" | "error" = "idle";
  if (recorder.status === "recording") buttonState = "recording";
  else if (isAnalyzing) buttonState = "analyzing";
  else if (isDone) buttonState = "done";
  else if (isAssessmentError || isMicError) buttonState = "error";

  let displayErrorMessage: string | null = null;
  if (isMicError) {
    displayErrorMessage = "Microphone access is needed. Check your browser settings.";
  } else if (isAssessmentError) {
    displayErrorMessage = assessment.errorMessage;
  }

  return (
    <div className="flex min-h-dvh flex-col items-center">
      {/* Header */}
      <header className="w-full px-6 pt-10 pb-4 flex justify-center">
        <Image
          src="/logo.png"
          alt="Fluenta"
          width={300}
          height={90}
          priority
          className="h-20 w-auto"
        />
      </header>

      {/* Speak longer tip */}
      {showTip && (
        <div
          className="animate-toast w-full max-w-md mx-auto px-6 mt-2"
        >
          <div
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
            style={{
              background: "var(--accent-amber-dim)",
              border: "1px solid rgba(251, 191, 36, 0.2)",
            }}
          >
            <span className="text-xs font-medium" style={{ color: "var(--accent-amber)" }}>
              Tip: Speak for at least 5 seconds for better results
            </span>
            <button
              onClick={() => setShowTip(false)}
              className="shrink-0"
              style={{ color: "var(--accent-amber)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Prompt mode toggle */}
      <div className="w-full max-w-md px-6 flex items-center justify-between">
        <span
          className="text-xs font-medium tracking-wide"
          style={{ color: promptMode ? "var(--accent-teal)" : "var(--text-muted)" }}
        >
          Prompt mode
        </span>
        <button
          onClick={() => setPromptMode((p) => !p)}
          className="relative rounded-full transition-colors duration-200"
          style={{
            width: 44,
            height: 24,
            background: promptMode ? "var(--accent-teal)" : "var(--bg-elevated)",
          }}
        >
          <div
            className="absolute top-1 rounded-full transition-transform duration-200"
            style={{
              width: 16,
              height: 16,
              background: "var(--text-primary)",
              transform: promptMode ? "translateX(24px)" : "translateX(4px)",
            }}
          />
        </button>
      </div>

      {/* Level selector + Prompt sentence card */}
      {promptMode && (
        <div className="w-full max-w-md mx-auto mt-4 px-6 flex flex-col gap-3">
          {/* Level selector */}
          <div className="flex gap-2 justify-center">
            {(["beginner", "intermediate", "expert"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className="rounded-full px-4 py-1.5 text-xs font-medium transition-all capitalize"
                style={{
                  background: level === lvl ? "var(--accent-teal)" : "var(--bg-card)",
                  color: level === lvl ? "var(--bg-deep)" : "var(--text-muted)",
                  border: `1px solid ${level === lvl ? "var(--accent-teal)" : "rgba(107, 197, 176, 0.15)"}`,
                }}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Sentence card */}
          <div
            className="rounded-2xl px-5 py-4 text-center"
            style={{
              background: "var(--bg-card)",
              border: "1px solid rgba(107, 197, 176, 0.15)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-widest mb-2 font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Read aloud
            </p>
            <p
              className={`font-medium leading-relaxed wrap-break-word ${
                level === "expert" ? "text-base" : "text-lg"
              }`}
              style={{ color: "var(--text-primary)" }}
            >
              {currentSentence}
            </p>
            <div className="mt-3 flex items-center justify-center gap-4">
              <button
                onClick={pickNewSentence}
                className="text-xs font-medium transition-colors"
                style={{ color: "var(--accent-teal)" }}
              >
                Skip sentence
              </button>
              <button
                onClick={generateAiSentence}
                disabled={generating}
                className="text-xs font-medium transition-colors inline-flex items-center gap-1"
                style={{ color: "var(--accent-teal)", opacity: generating ? 0.6 : 1 }}
              >
                {generating ? (
                  <>
                    <span className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="rounded-full"
                          style={{
                            width: 3,
                            height: 3,
                            background: "var(--accent-teal)",
                            display: "inline-block",
                            animation: `fade-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </span>
                    Generating
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
                    </svg>
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Button area */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <RecordButton
          state={buttonState}
          elapsed={recorder.elapsed}
          onTap={handleTap}
        />
        <StatusText state={buttonState} elapsed={recorder.elapsed} errorMessage={displayErrorMessage} />
      </div>

      {/* Progress bar for recording */}
      {recorder.status === "recording" && (
        <div className="w-full max-w-xs px-6 mb-8">
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: "var(--bg-elevated)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${(recorder.elapsed / 60) * 100}%`,
                background: "var(--accent-teal)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              0:00
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              1:00
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {isDone && assessment.result && (
        <div ref={resultsRef} className="w-full flex flex-col items-center px-6">
          <div
            className="w-full max-w-md h-px mb-8"
            style={{
              background: "linear-gradient(90deg, transparent, var(--bg-elevated), transparent)",
            }}
          />
          {recorder.audioBlob && (
            <div className="mb-6">
              <PlaybackButton audioBlob={recorder.audioBlob} />
            </div>
          )}
          <ResultsPanel
            result={assessment.result}
            onPlayWord={(word) => tts.play(word)}
            playingWord={tts.currentText}
            referenceText={promptMode ? currentSentence : undefined}
            onPlaySentence={promptMode ? () => tts.play(currentSentence) : undefined}
            ttsPlaying={tts.playing}
          />
        </div>
      )}
    </div>
  );
}
