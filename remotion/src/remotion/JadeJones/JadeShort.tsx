// ─────────────────────────────────────────────────────────────
// JadeShort — parameterized comp for batch-processing Jade Jones
// videos: plays a source video full-bleed at 1080×1920, applies
// a gentle continuous Ken-Burns zoom (1.00↔1.08 sin-wave, 10s
// period — simple zoom in / zoom out), and burns in captions in
// the user's Premiere style (Anton 100 white centered, soft dark
// drop shadow).
//
// Input props (all paths relative to --public-dir at render time):
//   videoSrc          — e.g. "video.mp4"
//   captionsSrc       — e.g. "captions.json"
//   durationInSeconds — used by calculateMetadata
//   fps               — source fps (defaults to 25)
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { z } from "zod";
import { JadeCaptions } from "./JadeCaptions";

export const jadeShortSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
});

export type JadeShortProps = z.infer<typeof jadeShortSchema>;

export const calculateJadeMetadata: CalculateMetadataFunction<JadeShortProps> = ({
  props,
}) => {
  return {
    durationInFrames: Math.round(props.durationInSeconds * props.fps),
    fps: props.fps,
  };
};

export const JadeShort: React.FC<JadeShortProps> = ({ videoSrc, captionsSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // seconds

  // Simple continuous Ken-Burns: scale oscillates 1.00 → 1.08 → 1.00
  // on a 10s sin period. Always >=1.00 so the video never shows letterbox.
  // (sin(t*π/5) has period 10s; mid 1.04 ± 0.04 → range [1.00, 1.08])
  const scale = 1.04 + Math.sin((t * Math.PI) / 5) * 0.04;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <Video
          src={staticFile(videoSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <JadeCaptions captionsSrc={captionsSrc} />
    </AbsoluteFill>
  );
};
