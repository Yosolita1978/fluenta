import { useCurrentFrame, interpolate } from "remotion";
import { colors, FPS } from "../theme";

type ButtonState = "idle" | "recording" | "analyzing";

interface RecordButtonProps {
  state: ButtonState;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ state }) => {
  const frame = useCurrentFrame();

  const breatheScale = 1 + 0.15 * Math.sin((frame / FPS) * Math.PI * (2 / 3));
  const breatheOpacity = 0.24 - 0.16 * Math.sin((frame / FPS) * Math.PI * (2 / 3));
  const outerScale = 1 + 0.3 * Math.sin(((frame - 9) / FPS) * Math.PI * (2 / 3));
  const outerOpacity = 0.12 - 0.09 * Math.sin(((frame - 9) / FPS) * Math.PI * (2 / 3));

  const ring1Progress = ((frame % 60) / 60);
  const ring1Scale = 1 + 1.2 * ring1Progress;
  const ring1Opacity = 0.5 * (1 - ring1Progress);

  const ring2Progress = (((frame - 15) % 75) / 75);
  const ring2Scale = 1 + 1.8 * ring2Progress;
  const ring2Opacity = 0.3 * (1 - ring2Progress);

  const pulseScale = 1 + 0.05 * Math.sin((frame / FPS) * Math.PI * (2 / 1.5));

  const orbit1Angle = (frame / 90) * 360;
  const orbit2Angle = -(frame / 120) * 360;

  const buttonBg =
    state === "recording"
      ? colors.accentTeal
      : state === "analyzing"
        ? colors.bgElevated
        : colors.bgCard;

  const buttonBorder =
    state === "recording"
      ? colors.accentTeal
      : state === "analyzing"
        ? colors.bgElevated
        : "rgba(107, 197, 176, 0.25)";

  const waveformOpacity = 0.6 + 0.4 * Math.sin((frame / FPS) * Math.PI * 2);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 300,
        height: 300,
      }}
    >
      {/* Breathing glow — idle */}
      {state === "idle" && (
        <>
          <div
            style={{
              position: "absolute",
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: colors.accentTeal,
              transform: `scale(${breatheScale})`,
              opacity: breatheOpacity,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: colors.accentTeal,
              transform: `scale(${outerScale})`,
              opacity: outerOpacity,
            }}
          />
        </>
      )}

      {/* Recording rings */}
      {state === "recording" && (
        <>
          <div
            style={{
              position: "absolute",
              width: 210,
              height: 210,
              borderRadius: "50%",
              border: `3px solid ${colors.accentTeal}`,
              transform: `scale(${ring1Scale})`,
              opacity: ring1Opacity,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 210,
              height: 210,
              borderRadius: "50%",
              border: `2px solid ${colors.accentTeal}`,
              transform: `scale(${ring2Scale})`,
              opacity: ring2Opacity,
            }}
          />
        </>
      )}

      {/* Analyzing orbitals */}
      {state === "analyzing" && (
        <>
          <div
            style={{
              position: "absolute",
              width: 240,
              height: 240,
              transform: `rotate(${orbit1Angle}deg)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 12,
                height: 12,
                top: 0,
                left: "50%",
                marginLeft: -6,
                borderRadius: "50%",
                background: colors.accentTeal,
                boxShadow: `0 0 16px ${colors.accentTealGlow}`,
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              width: 270,
              height: 270,
              transform: `rotate(${orbit2Angle}deg)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 9,
                height: 9,
                top: 0,
                left: "50%",
                marginLeft: -4.5,
                borderRadius: "50%",
                background: colors.accentMint,
                opacity: 0.6,
                boxShadow: "0 0 12px rgba(91, 238, 170, 0.3)",
              }}
            />
          </div>
        </>
      )}

      {/* Main button */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 210,
          height: 210,
          borderRadius: "50%",
          background: buttonBg,
          border: `3px solid ${buttonBorder}`,
          boxShadow:
            state === "recording"
              ? `0 0 60px ${colors.accentTealGlow}`
              : "none",
          transform:
            state === "recording" ? `scale(${pulseScale})` : "scale(1)",
        }}
      >
        {state === "recording" ? (
          <svg width="54" height="54" viewBox="0 0 24 24" fill={colors.textPrimary}>
            <rect x="6" y="6" width="12" height="12" rx="3" />
          </svg>
        ) : state === "analyzing" ? (
          <svg
            width="54"
            height="54"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ opacity: waveformOpacity }}
          >
            <path d="M4 12h2" />
            <path d="M8 8v8" />
            <path d="M12 5v14" />
            <path d="M16 8v8" />
            <path d="M20 12h-2" />
          </svg>
        ) : (
          <svg width="54" height="54" viewBox="0 0 24 24" fill={colors.accentTeal}>
            <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
            <path d="M17 11a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-3.07A7 7 0 0 0 19 11h-2z" />
          </svg>
        )}
      </div>
    </div>
  );
};
