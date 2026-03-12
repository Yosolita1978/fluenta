import { useCurrentFrame, interpolate } from "remotion";
import { colors, FPS } from "../theme";
import { RecordButton } from "../components/RecordButton";

export const Analyzing: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [95, 110], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dotOpacity = (i: number) =>
    0.4 + 0.6 * Math.sin((frame / FPS) * Math.PI * 2.5 - i * 0.7);

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
      <RecordButton state="analyzing" />

      <div
        style={{
          marginTop: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: colors.textSecondary,
          }}
        >
          Analyzing your speech
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: colors.textMuted,
                opacity: dotOpacity(i),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
