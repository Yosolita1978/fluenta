export const colors = {
  bgDeep: "#1e2148",
  bgCard: "#282b5c",
  bgElevated: "#323670",
  textPrimary: "#f0ece6",
  textSecondary: "#a8a4be",
  textMuted: "#6e6a88",
  accentTeal: "#6bc5b0",
  accentTealGlow: "rgba(107, 197, 176, 0.3)",
  accentMint: "#5beeaa",
  accentMintDim: "rgba(91, 238, 170, 0.15)",
  accentAmber: "#fbbf24",
  accentRed: "#f87171",
  accentRedDim: "rgba(248, 113, 113, 0.15)",
};

export function scoreColor(score: number): string {
  if (score >= 80) return colors.accentMint;
  if (score >= 60) return colors.accentAmber;
  return colors.accentRed;
}

export const FPS = 30;
export const TOTAL_FRAMES = 900;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const SCENES = {
  logoReveal: { start: 0, duration: 90 },
  recordDemo: { start: 80, duration: 170 },
  analyzing: { start: 230, duration: 110 },
  scoreReveal: { start: 320, duration: 260 },
  wordBreakdown: { start: 560, duration: 200 },
  endCard: { start: 740, duration: 160 },
};
