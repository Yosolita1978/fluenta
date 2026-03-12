import { useCurrentFrame, interpolate, spring } from "remotion";
import { colors, FPS } from "../theme";
import { RecordButton } from "../components/RecordButton";

export const RecordDemo: React.FC<{ fontFamily: string; dmMonoFamily: string }> = ({
  fontFamily,
  dmMonoFamily,
}) => {
  const frame = useCurrentFrame();
  const tapFrame = 60;
  const isRecording = frame >= tapFrame;

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [155, 170], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tap scale animation
  const tapBounce = spring({
    frame: frame - tapFrame,
    fps: FPS,
    config: { damping: 8, stiffness: 300 },
  });
  const tapScale = isRecording
    ? interpolate(tapBounce, [0, 0.3, 1], [1, 0.92, 1])
    : 1;

  // Timer counting up from 0:00
  const elapsed = isRecording ? Math.floor((frame - tapFrame) / FPS) : 0;
  const timerText = `0:${elapsed.toString().padStart(2, "0")}`;

  const textOpacity = interpolate(
    frame,
    isRecording ? [tapFrame, tapFrame + 10] : [10, 25],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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
      }}
    >
      <div style={{ transform: `scale(${tapScale})` }}>
        <RecordButton state={isRecording ? "recording" : "idle"} />
      </div>

      <div
        style={{
          marginTop: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: textOpacity,
        }}
      >
        {isRecording ? (
          <>
            <span
              style={{
                fontSize: 42,
                fontWeight: 500,
                color: colors.accentTeal,
                fontFamily: dmMonoFamily,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "0.05em",
              }}
            >
              {timerText}
            </span>
            <span style={{ fontSize: 22, color: colors.textMuted }}>
              Tap to stop
            </span>
          </>
        ) : (
          <span
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: colors.textSecondary,
            }}
          >
            Tap to speak
          </span>
        )}
      </div>
    </div>
  );
};
