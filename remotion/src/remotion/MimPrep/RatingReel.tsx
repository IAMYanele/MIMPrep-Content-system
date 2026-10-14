import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Roboto";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { ITEMS, type Item } from "./data";

// The reference reel's tier labels and entries are Roboto; matched by comparing
// glyph shapes against the reference frames (Black 900 for the scale numbers).
const { fontFamily: ROBOTO } = loadFont("normal", { weights: ["700", "900"], subsets: ["latin"] });
const HEAVY = `${ROBOTO}, Arial, Helvetica, sans-serif`;

// Instagram's own text tool renders in Instagram Sans, a tight neo-grotesque;
// Inter is the closest thing available here.
const { fontFamily: INTER } = loadInter("normal", { weights: ["600", "700"], subsets: ["latin"] });
const IG_FONT = `${INTER}, "Helvetica Neue", Arial, sans-serif`;

// MIM Prep — "Rating your career-goal essay ideas" (Mathilde, Script 3).
//
// Built to the Tier List Reel SOP: talking head full-bleed, the scale fixed in the
// lower half and visible from the first frame, word-by-word captions above it,
// headline pill on the opening line.
//
// The scale is one row per score rather than banded pairs, matching the reference
// grid the client supplied: ten rows 10..1 running red -> purple, plus a row for 0,
// because she scores one idea "zero out of ten" out loud and the graphic has to be
// able to show it.

// --- geometry, in the 1080x1920 frame -------------------------------------
const ROW_MIN = 56;
const ROW_PAD = 12;
const LINE_H = 24;   // one placed idea
const ROW_GAP = 8;
const LABEL_X = 44;
const LABEL_W = 136; // the client's grid uses a 2:1 colour box
const SLOT_X = 192;
const SLOT_RIGHT = 1036;
// The scale is bottom-anchored clear of the platform UI, the way the reference
// reel ends at 90% of frame height.
const LIST_BOTTOM = 1764;

// The client asked for a white stroke; the reference reel's is a light grey, so
// this is deliberately brighter than the source material.
const STROKE = "#FFFFFF";
const STROKE_W = 3;
const SLOT_BG = "#1A191C"; // sampled from the supplied grid
const TEXT_SHADOW = "0 3px 8px rgba(0,0,0,0.9)";

// Sampled directly from the grid image the client attached.
const BANDS: { label: string; score: number; colour: string }[] = [
  { label: "10", score: 10, colour: "#FC3435" },
  { label: "9", score: 9, colour: "#FB6447" },
  { label: "8", score: 8, colour: "#FD9836" },
  { label: "7", score: 7, colour: "#FDD236" },
  { label: "6", score: 6, colour: "#FDFD64" },
  { label: "5", score: 5, colour: "#ACE555" },
  { label: "4", score: 4, colour: "#75D974" },
  { label: "3", score: 3, colour: "#34CFF6" },
  { label: "2", score: 2, colour: "#45A2FB" },
  { label: "1", score: 1, colour: "#C068EE" },
  // Off the end of the client's grid: kept desaturated so the 1-10 rainbow still
  // reads as the scale and this reads as "below it".
  { label: "0", score: 0, colour: "#6E6A74" },
];

// Light rows need dark numerals to stay legible.
const inkFor = (colour: string) =>
  ["#FDD236", "#FDFD64", "#ACE555", "#FD9836", "#75D974"].includes(colour)
    ? "#131417"
    : "#FFFFFF";

const rowOf = (score: number) => BANDS.findIndex((b) => b.score === score);

// Size every row for the ideas it will EVENTUALLY hold, and lay the scale out
// once. Growing rows as ideas land would shunt the whole grid around mid-video,
// and a fixed height clipped the row that ends up with five of them.
const ROW_HEIGHTS = BANDS.map((b) => {
  const n = ITEMS.filter((it) => it.score === b.score).length;
  return Math.max(ROW_MIN, ROW_PAD + n * LINE_H);
});
const LIST_H =
  ROW_HEIGHTS.reduce((a, b) => a + b, 0) + ROW_GAP * (BANDS.length - 1);
const LIST_TOP = LIST_BOTTOM - LIST_H;
const ROW_TOPS = ROW_HEIGHTS.reduce<number[]>((acc, h, i) => {
  acc.push(i === 0 ? LIST_TOP : acc[i - 1] + ROW_HEIGHTS[i - 1] + ROW_GAP);
  return acc;
}, []);

