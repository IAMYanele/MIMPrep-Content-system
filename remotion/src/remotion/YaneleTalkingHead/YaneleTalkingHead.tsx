import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { LightLeak } from "@remotion/light-leaks";
import { Captions } from "./Captions";
import { Overlays } from "./Overlays";
import { ConceptAnimations } from "./ConceptAnimations";
import { useVideoZoom } from "./useVideoZoom";

export const YaneleTalkingHead: React.FC = () => {
  const { scale, originX, originY } = useVideoZoom();
  const { fps } = useVideoConfig();

  // Light-leak overlay timings at natural transition points
  const leakDuration = Math.round(1 * fps); // 30 frames = 1s
  const sectionTransitions = [
    { at: 5,    seed: 1, hue: 40  },   // Intro → Agent Instructions
    { at: 16,   seed: 3, hue: 320 },   // Instructions → Tools
    { at: 27,   seed: 5, hue: 30  },   // Tools → Resources
    { at: 35,   seed: 7, hue: 120 },   // Resources → Building Analogy
    { at: 53,   seed: 9, hue: 220 },   // Analogy → Closing
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {/* Video layer with zoom */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transformOrigin: `${originX}% ${originY}%`,
        }}
      >
        <Video
          src={staticFile("yanele-talking-head.mp4")}
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

      {/* Overlays: hook title, progress bar, CTA */}
      <Overlays />

      {/* Concept animation cards */}
      <ConceptAnimations />

      {/* Captions (always on top) */}
      <Captions />
    </AbsoluteFill>
  );
};
