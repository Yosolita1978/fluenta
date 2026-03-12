import { useCurrentFrame, spring, interpolate } from "remotion";
import { colors, FPS } from "../theme";

interface Phoneme {
  phoneme: string;
  low: boolean;
}

interface WordPillProps {
  word: string;
  score: number;
  animationStartFrame: number;
  phonemes?: Phoneme[];
  showSpeakerPulse?: boolean;
  fontFamily: string;
}

export const WordPill: React.FC<WordPillProps> = ({
  word,
  score,
  animationStartFrame,
  phonemes,
  showSpeakerPulse = false,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const isLow = score < 70;

  const popIn = spring({
    frame: frame - animationStartFrame,
    fps: FPS,
    config: { damping: 12, stiffness: 200 },
  });

  const scale = interpolate(popIn, [0, 1], [0.8, 1]);
  const translateY = interpolate(popIn, [0, 1], [12, 0]);
  const opacity = interpolate(popIn, [0, 1], [0, 1]);

  const speakerOpacity = showSpeakerPulse
    ? 0.5 + 0.5 * Math.sin((frame / FPS) * Math.PI * 3)
    : 0.7;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
        fontFamily,
      }}
    >
      <span
        style={{
          borderRadius: 18,
          padding: "10px 20px",
          fontSize: 24,
          fontWeight: 500,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: isLow ? colors.accentRedDim : colors.accentMintDim,
          color: isLow ? colors.accentRed : colors.accentMint,
        }}
      >
        {word}
        {isLow && (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ opacity: speakerOpacity }}
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.47 4.47 0 0 0 2.5-3.5z" />
          </svg>
        )}
      </span>
      <span
        style={{
          marginTop: 6,
          fontSize: 16,
          fontWeight: 500,
          color: colors.textMuted,
        }}
      >
        {Math.round(score)}
      </span>
      {isLow && phonemes && phonemes.length > 0 && (
        <div style={{ marginTop: 4, display: "flex", gap: 3 }}>
          {phonemes.map((p, j) => (
            <span
              key={j}
              style={{
                borderRadius: 6,
                padding: "3px 6px",
                fontSize: 14,
                fontWeight: 500,
                background: p.low ? colors.accentRedDim : "transparent",
                color: p.low ? colors.accentRed : colors.textMuted,
              }}
            >
              {p.phoneme}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
