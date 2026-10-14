// ─────────────────────────────────────────────────────────────
// HomeownersPainters — "homeowners painters picks guide"
//
// Source is the TIGHT Premiere cut (72s → 54.44s: dead air, breath
// pauses, and the flubbed outro removed) exported WITHOUT captions,
// so the caption layer is drawn here instead of being baked in.
//
// Same shape as JadeShort: full-bleed video + gentle Ken-Burns, with
// the caption layer on top. Captions use the Devin Jatho glow
// treatment (see GlowCaptions).
//
// Assets in public/:
//   hpg-video.mp4     — uncaptioned tight cut, 1080×1920 @ 25fps
//   hpg-captions.json — word tokens, corrected text + aligned timings
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { GlowCaptions } from "./GlowCaptions";

export const HPG_FPS = 25;
export const HPG_DURATION = Math.ceil(54.44 * HPG_FPS); // 1361

const VIDEO_SRC = "hpg-video.mp4";
const CAPTIONS_SRC = "hpg-captions.json";

export const HomeownersPainters: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Gentle continuous Ken-Burns, matching JadeShort: 1.00 ↔ 1.08 on a
  // 10s sin period. Always ≥1.00 so the frame never letterboxes.
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
          src={staticFile(VIDEO_SRC)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <GlowCaptions captionsSrc={CAPTIONS_SRC} />
    </AbsoluteFill>
  );
};
