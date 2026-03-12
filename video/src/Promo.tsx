import { AbsoluteFill, Sequence } from "remotion";
import { colors, SCENES } from "./theme";
import { LogoReveal } from "./scenes/LogoReveal";
import { RecordDemo } from "./scenes/RecordDemo";
import { Analyzing } from "./scenes/Analyzing";
import { ScoreReveal } from "./scenes/ScoreReveal";
import { WordBreakdown } from "./scenes/WordBreakdown";
import { EndCard } from "./scenes/EndCard";

interface PromoProps {
  soraFamily: string;
  dmMonoFamily: string;
}

export const Promo: React.FC<PromoProps> = ({ soraFamily, dmMonoFamily }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <Sequence from={SCENES.logoReveal.start} durationInFrames={SCENES.logoReveal.duration}>
        <LogoReveal fontFamily={soraFamily} />
      </Sequence>

      <Sequence from={SCENES.recordDemo.start} durationInFrames={SCENES.recordDemo.duration}>
        <RecordDemo fontFamily={soraFamily} dmMonoFamily={dmMonoFamily} />
      </Sequence>

      <Sequence from={SCENES.analyzing.start} durationInFrames={SCENES.analyzing.duration}>
        <Analyzing fontFamily={soraFamily} />
      </Sequence>

      <Sequence from={SCENES.scoreReveal.start} durationInFrames={SCENES.scoreReveal.duration}>
        <ScoreReveal fontFamily={soraFamily} />
      </Sequence>

      <Sequence from={SCENES.wordBreakdown.start} durationInFrames={SCENES.wordBreakdown.duration}>
        <WordBreakdown fontFamily={soraFamily} />
      </Sequence>

      <Sequence from={SCENES.endCard.start} durationInFrames={SCENES.endCard.duration}>
        <EndCard fontFamily={soraFamily} />
      </Sequence>
    </AbsoluteFill>
  );
};
