import { useState, useRef, useCallback, useEffect } from "react";

interface UseTtsReturn {
  play: (text: string) => void;
  stop: () => void;
  playing: boolean;
  currentText: string | null;
}

export function useTts(): UseTtsReturn {
  const [playing, setPlaying] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cleanup = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setPlaying(false);
    setCurrentText(null);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const play = useCallback(
    (text: string) => {
      // Cancel any in-progress playback
      cleanup();

      setCurrentText(text);
      setPlaying(true);

      const controller = new AbortController();
      abortRef.current = controller;

      fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error("Synthesis failed");
          return res.blob();
        })
        .then((blob) => {
          // Check if this request was already cancelled
          if (controller.signal.aborted) return;

          const url = URL.createObjectURL(blob);
          urlRef.current = url;
          const audio = new Audio(url);
          audioRef.current = audio;

          audio.onended = () => {
            cleanup();
          };

          audio.play();
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          cleanup();
        });
    },
    [cleanup]
  );

  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return { play, stop, playing, currentText };
}
