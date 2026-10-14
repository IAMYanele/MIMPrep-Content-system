/**
 * Animation 1 — "The Death List"
 * Layout: Cards grid centered in middle third, verdict text in lower third.
 */
import {
  fontFamily,
  loadFont,
} from "@remotion/google-fonts/PlusJakartaSans";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BackgroundGlow,
  DiagonalMotif,
  FadeToBlack,
  FilmGrain,
} from "./Overlays";
import {
  C,
  EASE_OUT,
  EASE_IN,
  ENTRANCE,
  STAGGER,
  TYPE,
  WIDTH,
  HEIGHT,
  glassCard,
} from "./shared";

loadFont("normal", { subsets: ["latin"], weights: ["400", "700"] });

const icons: Record<string, string> = {
  graduation:
    "M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm0 12.55L5 12.6v-1.2L12 14.35 19 11.4v1.2L12 15.55z",
  document:
    "M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h8v2H8v-2zm0 4h5v2H8v-2z",
  grid: "M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z",
  terminal:
    "M4 17.27V20h2.73l8.04-8.04-2.73-2.73L4 17.27zM20.71 5.63l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83a1 1 0 000-1.41z",
  ghost:
    "M12 2a9 9 0 00-9 9v11l3-3 3 3 3-3 3 3 3-3 3 3V11a9 9 0 00-9-9zm-3 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z",
  clipboard:
    "M16 1H8a2 2 0 00-2 2v1H4a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-2V3a2 2 0 00-2-2zm0 2v1H8V3h8zM4 6h16v14H4V6z",
};

const cards = [
  { label: "Generic Course", icon: "graduation" },
  { label: "$5 PDF", icon: "document" },
  { label: "Notion Template", icon: "grid" },
  { label: "Prompt Pack", icon: "terminal" },
  { label: "Faceless Guide", icon: "ghost" },
  { label: "Copy-Paste Offer", icon: "clipboard" },
];

// 3×2 grid centered horizontally in the middle third
const CARD_W = 220;
const CARD_H = 80;
const GAP = 16;
const COLS = 3;
const GRID_W = COLS * CARD_W + (COLS - 1) * GAP;
const GRID_X = (WIDTH - GRID_W) / 2;
const GRID_Y = 340;

const cardPositions = cards.map((_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return {
    x: GRID_X + col * (CARD_W + GAP),
    y: GRID_Y + row * (CARD_H + GAP),
  };
});

const ProductCard: React.FC<{
  label: string;
  icon: string;
  index: number;
  gridDim: number;
}> = ({ label, icon, index, gridDim }) => {
  const frame = useCurrentFrame();

  const delay = index * STAGGER;
  const enterProgress = interpolate(
    frame,
    [delay, delay + ENTRANCE],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  const overshootY = interpolate(enterProgress, [0, 0.7, 1], [24, -2, 0]);

  const strikeStart = delay + ENTRANCE + 12;
  const strikeProgress = interpolate(
    frame,
    [strikeStart, strikeStart + 9],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN },
  );

  const gridOpacity = interpolate(gridDim, [0, 1], [1, 0.25]);
  const pos = cardPositions[index];

  return (
    <div
      style={{
        ...glassCard,
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: CARD_W,
        height: CARD_H,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 20px",
        opacity: enterProgress * gridOpacity,
        transform: `translateY(${overshootY}px)`,
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill={C.iceWhite} opacity={0.5}>
        <path d={icons[icon]} />
      </svg>
      <span style={{ fontFamily, ...TYPE.tertiary, color: C.iceWhite, opacity: 0.85 }}>
        {label}
      </span>
      {/* Red strikethrough — accent */}
      <svg
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox={`0 0 ${CARD_W} ${CARD_H}`}
        preserveAspectRatio="none"
      >
        <line
          x1="16" y1={CARD_H - 16} x2={CARD_W - 16} y2="16"
          stroke={C.red} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="350" strokeDashoffset={350 * (1 - strikeProgress)}
        />
      </svg>
    </div>
  );
};

export const DeathList: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lastStrikeEnd = (cards.length - 1) * STAGGER + ENTRANCE + 12 + 9;

  const gridDimProgress = interpolate(
    frame,
    [lastStrikeEnd + 6, lastStrikeEnd + 6 + ENTRANCE],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Verdict text — centered in lower third
  const verdictDelay = lastStrikeEnd + 6 + 4;
  const verdictOpacity = interpolate(
    frame,
    [verdictDelay, verdictDelay + ENTRANCE],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );
  const verdictY = interpolate(
    frame,
    [verdictDelay, verdictDelay + ENTRANCE],
    [16, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <BackgroundGlow x="50%" y="45%" size={700} />
      <DiagonalMotif position="top-right" delay={2} />

      {/* Cards — centered 3×2 grid in middle third */}
      {cards.map((card, i) => (
        <ProductCard
          key={i}
          label={card.label}
          icon={card.icon}
          index={i}
          gridDim={gridDimProgress}
        />
      ))}

      {/* Verdict — centered in lower third */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: HEIGHT / 4 - 20,
          textAlign: "center",
          opacity: verdictOpacity,
          transform: `translateY(${verdictY}px)`,
        }}
      >
        <h2 style={{ fontFamily, ...TYPE.primary, color: C.iceWhite, margin: 0 }}>
          THESE ARE DEAD.
        </h2>
      </div>

      <FilmGrain />
      <FadeToBlack startFrame={Math.round(7.5 * fps)} />
    </AbsoluteFill>
  );
};
