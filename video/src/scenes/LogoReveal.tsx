import { useCurrentFrame, interpolate, spring, Img, staticFile } from "remotion";
import { colors, FPS } from "../theme";

export const LogoReveal: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();

  const breatheScale = 1 + 0.2 * Math.sin((frame / FPS) * Math.PI * (2 / 3));
  const breatheOpacity = 0.3 - 0.2 * Math.sin((frame / FPS) * Math.PI * (2 / 3));
  const outerScale = 1 + 0.35 * Math.sin(((frame - 9) / FPS) * Math.PI * (2 / 3));
  const outerOpacity = 0.15 - 0.1 * Math.sin(((frame - 9) / FPS) * Math.PI * (2 / 3));

  const logoScale = spring({
    frame: frame - 10,
    fps: FPS,
    config: { damping: 14, stiffness: 100 },
  });

  const logoOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [75, 89], [1, 0], {
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
        opacity: fadeOut,
      }}
    >
      {/* Breathing glow circles */}
      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: colors.accentTeal,
          transform: `scale(${breatheScale})`,
          opacity: breatheOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: colors.accentTeal,
          transform: `scale(${outerScale})`,
          opacity: outerOpacity,
        }}
      />

      {/* Logo */}
      <Img
        src={staticFile("logo.png")}
        style={{
          height: 160,
          width: "auto",
          opacity: logoOpacity,
          transform: `scale(${interpolate(logoScale, [0, 1], [0.85, 1])})`,
        }}
      />
    </div>
  );
};
