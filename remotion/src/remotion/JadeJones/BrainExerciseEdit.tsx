// ─────────────────────────────────────────────────────────────
// BrainExerciseEdit — Jade "the best exercise for your brain isn't
// crosswords" clone (@vivetalobomd source). Editor notes:
//   1) On-screen text hook: "Your brain needs this one exercise".
//   2) B-roll on each ruled-out option — crossword / supplement /
//      brain games — as she names them, then storytelling B-roll
//      (weights, brain, neurons) for the rest.
//   3) The resistance-training answer runs in SPLIT-SCREEN with the
//      study up top and Jade talking at the bottom (time-synced via
//      trimBefore so the bottom clip stays in lockstep with the VO).
// Jade caption preset renders on top throughout.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Img,
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

// study occupies 0..SEAM, Jade SEAM..1920. Seam = the study screenshot's height
// when scaled to full 1080 width (976x550 -> 1080x609), so the whole page fits
// with no cropping and no white margin.
const SEAM = 609;

const brollSchema = z.object({
  src: z.string(),
  fromSeconds: z.number(),
  durationInSeconds: z.number(),
  objectPosition: z.string().default("50% 50%"),
});
const splitSchema = z.object({
  fromSeconds: z.number(),
  durationInSeconds: z.number(),
});

export const brainExerciseSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  hookText: z.string().default("Your brain needs this one exercise"),
  hookOutSeconds: z.number().default(5.76),
  broll: z.array(brollSchema).default([]),
  splits: z.array(splitSchema).default([]),
  studySrc: z.string(), // screenshot of the study, shown in the split-screen top region
});
export type BrainExerciseProps = z.infer<typeof brainExerciseSchema>;

export const calculateBrainMetadata: CalculateMetadataFunction<BrainExerciseProps> = ({
  props,
}) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

export const BrainExerciseEdit: React.FC<BrainExerciseProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  hookText,
  hookOutSeconds,
  broll,
  splits,
  studySrc,
}) => {
  const frame = useCurrentFrame();
  const t = frame / fps;

  const hookOpacity = interpolate(
    t,
    [hookOutSeconds - 0.35, hookOutSeconds],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* Base talking head — carries the VO for the whole comp.
          NOTE: @remotion/media <Video> ignores objectFit in `style` — it MUST be a
          prop, or landscape (1920x1080) clips letterbox with black bars. */}
      <Video
        src={staticFile(videoSrc)}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Concept + storytelling B-roll cutaways (muted). */}
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
              objectFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Split-screen: study on top, Jade (time-synced) at the bottom. */}
      {splits.map((s, i) => {
        const from = Math.round(s.fromSeconds * fps);
        return (
          <Sequence
            key={`split-${i}`}
            from={from}
            durationInFrames={Math.round(s.durationInSeconds * fps)}
            premountFor={fps}
            name={`split-${i}`}
          >
            <AbsoluteFill style={{ background: "#000" }}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 1080,
                  height: SEAM,
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <Img
                  src={staticFile(studySrc)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: SEAM,
                  left: 0,
                  width: 1080,
                  height: 1920 - SEAM,
                  overflow: "hidden",
                  background: "#000",
                }}
              >
                {/* Jade scaled UP in her half of the split (zoom toward her face). */}
                <Video
                  src={staticFile(videoSrc)}
                  muted
                  trimBefore={from}
                  objectFit="cover"
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: "scale(1.4)",
                    transformOrigin: "50% 30%",
                  }}
                />
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* On-screen text hook — rendered only when hookText is set (removed per revision). */}
      {hookText ? (
        <AbsoluteFill style={{ opacity: hookOpacity }}>
          <div
            style={{
              position: "absolute",
              top: 138,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              padding: "0 60px",
            }}
          >
            <div
              style={{
                fontFamily: anton,
                fontSize: 66,
                lineHeight: 1.04,
                textAlign: "center",
                textTransform: "uppercase",
                color: "#fff",
                background: "rgba(8,8,10,0.62)",
                padding: "20px 42px 24px",
                borderRadius: 34,
                border: "2px solid rgba(255,255,255,0.16)",
                boxShadow: "0 10px 34px rgba(0,0,0,0.45)",
              }}
            >
              {hookText}
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* Captions on top. During each split window, pull them up onto the seam line
          (just below the study, at the top of Jade's half) instead of mid-face. */}
      <JadeCaptions
        captionsSrc={captionsSrc}
        positionOverrides={splits.map((s) => ({
          from: s.fromSeconds,
          to: s.fromSeconds + s.durationInSeconds,
          centerY: SEAM + 92,
        }))}
      />
    </AbsoluteFill>
  );
};
