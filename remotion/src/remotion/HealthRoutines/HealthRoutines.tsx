// ─────────────────────────────────────────────────────────────
// HealthRoutines — 3D-emoji overlay for general_health_routines.mp4
// The source video already has three empty color-coded boxes burned
// in (RED = bad, ORANGE = okay, GREEN = perfect).
//
// Design (per direction):
//  • 3D / emoji-style glyphs (Microsoft Fluent 3D), placed DIRECTLY on
//    the colored box (no tile/chip).
//  • ONE icon per topic, shared across the three tiers; a small value
//    pill in the bottom corner shows the amount (grams / hours / days…).
//  • ONLY the current topic is on screen — each tier's emoji pops in when
//    spoken, all three hold, then the whole topic swaps out for the next.
//
//   Training · Rest · Protein · Sleep · Engagement
//
// Box geometry pixel-detected from the rendered frame:
//   RED x 22–350 | ORANGE x 369–697 | GREEN x 716–1044  (all y 132–446)
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["800"], subsets: ["latin"] });

export const GHR_FPS = 25;
export const GHR_DURATION = Math.ceil(47.76 * GHR_FPS); // 1194

const VIDEO_SRC = "ghr-video.mp4";

// ── Box geometry (pixel-detected) ──────────────────────────────
const BOX_Y = 132;
const BOX_H = 314;
const BOX_CY = BOX_Y + BOX_H / 2; // 289

type Tier = "red" | "orange" | "green";
const BOX: Record<Tier, { cx: number; pill: string }> = {
  red: { cx: 186, pill: "#D81E27" },
  orange: { cx: 533, pill: "#C26A06" },
  green: { cx: 880, pill: "#159B2B" },
};
const TIERS: Tier[] = ["red", "orange", "green"];

const EMOJI = 210; // on-box emoji size

// ── Topics: shared emoji + per-tier value + entrance time. ─────
// exit = the frame the whole topic swaps out (= next topic's first onset).
type Cell = { t: number; value: string | null; emoji?: string };
type Topic = { emoji: string; exit: number; cells: Record<Tier, Cell> };

const TOPICS: Topic[] = [
  {
    emoji: "muscle.png", // training frequency
    exit: 8.78,
    cells: {
      red: { t: 0.49, value: "7D" },
      orange: { t: 3.79, value: "6D" },
      green: { t: 6.31, value: "3-4D" },
    },
  },
  {
    emoji: "stopwatch.png", // rest between sets
    exit: 18.77,
    cells: {
      red: { t: 8.78, value: "30S" },
      orange: { t: 12.81, value: "1-2M" },
      green: { t: 15.21, value: "2-3M" },
    },
  },
  {
    emoji: "meat.png", // protein per kilo
    exit: 32.19,
    cells: {
      red: { t: 18.77, value: "1G" },
      orange: { t: 24.06, value: "1.6G" },
      green: { t: 27.43, value: "2.2G" },
    },
  },
  {
    emoji: "bed.png", // sleep hours
    exit: 40.36,
    cells: {
      red: { t: 32.19, value: "4H" },
      orange: { t: 35.5, value: "6H" },
      green: { t: 37.97, value: "7-8H" },
    },
  },
  {
    emoji: "thumbsdown.png", // engagement — distinct emoji per cell, no value
    exit: 47.76,
    cells: {
      red: { t: 40.36, value: null, emoji: "thumbsdown.png" },
      orange: { t: 43.6, value: null, emoji: "bookmark.png" },
      green: { t: 45.99, value: null, emoji: "plus.png" },
    },
  },
];

const EmojiCell: React.FC<{
  tier: Tier;
  emoji: string;
  cell: Cell;
  exit: number;
}> = ({ tier, emoji, cell, exit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterF = Math.round(cell.t * fps);
  const exitF = Math.round(exit * fps);
  if (frame < enterF || frame >= exitF) return null;

  // pop in
  const enter = spring({
    frame: frame - enterF,
    fps,
    config: { damping: 12, stiffness: 170 },
  });
  // swap out over the last 7 frames of the topic window
  const out = interpolate(frame, [exitF - 7, exitF], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(enter, [0, 1], [0.2, 1]) * interpolate(out, [0, 1], [1, 0.6]);
  const opacity =
    interpolate(enter, [0, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    (1 - out);

  const box = BOX[tier];
  const hasPill = cell.value !== null;

  return (
    <div
      style={{
        position: "absolute",
        left: box.cx - EMOJI / 2,
        top: BOX_CY - EMOJI / 2,
        width: EMOJI,
        height: EMOJI,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <Img
        src={staticFile(`emoji/${cell.emoji ?? emoji}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.35))",
        }}
      />
      {hasPill && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 14,
            background: "#FFFFFF",
            color: box.pill,
            fontFamily,
            fontWeight: 800,
            fontSize: 26,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            padding: "7px 13px",
            borderRadius: 999,
            boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
          }}
        >
          {cell.value}
        </div>
      )}
    </div>
  );
};

export const HealthRoutines: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* Base: the rendered video with the empty boxes already in it */}
      <Video
        src={staticFile(VIDEO_SRC)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Current-topic emoji on each box */}
      {TOPICS.flatMap((topic) =>
        TIERS.map((tier) => (
          <EmojiCell
            key={`${topic.emoji}-${tier}`}
            tier={tier}
            emoji={topic.emoji}
            cell={topic.cells[tier]}
            exit={topic.exit}
          />
        )),
      )}
    </AbsoluteFill>
  );
};
