import React from "react";
import type { Caption } from "@remotion/captions";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import timing from "./timing.json";

export type RatingItem = {
  text: string;
  score: number;
  ideaAt: number;
  scoreAt: number;
  endAt: number;
};

export type OverlayProps = { preview?: boolean };

const ITEMS: RatingItem[] = timing.items;
const CAPTIONS: Caption[] = timing.captions;
const FONT = "Arial, Helvetica, sans-serif";
const NARROW = "'Arial Narrow', Arial, Helvetica, sans-serif";
const BOARD = { left: 100, top: 1090, width: 880, labelWidth: 96, gap: 5 };
const BODY_LEFT = BOARD.left + BOARD.labelWidth + 6;
const BODY_WIDTH = BOARD.width - BOARD.labelWidth - 6;
const LINE_HEIGHT = 32;
const LABEL_FONT_SIZE = 28.5;
const SHADOW = "0 3px 7px rgba(0,0,0,0.75)";
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Reserve the final capacity from frame one, so all entries keep their positions.
const BANDS = [
  { label: "9–10", min: 9, max: 10, color: "#E63C39", height: 60, capacity: 0 },
  { label: "7–8", min: 7, max: 8, color: "#FA913A", height: 88, capacity: 2 },
  { label: "5–6", min: 5, max: 6, color: "#F9D43D", height: 120, capacity: 3 },
  { label: "3–4", min: 3, max: 4, color: "#39B85C", height: 60, capacity: 0 },
  { label: "1–2", min: 1, max: 2, color: "#218ACE", height: 280, capacity: 8 },
  { label: "0", min: 0, max: 0, color: "#AC279F", height: 54, capacity: 1 },
];

const bandIndex = (score: number) => BANDS.findIndex((band) => score >= band.min && score <= band.max);
const rowTop = (index: number) => BOARD.top + BANDS.slice(0, index).reduce((sum, band) => sum + band.height + BOARD.gap, 0);

const captionIsScore = (caption: Caption) => ITEMS.some((item) =>
  caption.startMs >= item.scoreAt * 1000 - 10 && caption.startMs < item.endAt * 1000,
);

// Keep the reference's short, white one- or two-word caption rhythm.
const CAPTION_GROUPS: Caption[] = [];
for (let index = 0; index < CAPTIONS.length; index++) {
  const first = CAPTIONS[index];
  const second = CAPTIONS[index + 1];
  const firstText = first.text.trim();
  const secondText = second?.text.trim();
  const canCombine = second &&
    firstText.split(/\s+/).length === 1 && secondText.split(/\s+/).length === 1 &&
    firstText.length + secondText.length <= 17 &&
    !/[.!?]$/.test(firstText) &&
    second.startMs - first.endMs < 250 &&
    captionIsScore(first) === captionIsScore(second);
  if (canCombine) {
    CAPTION_GROUPS.push({ ...first, text: `${firstText} ${secondText}`, endMs: second.endMs });
    index++;
  } else {
    CAPTION_GROUPS.push({ ...first, text: firstText });
  }
}

