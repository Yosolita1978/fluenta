import { Composition } from "remotion";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadDMMono } from "@remotion/google-fonts/DMMono";
import { Promo } from "./Promo";
import { FPS, TOTAL_FRAMES, WIDTH, HEIGHT } from "./theme";

const { fontFamily: soraFamily } = loadSora();
const { fontFamily: dmMonoFamily } = loadDMMono();

export const RemotionRoot = () => (
  <>
    <Composition
      id="FluentaPromo"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={Promo as React.ComponentType<any>}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ soraFamily, dmMonoFamily }}
    />
  </>
);
