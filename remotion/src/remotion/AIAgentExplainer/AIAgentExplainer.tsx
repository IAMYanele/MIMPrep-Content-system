import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { LightLeak } from "@remotion/light-leaks";
import { Captions } from "./Captions";
import { Overlays } from "./Overlays";
import { SaaSAnimations } from "./SaaSAnimations";
import { useVideoZoom } from "./useVideoZoom";

export const AIAgentExplainer: React.FC = () => {
  const { scale, originX, originY } = useVideoZoom();
  const { fps } = useVideoConfig();

  // Light-leak overlay timings (at section transitions)
  const leakDuration = Math.round(1 * fps); // 30 frames = 1s
  const sectionTransitions = [
    { at: 4.5, seed: 1, hue: 240 },   // Intro → Section 1
    { at: 15.4, seed: 3, hue: 40 },    // Section 1 → Section 2
    { at: 27.6, seed: 5, hue: 0 },     // Section 2 → Section 3
    { at: 34.6, seed: 7, hue: 120 },   // Section 3 → Closing
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {/* Video with zoom */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transformOrigin: `${originX}% ${originY}%`,
        }}
      >
        <Video
          src={staticFile("ai-agent-explainer.mp4")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Light-leak flashes at section transitions */}
      {sectionTransitions.map(({ at, seed, hue }) => (
        <Sequence
          key={seed}
          from={Math.round(at * fps)}
          durationInFrames={leakDuration}
        >
          <LightLeak seed={seed} hueShift={hue} />
        </Sequence>
      ))}

      {/* Overlays, SaaS graphics, Captions (layered bottom to top) */}
      <Overlays />
      <SaaSAnimations />
      <Captions />
    </AbsoluteFill>
  );
};
