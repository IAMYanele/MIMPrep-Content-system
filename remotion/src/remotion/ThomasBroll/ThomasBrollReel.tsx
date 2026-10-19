import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

// Thomas b-roll reel: vertical talking head, 2-word white-pill captions, full-screen
// b-roll cutaways with his audio running underneath. Built from the "2 - Talk about
// your background" edit (ThomasBg) and made data-driven: every job passes its own
// edit.json as props, so no code changes per video. The skill that drives this is
// .claude/skills/thomas-broll-reel in the MIMPrep-Content-system repo.
//
// Everything referenced here is relative to the render's --public-dir:
//   base.mp4        the reframed, tightened talking head (rendered muted; audio is muxed after)
//   broll/NN.mp4    cutaways already cropped to 1080x1920 on their subject

export type Chunk = { text: string; start: number; end: number };
export type Cutaway = { src: string; from: number; dur: number; why?: string };
export type ThomasBrollProps = {
  base: string;
  durationInSeconds: number;
  fps: number;
  chunks: Chunk[];
  broll: Cutaway[];
};

const { fontFamily: INTER } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const FONT = `${INTER}, "Helvetica Neue", Arial, sans-serif`;

// Measured off the reference reel at 1080x1920: pill top 58.5% down, 78px tall around
// ~54px of ink, white with black text, hugging the words. Don't re-derive.
const PILL_TOP = 1124;
const FONT_SIZE = 56;
const PILL_RADIUS = 10;

export const thomasBrollDefaults: ThomasBrollProps = {
  base: "base.mp4",
  durationInSeconds: 10,
  fps: 25,
  chunks: [],
  broll: [],
};

export const calculateThomasBrollMetadata: CalculateMetadataFunction<ThomasBrollProps> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.round(props.durationInSeconds * props.fps)),
  fps: props.fps,
  width: 1080,
  height: 1920,
});

export const ThomasBrollReel: React.FC<ThomasBrollProps> = ({ base, chunks, broll }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill>
        <OffthreadVideo src={staticFile(base)} muted />
      </AbsoluteFill>

      {/* Each cutaway MUST sit in its own Sequence. OffthreadVideo reads the current
          composition frame, so outside a Sequence a 2-second clip placed at 16s is asked
          for its 16-second mark, runs past its end and holds the last frame: every
          cutaway in the first build froze. Inside a Sequence its clock starts at zero. */}
      {broll.map((b, i) => (
        <Sequence
          key={`${b.src}-${i}`}
          from={Math.round(b.from * fps)}
          durationInFrames={Math.max(1, Math.round(b.dur * fps))}
          layout="none"
        >
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile(b.src)}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      <Caption t={t} chunks={chunks} />
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ t: number; chunks: Chunk[] }> = ({ t, chunks }) => {
  const current = chunks.find((c) => t >= c.start && t < c.end);
  if (!current) return null;
  // a small settle on each new chunk, matching the reference's snap
  const pop = interpolate(t - current.start, [0, 0.09], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: PILL_TOP,
        left: 0,
        width: 1080,
        display: "flex",
        justifyContent: "center",
        transform: `scale(${pop})`,
      }}
    >
      <span
        style={{
          background: "#FFFFFF",
          borderRadius: PILL_RADIUS,
          padding: "8px 20px",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: FONT_SIZE,
          lineHeight: 1.12,
          letterSpacing: -0.5,
          color: "#000000",
          whiteSpace: "nowrap",
        }}
      >
        {current.text}
      </span>
    </div>
  );
};
