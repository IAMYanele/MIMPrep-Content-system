// ─────────────────────────────────────────────────────────────
// CravingDuality — the "night cravings" clone. The script pairs a
// CRAVING with the CAUSE behind it ("crave THIS → you're missing THIS").
// The bracketed nouns are CUT from the VO; instead, on each spoken
// "this", a white-outlined picture block pops up — craving on the LEFT,
// cause/nutrient on the RIGHT — so you SEE the duality side-by-side
// instead of hearing it. Both cards hold until the sentence resets.
// Captions ride above the cards during each pair.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { z } from "zod";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { JadeCaptions } from "./JadeCaptions";

const anton = loadAnton().fontFamily;

const cardSchema = z.object({
  src: z.string(),
  label: z.string(),
  atSeconds: z.number(),
});
const pairSchema = z.object({
  craving: cardSchema, // shown on the LEFT (what you crave)
  cause: cardSchema, // shown on the RIGHT (why — the missing nutrient / bad habit)
  clearAtSeconds: z.number(),
});

export const cravingDualitySchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  pairs: z.array(pairSchema).default([]),
});
export type CravingDualityProps = z.infer<typeof cravingDualitySchema>;

export const calculateCravingMetadata: CalculateMetadataFunction<CravingDualityProps> = ({
  props,
}) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

// ── Layout (1080-wide frame) ──
// Captions stay at their normal spot under her chin (JadeCaptions default y=1100,
// over the dark turtleneck); the picture blocks sit BELOW the caption text.
const CARD_W = 452;
const IMG_H = 452;
const GAP = 36;
const ROW_TOP = 1210; // top of the image blocks — under the caption line
const LEFT_X = Math.round((1080 - (CARD_W * 2 + GAP)) / 2); // centered pair
const RIGHT_X = LEFT_X + CARD_W + GAP;

const Card: React.FC<{ src: string; label: string; x: number }> = ({ src, label, x }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200, stiffness: 170 }, durationInFrames: 9 });
  const scale = interpolate(enter, [0, 1], [0.84, 1]);
  const ty = interpolate(enter, [0, 1], [26, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: ROW_TOP,
        width: CARD_W,
        opacity: enter,
        transform: `translateY(${ty}px) scale(${scale})`,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          width: CARD_W,
          height: IMG_H,
          borderRadius: 26,
          overflow: "hidden",
          border: "7px solid #ffffff",
          boxShadow: "0 20px 54px rgba(0,0,0,0.55), 0 4px 14px rgba(0,0,0,0.4)",
          background: "#000",
        }}
      >
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: anton,
            fontSize: 44,
            lineHeight: 1.06,
            color: "#fff",
            textTransform: "uppercase",
            background: "rgba(8,8,10,0.74)",
            padding: "13px 26px 15px",
            borderRadius: 16,
            border: "2px solid rgba(255,255,255,0.2)",
            textAlign: "center",
            letterSpacing: 1,
            // wrap long labels (e.g. "WAITED TOO LONG BETWEEN MEALS") onto 2 lines
            maxWidth: CARD_W,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export const CravingDuality: React.FC<CravingDualityProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  pairs,
}) => {
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* Base talking head — carries the (bracket-cut) VO. */}
      <Video src={staticFile(videoSrc)} objectFit="cover" style={{ width: "100%", height: "100%" }} />

      {pairs.map((p, i) => (
        <React.Fragment key={i}>
          <Sequence
            from={Math.round(p.craving.atSeconds * fps)}
            durationInFrames={Math.max(1, Math.round((p.clearAtSeconds - p.craving.atSeconds) * fps))}
            premountFor={fps}
            name={`craving-${i}`}
          >
            <Card src={p.craving.src} label={p.craving.label} x={LEFT_X} />
          </Sequence>
          <Sequence
            from={Math.round(p.cause.atSeconds * fps)}
            durationInFrames={Math.max(1, Math.round((p.clearAtSeconds - p.cause.atSeconds) * fps))}
            premountFor={fps}
            name={`cause-${i}`}
          >
            <Card src={p.cause.src} label={p.cause.label} x={RIGHT_X} />
          </Sequence>
        </React.Fragment>
      ))}

      {/* Captions on top, at their normal position under her chin (the cards sit below). */}
      <JadeCaptions captionsSrc={captionsSrc} />
    </AbsoluteFill>
  );
};
