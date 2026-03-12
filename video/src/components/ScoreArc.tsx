import { useCurrentFrame, interpolate, Easing } from "remotion";
import { colors, scoreColor, FPS } from "../theme";

interface ScoreArcProps {
  label: string;
  score: number;
  hint: string;
  animationStartFrame: number;
  fontFamily: string;
}

export const ScoreArc: React.FC<ScoreArcProps> = ({
  label,
  score,
  hint,
  animationStartFrame,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const size = 160;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  const progress = interpolate(
    frame,
    [animationStartFrame, animationStartFrame + 40],
    [circumference, targetOffset],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  const opacity = interpolate(
    frame,
    [animationStartFrame - 5, animationStartFrame + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const displayScore = Math.round(
    interpolate(
      frame,
      [animationStartFrame, animationStartFrame + 35],
      [0, score],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        opacity,
        fontFamily,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.bgElevated}
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
            strokeDashoffset={progress}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 36,
              fontWeight: 600,
              color,
            }}
          >
            {displayScore}
          </span>
        </div>
      </div>
      <span
        style={{
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          color: colors.textSecondary,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          textAlign: "center" as const,
          lineHeight: 1.3,
          maxWidth: 140,
          color: colors.textMuted,
        }}
      >
        {hint}
      </span>
    </div>
  );
};
