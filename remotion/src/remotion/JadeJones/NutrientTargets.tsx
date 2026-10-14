// ─────────────────────────────────────────────────────────────
// NutrientTargets — Jade "what your daily targets look like as food"
// clone (@explainingourbody source). Rapid-fire format:
//   Jade states each daily target to camera, then it cuts to the food
//   equivalent (B-roll) with a clean "AMOUNT NUTRIENT = FOOD" pairing
//   card — the "screenshot" look. The fat/avocado beat is dropped
//   (handled upstream by trimming the source), leaving 4 pairings.
// No word-by-word captions — the pairing card IS the on-screen text.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
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

const anton = loadAnton().fontFamily;

const pairSchema = z.object({
  fromSeconds: z.number(),
  durationInSeconds: z.number(),
  brollSrc: z.string(),
  amount: z.string(), // e.g. "50g PROTEIN"
  food: z.string(), // e.g. "8 EGGS"
});

export const nutrientSchema = z.object({
  videoSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  pairs: z.array(pairSchema).default([]),
});
export type NutrientProps = z.infer<typeof nutrientSchema>;

export const calculateNutrientMetadata: CalculateMetadataFunction<NutrientProps> = ({
  props,
}) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

// ── the clean "AMOUNT = FOOD" pairing card ──
const PairingCard: React.FC<{ amount: string; food: string }> = ({ amount, food }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200, stiffness: 220 }, durationInFrames: 6 });
  const y = interpolate(enter, [0, 1], [26, 0]);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
      <div
        style={{
          marginTop: 300,
          transform: `translateY(${y}px)`,
          opacity: enter,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          padding: "34px 56px 40px",
          borderRadius: 40,
          background: "rgba(10,10,13,0.66)",
          border: "2px solid rgba(255,255,255,0.14)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
      >
        <div
          style={{
            fontFamily: anton,
            fontSize: 74,
            lineHeight: 1.0,
            color: "#fff",
            textTransform: "uppercase",
            textShadow: "0 3px 10px rgba(0,0,0,0.5)",
          }}
        >
          {amount}
        </div>
        <div
          style={{
            fontFamily: anton,
            fontSize: 46,
            color: "#ffd24d",
            lineHeight: 1.1,
            margin: "2px 0 0",
          }}
        >
          =
        </div>
        <div
          style={{
            fontFamily: anton,
            fontSize: 92,
            lineHeight: 1.0,
            color: "#ffd24d",
            textTransform: "uppercase",
            textShadow: "0 3px 10px rgba(0,0,0,0.5)",
          }}
        >
          {food}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const NutrientTargets: React.FC<NutrientProps> = ({ videoSrc, fps, pairs }) => {
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* Base talking head — carries the VO throughout. */}
      <Video
        src={staticFile(videoSrc)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Per-beat: cut to the food equivalent + pairing card. */}
      {pairs.map((p, i) => (
        <Sequence
          key={i}
          from={Math.round(p.fromSeconds * fps)}
          durationInFrames={Math.round(p.durationInSeconds * fps)}
          premountFor={fps}
          name={`pair-${i}`}
        >
          <AbsoluteFill style={{ background: "#000" }}>
            <Video
              src={staticFile(p.brollSrc)}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* subtle top scrim so the card reads over any food */}
            <AbsoluteFill
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 46%)",
              }}
            />
            <PairingCard amount={p.amount} food={p.food} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
