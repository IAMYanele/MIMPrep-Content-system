import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { BROLL, CHUNKS } from "./data";

// "2 — Talk about your background", cut to the style of the reference reel in the
// same folder: vertical talking head, tight word-chunk captions in a white pill,
// and full-screen b-roll cutaways.
//
// The source is a 4K landscape interview; base.mp4 is already cropped to the 9:16
// slice he sits in and has its dead air removed, so this composition only has to
// add the captions and lay the cutaways over the top.

const { fontFamily: INTER } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const FONT = `${INTER}, "Helvetica Neue", Arial, sans-serif`;

// Measured off the reference frame at 1080x1920: the pill sits 58.5% down, is 78px
// tall around 54px of ink, white with black text, and hugs the words.
const PILL_TOP = 1124;
const FONT_SIZE = 56;
const PILL_RADIUS = 10;

export const ThomasBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill>
        <OffthreadVideo src={staticFile("tbg/base.mp4")} />
      </AbsoluteFill>

      {/* Each cutaway needs its own Sequence. OffthreadVideo reads the CURRENT
          composition frame, so without one it asks a 2-second clip for its
          16-second mark, runs past the end and holds the last frame - every
          cutaway froze. Inside a Sequence the clock restarts at zero. */}
      {BROLL.map((b) => (
        <Sequence
          key={b.src}
          from={Math.round(b.from * fps)}
          durationInFrames={Math.round(b.dur * fps)}
          layout="none"
        >
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile(`tbg/${b.src}`)}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      <Caption t={t} />
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ t: number }> = ({ t }) => {
  const current = CHUNKS.find((c) => t >= c.start && t < c.end);
  if (!current) return null;
  // a small settle on each new chunk, matching the reference's snap
  const age = t - current.start;
  const pop = interpolate(age, [0, 0.09], [0.94, 1], {
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
