// ─────────────────────────────────────────────────────────────
// BodyFatSplit — recreation of @mandohq's "fat loss changes your face"
// split-screen for Jade's version.
//   TOP ~⅔  : a woman's face at the current body-fat % (grey studio bg),
//             with a big italic "%" label top-left.
//   BOTTOM ⅓: Jade's talking head (loop-edited).
//   Captions sit near the seam.
// Face images are swapped per % as Jade names each percentage. If a face
// image isn't supplied yet, a labeled grey placeholder renders in its place.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  Img,
  CalculateMetadataFunction,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { z } from "zod";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { JadeCaptions } from "./JadeCaptions";

const inter = loadInter("normal", { weights: ["800"], subsets: ["latin"] }).fontFamily;

const SEAM = 1180; // top face area 0..1180, Jade 1180..1920
const FACE_BG = "#e7e7e7";

const faceSchema = z.object({
  pct: z.string(), // "40%"
  fromSeconds: z.number(),
  src: z.string().nullable().default(null), // "faces/face-40.png" or null placeholder
});

export const bodyFatSplitSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  faces: z.array(faceSchema),
  imageFit: z.enum(["cover", "contain"]).default("cover"), // "contain" for full-body refs
  imageBg: z.string().default("#e7e7e7"), // studio-grey behind a "contain" image
  imageZoom: z.number().default(1), // extra scale to crop margins / enlarge the subject
  imageObjPos: z.string().default("50% 50%"), // cover-crop anchor
});
export type BodyFatSplitProps = z.infer<typeof bodyFatSplitSchema>;

export const calculateBodyFatMetadata: CalculateMetadataFunction<BodyFatSplitProps> = ({
  props,
}) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

export const BodyFatSplit: React.FC<BodyFatSplitProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  faces,
  imageFit,
  imageBg,
  imageZoom,
  imageObjPos,
}) => {
  const frame = useCurrentFrame();
  const t = frame / fps;

  // active body-fat segment = last one whose fromSeconds <= t
  let active = faces[0];
  for (const f of faces) if (t >= f.fromSeconds) active = f;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* ── TOP: body-fat-% face ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: SEAM,
          background: imageBg,
          overflow: "hidden",
        }}
      >
        {active?.src ? (
          <Img
            src={staticFile(active.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: imageFit,
              objectPosition: imageObjPos,
              transform: `scale(${imageZoom})`,
            }}
          />
        ) : (
          // placeholder while faces aren't generated yet
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#b9b9b9",
              fontFamily: inter,
              fontWeight: 800,
              fontSize: 200,
              fontStyle: "italic",
            }}
          >
            {active?.pct}
          </div>
        )}
        {/* big italic % label, top-left */}
        <div
          style={{
            position: "absolute",
            top: 130,
            left: 56,
            color: "#fff",
            fontFamily: inter,
            fontWeight: 800,
            fontStyle: "italic",
            fontSize: 96,
            letterSpacing: "-0.02em",
            textShadow: "0 4px 18px rgba(0,0,0,0.55)",
          }}
        >
          {active?.pct}
        </div>
      </div>

      {/* ── BOTTOM: Jade talking head ── */}
      <div
        style={{
          position: "absolute",
          top: SEAM,
          left: 0,
          width: 1080,
          height: 1920 - SEAM,
          background: "#000",
          overflow: "hidden",
        }}
      >
        <Video
          src={staticFile(videoSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%" }}
        />
      </div>

      {/* ── captions near the seam ── */}
      <JadeCaptions captionsSrc={captionsSrc} centerY={SEAM - 40} />
    </AbsoluteFill>
  );
};