export const RatingReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // The SOP's "first blur zoom" opening, resolving into the composition.
  const open = interpolate(frame, [0, Math.round(fps * 1.2)], [0, 1], { extrapolateRight: "clamp" });
  const openBlur = (1 - open) * 18;
  // Lift her in frame so the scale has room underneath without landing on her chin.
  // `scale(s) translateY(-S)` applies the translate INSIDE the scale, so the real
  // shift is s*S, not S. The zoom therefore has to satisfy 960s - s*S >= 960, i.e.
  // s >= 960 / (960 - S); getting this wrong left a black bar under the grid.
  const SHIFT = 220;
  const baseScale = Math.max(1.32, 960 / (960 - SHIFT) + 0.02) + 0.08 * (1 - open);

  const placed = ITEMS.filter((it) => t >= it.scoreAt);
  // The idea being read out, parked in the top row until it is scored.
  const pending = ITEMS.find((it) => t >= it.ideaAt - 0.15 && t < it.scoreAt);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          filter: openBlur > 0.1 ? `blur(${openBlur}px)` : undefined,
          transform: `scale(${baseScale}) translateY(${-SHIFT}px)`,
        }}
      >
        <OffthreadVideo src={staticFile("mim/base-trim.mp4")} />
      </AbsoluteFill>

      <Headline frame={frame} fps={fps} />

      {BANDS.map((band, i) => (
        <Row
          key={band.label}
          band={band}
          items={placed.filter((it) => rowOf(it.score) === i)}
          pending={i === 0 ? pending : undefined}
          top={ROW_TOPS[i]}
          height={ROW_HEIGHTS[i]}
          frame={frame}
          fps={fps}
        />
      ))}
    </AbsoluteFill>
  );
};

const Row: React.FC<{
  band: (typeof BANDS)[number];
  items: Item[];
  pending?: Item;
  top: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ band, items, pending, top, height, frame, fps }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: LABEL_X,
        top,
        width: LABEL_W,
        height,
        background: band.colour,
        border: `${STROKE_W}px solid ${STROKE}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: HEAVY,
        fontWeight: 900,
        fontSize: 42,
        lineHeight: 1,
        color: inkFor(band.colour),
      }}
    >
      {band.label}
    </div>
    <div
      style={{
        position: "absolute",
        left: SLOT_X,
        top,
        width: SLOT_RIGHT - SLOT_X,
        height,
        background: SLOT_BG,
        border: `${STROKE_W}px solid ${STROKE}`,
        boxSizing: "border-box",
        padding: "0 18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 2,
        overflow: "hidden",
      }}
    >
      {pending ? <PendingLine item={pending} frame={frame} fps={fps} /> : null}
      {items.map((item) => {
        const entry = spring({
          frame: frame - Math.round(item.scoreAt * fps),
          fps,
          config: { damping: 200, mass: 0.5 },
        });
        return (
          <div
            key={item.text}
            style={{
              display: "flex",
              alignItems: "center",
              opacity: entry,
              transform: `translateY(${(1 - entry) * -12}px)`,
              fontFamily: HEAVY,
              fontWeight: 700,
              // two entries in one row still have to fit inside its height
              fontSize: items.length > 2 ? 21 : 25,
              lineHeight: LINE_H / (items.length > 2 ? 21 : 25),
              color: "#FFFFFF",
              textShadow: TEXT_SHADOW,
              whiteSpace: "nowrap",
            }}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  </>
);

// The idea being read out sits in the always-empty top row, the way the reference
// parks the current category above the ranking before it is placed.
const PendingLine: React.FC<{ item: Item; frame: number; fps: number }> = ({ item, frame, fps }) => {
  const inP = spring({ frame: frame - Math.round(item.ideaAt * fps), fps, config: { damping: 200, mass: 0.5 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: inP,
        transform: `translateY(${(1 - inP) * -10}px)`,
        fontFamily: HEAVY,
        fontWeight: 700,
        fontSize: item.text.length > 34 ? 26 : 30,
        lineHeight: 1,
        color: "#FFFFFF",
        textShadow: TEXT_SHADOW,
        whiteSpace: "nowrap",
      }}
    >
      {item.text}
    </div>
  );
};

// Styled like Instagram's native text tool: each LINE gets its own white pill
// hugging its own width, the lines sit flush so the shape reads as continuous,
// black text, and no drop shadow — IG draws none.
const HEADLINE_LINES = ["RATING MIM CAREER-GOAL", "ESSAY IDEAS"];

const Headline: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const inP = spring({ frame, fps, config: { damping: 200, mass: 0.6 } });
  const out = interpolate(frame, [Math.round(fps * 3.2), Math.round(fps * 3.8)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (out <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 0,
        width: 1080,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        opacity: inP * out,
        transform: `translateY(${(1 - inP) * -24}px)`,
      }}
    >
      {HEADLINE_LINES.map((line) => (
        <span
          key={line}
          style={{
            background: "#FFFFFF",
            borderRadius: 14,
            padding: "7px 22px",
            fontFamily: IG_FONT,
            fontWeight: 700,
            fontSize: 48,
            lineHeight: 1.22,
            letterSpacing: -0.6,
            color: "#000000",
            whiteSpace: "nowrap",
          }}
        >
          {line}
        </span>
      ))}
    </div>
  );
};