export const Overlay: React.FC<OverlayProps> = ({ preview = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opening = interpolate(frame, [0, 0.8 * fps], [0, 1], CLAMP);
  const openingStyle: React.CSSProperties = {
    filter: opening < 1 ? `blur(${18 * (1 - opening)}px)` : undefined,
    transform: `scale(${1 + 0.1 * (1 - opening)})`,
    transformOrigin: "50% 50%",
  };

  return (
    <AbsoluteFill style={{ color: "white", fontFamily: FONT }}>
      {preview ? (
        <AbsoluteFill style={{ background: "#000", ...openingStyle }}>
          <Img src={staticFile("preview.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={openingStyle}>
        <div style={{
          position: "absolute", top: 1000, left: 0, width: 1080, height: 920,
          background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.50) 23%, #000 49%, #000 100%)",
        }} />
        <Title frame={frame} fps={fps} />
        <Board />
        {ITEMS.map((item, index) => <Idea key={item.text} item={item} index={index} frame={frame} fps={fps} />)}
        <SpeechCaption frame={frame} fps={fps} />
        <div style={{
          position: "absolute", left: BOARD.left, top: 1808, width: BOARD.width,
          color: "rgba(255,255,255,0.56)", fontSize: 20, fontWeight: 700,
          letterSpacing: 1.7, textAlign: "center",
        }}>EDITORIAL WRITING SCORES</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Board: React.FC = () => (
  <>
    {BANDS.map((band, index) => (
      <React.Fragment key={band.label}>
        <div style={{
          position: "absolute", left: BOARD.left, top: rowTop(index),
          width: BOARD.labelWidth, height: band.height, background: band.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid rgba(0,0,0,0.75)", boxSizing: "border-box",
          fontWeight: 900, fontSize: band.label === "0" ? 38 : 30,
          letterSpacing: -1, color: index === 1 || index === 2 ? "#191B20" : "#fff",
        }}>{band.label}</div>
        <div style={{
          position: "absolute", left: BODY_LEFT, top: rowTop(index),
          width: BODY_WIDTH, height: band.height, boxSizing: "border-box",
          border: "2px solid #969C9F", backgroundColor: "rgba(29,35,38,0.96)",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
      </React.Fragment>
    ))}
  </>
);

const Idea: React.FC<{ item: RatingItem; index: number; frame: number; fps: number }> = ({ item, index, frame, fps }) => {
  if (frame < Math.round(item.ideaAt * fps)) return null;
  const rowIndex = bandIndex(item.score);
  const row = BANDS[rowIndex];
  const slot = ITEMS.slice(0, index).filter((previous) => bandIndex(previous.score) === rowIndex).length;
  const finalTop = rowTop(rowIndex) + (row.height - row.capacity * LINE_HEIGHT) / 2 + slot * LINE_HEIGHT;
  const progress = interpolate(frame, [item.scoreAt * fps, (item.scoreAt + 0.3) * fps], [0, 1], {
    ...CLAMP, easing: Easing.inOut(Easing.cubic),
  });
  const fontSize = interpolate(progress, [0, 1], [item.text.length > 38 ? 37 : 39, LABEL_FONT_SIZE]);
  const textLeft = interpolate(progress, [0, 1], [540, BODY_LEFT + 16]);
  const textTop = interpolate(progress, [0, 1], [995, finalTop]);

  return (
    <>
      <div style={{
        position: "absolute", left: textLeft, top: textTop,
        transform: `translateX(${-50 * (1 - progress)}%)`,
        fontSize, fontWeight: 700, lineHeight: `${interpolate(progress, [0, 1], [46, LINE_HEIGHT])}px`,
        whiteSpace: "nowrap", textShadow: SHADOW, letterSpacing: -0.35,
      }}>{item.text}</div>
      {progress > 0 ? (
        <div style={{
          position: "absolute", left: BOARD.left + BOARD.width - 74, top: finalTop,
          width: 56, lineHeight: `${LINE_HEIGHT}px`, textAlign: "right",
          opacity: interpolate(progress, [0.5, 1], [0, 1], CLAMP),
          fontSize: 25, fontWeight: 700, color: "#E4E8E9", fontVariantNumeric: "tabular-nums",
        }}>{item.score}/10</div>
      ) : null}
    </>
  );
};

const Title: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [3 * fps, 3.3 * fps], [1, 0], CLAMP);
  if (opacity === 0) return null;
  return (
    <div style={{
      position: "absolute", left: 130, top: 180, width: 820, height: 150,
      borderRadius: 40, background: "#fff", color: "#111", opacity,
      display: "flex", justifyContent: "center", alignItems: "center",
      textAlign: "center", fontWeight: 800, fontSize: 46, lineHeight: 1.02,
      boxShadow: "0 4px 15px rgba(0,0,0,0.32)", letterSpacing: -1.2,
    }}>
      <span>Rating MiM career-goal<br />essay ideas</span>
    </div>
  );
};

const SpeechCaption: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const seconds = frame / fps;
  const score = ITEMS.find((item) => seconds >= item.scoreAt && seconds < item.endAt);
  const current = CAPTION_GROUPS.find((caption) => seconds * 1000 >= caption.startMs && seconds * 1000 < caption.endMs);
  if (!score && !current) return null;
  return (
    <div style={{
      position: "absolute", left: 60, top: score ? 845 : 870, width: 960,
      textAlign: "center", fontFamily: score ? NARROW : FONT,
      fontWeight: score ? 900 : 800, fontStyle: score ? "italic" : "normal",
      fontSize: score ? 102 : 78, lineHeight: 1.1,
      letterSpacing: score ? -4 : -2.1,
      transform: score ? "scaleX(0.88)" : undefined,
      color: score ? "#03C9F2" : "#fff",
      textShadow: score ? "0 4px 14px rgba(0,0,0,0.82)" : "0 4px 14px rgba(0,0,0,0.78), 0 0 3px rgba(0,0,0,0.55)",
      whiteSpace: "nowrap",
    }}>{score ? `${score.score}/10` : current?.text.replace(/[.,!?]$/, "")}</div>
  );
};
