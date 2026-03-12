import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../theme";
import { WordPill } from "../components/WordPill";

const MOCK_WORDS = [
  { word: "She", score: 92, phonemes: [] },
  {
    word: "sells",
    score: 45,
    phonemes: [
      { phoneme: "s", low: false },
      { phoneme: "ɛ", low: true },
      { phoneme: "l", low: false },
      { phoneme: "z", low: true },
    ],
  },
  { word: "sea", score: 88, phonemes: [] },
  {
    word: "shells",
    score: 52,
    phonemes: [
      { phoneme: "ʃ", low: false },
      { phoneme: "ɛ", low: true },
      { phoneme: "l", low: false },
      { phoneme: "z", low: true },
    ],
  },
  { word: "by", score: 95, phonemes: [] },
  { word: "the", score: 90, phonemes: [] },
  {
    word: "shore",
    score: 61,
    phonemes: [
      { phoneme: "ʃ", low: false },
      { phoneme: "ɔː", low: true },
      { phoneme: "r", low: false },
    ],
  },
];

export const WordBreakdown: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [180, 200], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerSlide = interpolate(frame, [5, 20], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Speaker icon pulses on "sells" starting at frame 100
  const showSpeakerPulse = frame >= 100;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.bgDeep,
        fontFamily,
        opacity: fadeIn * fadeOut,
        padding: "0 60px",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: 40,
          textAlign: "center" as const,
          opacity: headerOpacity,
          transform: `translateY(${headerSlide}px)`,
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            color: colors.textMuted,
            marginBottom: 12,
          }}
        >
          Word by word
        </h2>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.5,
            color: colors.textMuted,
            maxWidth: 600,
          }}
        >
          Green words sounded great. Red words need practice.
        </p>
      </div>

      {/* Word pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap" as const,
          justifyContent: "center",
          gap: 16,
          maxWidth: 800,
        }}
      >
        {MOCK_WORDS.map((w, i) => (
          <WordPill
            key={i}
            word={w.word}
            score={w.score}
            animationStartFrame={25 + i * 10}
            phonemes={w.score < 70 ? w.phonemes : undefined}
            showSpeakerPulse={showSpeakerPulse && w.word === "sells"}
            fontFamily={fontFamily}
          />
        ))}
      </div>
    </div>
  );
};
