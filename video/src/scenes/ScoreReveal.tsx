import { useCurrentFrame, interpolate, spring, Easing } from "remotion";
import { colors, scoreColor, FPS } from "../theme";
import { ScoreArc } from "../components/ScoreArc";

const MOCK_SCORES = {
  accuracy: 85,
  fluency: 78,
  complete: 92,
  prosody: 73,
};

const AVG = Math.round(
  (MOCK_SCORES.accuracy + MOCK_SCORES.fluency + MOCK_SCORES.complete + MOCK_SCORES.prosody) / 4
);

export const ScoreReveal: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [240, 260], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Big score number
  const scoreSpring = spring({
    frame: frame - 15,
    fps: FPS,
    config: { damping: 12, stiffness: 80 },
  });
  const displayScore = Math.round(interpolate(scoreSpring, [0, 1], [0, AVG]));
  const scoreScale = interpolate(scoreSpring, [0, 0.5, 1], [0.5, 1.1, 1]);

  // "Great" label
  const labelOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Description text
  const descOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const avgColor = scoreColor(AVG);

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
      {/* Big score */}
      <div
        style={{
          textAlign: "center" as const,
          marginBottom: 60,
        }}
      >
        <span
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: avgColor,
            transform: `scale(${scoreScale})`,
            display: "inline-block",
          }}
        >
          {displayScore}
        </span>
        <p
          style={{
            marginTop: 8,
            fontSize: 28,
            fontWeight: 500,
            color: colors.textSecondary,
            opacity: labelOpacity,
          }}
        >
          Great
        </p>
        <p
          style={{
            marginTop: 16,
            fontSize: 20,
            lineHeight: 1.5,
            maxWidth: 500,
            color: colors.textMuted,
            opacity: descOpacity,
          }}
        >
          Your overall pronunciation score
        </p>
      </div>

      {/* Four arcs */}
      <div
        style={{
          display: "flex",
          gap: 24,
          justifyContent: "center",
        }}
      >
        <ScoreArc
          label="Accuracy"
          hint="How close to native"
          score={MOCK_SCORES.accuracy}
          animationStartFrame={80}
          fontFamily={fontFamily}
        />
        <ScoreArc
          label="Fluency"
          hint="Smoothness & pacing"
          score={MOCK_SCORES.fluency}
          animationStartFrame={95}
          fontFamily={fontFamily}
        />
        <ScoreArc
          label="Complete"
          hint="Words clearly spoken"
          score={MOCK_SCORES.complete}
          animationStartFrame={110}
          fontFamily={fontFamily}
        />
        <ScoreArc
          label="Prosody"
          hint="Rhythm & intonation"
          score={MOCK_SCORES.prosody}
          animationStartFrame={125}
          fontFamily={fontFamily}
        />
      </div>
    </div>
  );
};
