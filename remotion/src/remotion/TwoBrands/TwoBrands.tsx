// ─────────────────────────────────────────────────────────────
// "It Takes Two Brands" — main comp.
// Base layer = the avatar talking-head (also carries the VO audio + captions).
// Full-bleed poster overlays take over the frame at key beats while the VO
// plays underneath. In-between, the captioned talking head shows.
//
// VO timing anchors (seconds):
//   0.0–5.8   Beat 1  split poster (GET SELLERS × ESTEBAN)  → BeatSplitReveal
//   5.8–17.9  (talking head + captions)
//   17.9–26.2 Beat 4  LIMITED vs FREEDOM split              → BeatCageFreedom
//   26.2–end  (talking head + captions — no overlay)
// ─────────────────────────────────────────────────────────────
import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { FPS, VIDEO_SRC } from "./theme";
import { BeatSplitReveal } from "./BeatSplitReveal";
import { BeatCageFreedom } from "./BeatCageFreedom";
import { Captions } from "./Captions";

const f = (s: number) => Math.round(s * FPS);

export const TwoBrands: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {/* Base: avatar talking-head (carries the VO audio for the whole comp) */}
      <Video
        src={staticFile(VIDEO_SRC)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Captions — under his chin. Sit above the video but BELOW the white
          hero overlays, so they only show while the talking head is visible. */}
      <Captions />

      {/* Beat 1 — Hook / split reveal (0.0–5.8s) */}
      <Sequence from={0} durationInFrames={f(5.8)} premountFor={FPS} name="Beat1-SplitReveal">
        <BeatSplitReveal />
      </Sequence>

      {/* Beat 4 — Limited → Freedom (17.9–26.2s) */}
      <Sequence
        from={f(17.9)}
        durationInFrames={f(26.2) - f(17.9)}
        premountFor={FPS}
        name="Beat4-CageFreedom"
      >
        <BeatCageFreedom />
      </Sequence>
    </AbsoluteFill>
  );
};
