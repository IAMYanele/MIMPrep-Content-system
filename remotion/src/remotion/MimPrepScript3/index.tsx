import React from "react";
import { Composition, registerRoot } from "remotion";
import { Overlay } from "./Overlay";
import timing from "./timing.json";

const MathildeScript3Root: React.FC = () => (
  <Composition
    id="MathildeScript3"
    component={Overlay}
    width={1080}
    height={1920}
    fps={timing.fps}
    durationInFrames={timing.durationInFrames}
    defaultProps={{ preview: false }}
  />
);

registerRoot(MathildeScript3Root);
