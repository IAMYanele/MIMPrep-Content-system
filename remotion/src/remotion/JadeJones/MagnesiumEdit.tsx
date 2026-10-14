// ─────────────────────────────────────────────────────────────
// MagnesiumEdit — Jade "one mineral that is the absolute most
// important" clone. Mirrors @drericberg's source techniques:
//   1) HOOK punch-in: hard "cut closer" scale steps on the power
//      words ("most" → "important"), then release.
//   2) A persistent text hook pill above the head ("Did you know
//      this?").
//   3) Concept-specific medical B-roll (arteries, joints, vitamins,
//      calm, cells) cut in over the talking head.
//   4) ENDING slide-zoom: slow push-in on the reveal (magnesium)
//      that builds to the drop.
// Jade caption preset renders on top of everything.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { z } from "zod";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { JadeCaptions } from "./JadeCaptions";

const anton = loadAnton().fontFamily;

const brollSchema = z.object({
  src: z.string(),
  fromSeconds: z.number(),
  durationInSeconds: z.number(),
});
const punchSchema = z.object({ atSeconds: z.number(), scale: z.number() });

export const magnesiumSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  hookText: z.string().default("Did you know this?"),
  hookFadeOutStart: z.number().default(32.56),
  punchOrigin: z.string().default("50% 34%"),
  punchIns: z.array(punchSchema).default([]),
  broll: z.array(brollSchema).default([]),
  endingFromSeconds: z.number().nullable().default(null),
  endingToScale: z.number().default(1.22),
  endingOriginY: z.number().default(42),
  endingSlideY: z.number().default(-28),
});
export type MagnesiumProps = z.infer<typeof magnesiumSchema>;

export const calculateMagnesiumMetadata: CalculateMetadataFunction<MagnesiumProps> = ({
  props,
}) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

export const MagnesiumEdit: React.FC<MagnesiumProps> = ({
  videoSrc,
  captionsSrc,
  durationInSeconds,
  fps,
  hookText,
  hookFadeOutStart,
  punchOrigin,
  punchIns,
  broll,
  endingFromSeconds,
  endingToScale,
  endingOriginY,
  endingSlideY,
}) => {
  const frame = useCurrentFrame();
  const t = frame / fps;

  // ── base-video transform: hook punch-in (hard steps) + ending zoom ──
  let scale = 1;
  let origin = punchOrigin;
  let translateY = 0;
  for (const p of punchIns) if (t >= p.atSeconds) scale = p.scale;

  const inEnding = endingFromSeconds != null && t >= endingFromSeconds;
  if (inEnding) {
    const prog = interpolate(
      t,
      [endingFromSeconds as number, durationInSeconds],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) },
    );
    scale = interpolate(prog, [0, 1], [1, endingToScale]);
    translateY = interpolate(prog, [0, 1], [0, endingSlideY]);
    origin = `50% ${endingOriginY}%`;
  }

  // text-hook opacity: solid, then fade out as the reveal begins
  const hookOpacity = interpolate(
    t,
    [hookFadeOutStart - 0.35, hookFadeOutStart],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* Base talking head — carries the VO throughout. */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translateY(${translateY}px)`,
          transformOrigin: origin,
        }}
      >
        <Video
          src={staticFile(videoSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* Concept B-roll cutaways (muted — base VO keeps playing). */}
      {broll.map((b, i) => (
        <Sequence
          key={i}
          from={Math.round(b.fromSeconds * fps)}
          durationInFrames={Math.round(b.durationInSeconds * fps)}
          premountFor={fps}
          name={`broll-${i}`}
        >
          <AbsoluteFill style={{ background: "#000" }}>
            <Video
              src={staticFile(b.src)}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Persistent text hook — pill above the head (removed when hookText is empty). */}
      {hookText ? (
        <AbsoluteFill style={{ opacity: hookOpacity }}>
          <div
            style={{
              position: "absolute",
              top: 150,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: anton,
                fontSize: 62,
                letterSpacing: "0.01em",
                textTransform: "uppercase",
                color: "#fff",
                background: "rgba(8,8,10,0.62)",
                padding: "16px 40px 20px",
                borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.16)",
                boxShadow: "0 10px 34px rgba(0,0,0,0.45)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
              }}
            >
              {hookText}
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* Captions on top of everything. */}
      <JadeCaptions captionsSrc={captionsSrc} />
    </AbsoluteFill>
  );
};
