import { useCurrentFrame, interpolate, spring, Img, staticFile } from "remotion";
import { colors, FPS } from "../theme";

export const EndCard: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();

  const breatheScale = 1 + 0.12 * Math.sin((frame / FPS) * Math.PI * (2 / 3));
  const breatheOpacity = 0.15 - 0.08 * Math.sin((frame / FPS) * Math.PI * (2 / 3));

  const titleSpring = spring({
    frame: frame - 10,
    fps: FPS,
    config: { damping: 14, stiffness: 100 },
  });
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const titleSlide = interpolate(titleSpring, [0, 1], [30, 0]);

  const logoOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = spring({
    frame: frame - 30,
    fps: FPS,
    config: { damping: 14, stiffness: 100 },
  });

  const urlOpacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlSlide = interpolate(frame, [55, 75], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
      }}
    >
      {/* Subtle breathing glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: colors.accentTeal,
          transform: `scale(${breatheScale})`,
          opacity: breatheOpacity,
        }}
      />

      {/* Title */}
      <p
        style={{
          fontSize: 52,
          fontWeight: 600,
          color: colors.textPrimary,
          textAlign: "center" as const,
          maxWidth: 700,
          lineHeight: 1.3,
          opacity: titleOpacity,
          transform: `translateY(${titleSlide}px)`,
          marginBottom: 50,
        }}
      >
        Practice your pronunciation
      </p>

      {/* Logo */}
      <Img
        src={staticFile("logo.png")}
        style={{
          height: 120,
          width: "auto",
          opacity: logoOpacity,
          transform: `scale(${interpolate(logoScale, [0, 1], [0.85, 1])})`,
          marginBottom: 30,
        }}
      />

      {/* URL */}
      <p
        style={{
          fontSize: 32,
          fontWeight: 500,
          color: colors.accentTeal,
          opacity: urlOpacity,
          transform: `translateY(${urlSlide}px)`,
          letterSpacing: "0.02em",
        }}
      >
        fluenta.app
      </p>
    </div>
  );
};
