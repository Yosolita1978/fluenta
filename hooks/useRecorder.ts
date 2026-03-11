import { useState, useRef, useCallback, useEffect } from "react";

type RecorderStatus = "idle" | "recording" | "done";

export type RecorderError = "mic_denied" | null;

interface UseRecorderReturn {
  status: RecorderStatus;
  elapsed: number;
  audioBlob: Blob | null;
  error: RecorderError;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "audio/webm";
}

export function useRecorder(): UseRecorderReturn {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<RecorderError>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef<string>("");

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }
  }, []);

  const start = useCallback(async () => {
    setAudioBlob(null);
    setElapsed(0);
    setError(null);
    chunks.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
      ) {
        setError("mic_denied");
      }
      throw err;
    }

    streamRef.current = stream;

    const mimeType = getSupportedMimeType();
    mimeTypeRef.current = mimeType;

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorder.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: mimeTypeRef.current });
      setAudioBlob(blob);
      setStatus("done");
      cleanup();
    };

    recorder.start();
    setStatus("recording");

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= 59) {
          stop();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  }, [cleanup, stop]);

  const reset = useCallback(() => {
    setStatus("idle");
    setElapsed(0);
    setAudioBlob(null);
    setError(null);
    chunks.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { status, elapsed, audioBlob, error, start, stop, reset };
}
