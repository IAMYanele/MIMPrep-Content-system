/**
 * Animation 2 — "Information Is Free"
 * Layout: Product card + tiles centered in middle third, text in lower third.
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

const freeTiles = [
  { icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z", label: "YouTube" },
  { icon: "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1114 9.5 4.5 4.5 0 019.5 14z", label: "Google" },
  { icon: "M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z", label: "ChatGPT" },
  { icon: "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z", label: "Blogs" },
  { icon: "M12 1a9 9 0 00-2.83 17.52c-.16-.38-.29-.83-.29-1.18v-2.16A3.27 3.27 0 017 12a3.5 3.5 0 010-7 3.27 3.27 0 011.88 2.18V5a9 9 0 00-6.88 8.72A9 9 0 1012 1z", label: "Podcasts" },
  { icon: "M4 6h18V4H4a2 2 0 00-2 2v11H0v3h14v-3H4V6zm19 2h-6a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V9a1 1 0 00-1-1zm-1 9h-4v-7h4v7z", label: "Courses" },
];

// Tile positions — symmetric ring around center of middle third
const CX = WIDTH / 2;
const CY = 460;
const tilePositions = freeTiles.map((_, i) => {
  const angle = (i / freeTiles.length) * Math.PI * 2 - Math.PI / 2;
  const radius = 220;
  return {
    x: CX + Math.cos(angle) * radius - 60,
    y: CY + Math.sin(angle) * radius - 28,
  };
});

export const InformationFree: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Product card entrance
  const cardProgress = interpolate(
    frame, [0, ENTRANCE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );
  const cardSlideY = interpolate(cardProgress, [0, 1], [20, 0]);

  // Tiles staggered after card
  const tilesBaseDelay = ENTRANCE + 6;
  const tileEntrances = freeTiles.map((_, i) => {
    const delay = tilesBaseDelay + i * STAGGER;
    return interpolate(
      frame, [delay, delay + ENTRANCE], [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
    );
  });

  const allTilesDone = tilesBaseDelay + (freeTiles.length - 1) * STAGGER + ENTRANCE;

  // Progress bar
  const barDelay = allTilesDone + 8;
  const barEntrance = interpolate(
    frame, [barDelay, barDelay + ENTRANCE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );
  const barFill = interpolate(
    frame, [barDelay + 4, barDelay + ENTRANCE + 12], [0, 0.8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Verdict text
  const textDelay = barDelay + ENTRANCE;
  const textOpacity = interpolate(
    frame, [textDelay, textDelay + ENTRANCE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );
  const textSlideY = interpolate(
    frame, [textDelay, textDelay + ENTRANCE], [14, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Dim phase
  const dimDelay = textDelay + ENTRANCE + 10;
  const dimProgress = interpolate(
    frame, [dimDelay, dimDelay + ENTRANCE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN },
  );
  const cardDim = interpolate(dimProgress, [0, 1], [1, 0.25]);
  const tileBrighten = interpolate(dimProgress, [0, 1], [0.55, 0.9]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <BackgroundGlow x="50%" y="42%" size={650} />
      <DiagonalMotif position="top-right" delay={2} />

      {/* Free tiles — symmetric ring in middle third */}
      {freeTiles.map((tile, i) => {
        const entrance = tileEntrances[i];
        const pos = tilePositions[i];
        const slideY = interpolate(entrance, [0, 1], [18, 0]);
        return (
          <div
            key={i}
            style={{
              ...glassCard,
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: 120,
              height: 56,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 12px",
              opacity: entrance * tileBrighten,
              transform: `translateY(${slideY}px)`,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={C.iceWhite} opacity={0.45}>
              <path d={tile.icon} />
            </svg>
            <span style={{ fontFamily, ...TYPE.label, color: C.iceWhite, opacity: 0.6 }}>
              {tile.label}
            </span>
          </div>
        );
      })}

      {/* Product card — dead center of middle third */}
      <div
        style={{
          ...glassCard,
          position: "absolute",
          left: CX - 140,
          top: CY - 70,
          width: 280,
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          opacity: cardProgress * cardDim,
          transform: `translateY(${cardSlideY}px)`,
          zIndex: 10,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.iceWhite} strokeWidth="2" strokeLinecap="round" opacity={0.7}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
        </svg>
        <span style={{ fontFamily, ...TYPE.tertiary, color: C.iceWhite, fontWeight: 700 }}>
          Your $97 Course
        </span>
        {/* Progress bar — accent */}
        <div
          style={{
            width: "100%", height: 5, borderRadius: 3,
            background: C.subtle, overflow: "hidden", marginTop: 4, opacity: barEntrance,
          }}
        >
          <div style={{ width: `${barFill * 100}%`, height: "100%", borderRadius: 3, background: C.accent }} />
        </div>
      </div>

      {/* Verdict — centered in lower third */}
      <div
        style={{
          position: "absolute",
          left: 0, right: 0,
          bottom: HEIGHT / 4 - 20,
          textAlign: "center",
          opacity: textOpacity,
          transform: `translateY(${textSlideY}px)`,
        }}
      >
        <h2 style={{ fontFamily, ...TYPE.primary, color: C.iceWhite, margin: 0 }}>
          80% IS FREE.
        </h2>
        <p style={{ fontFamily, ...TYPE.tertiary, color: C.secondary, margin: "8px 0 0" }}>
          Why would they pay?
        </p>
      </div>

      <FilmGrain />
      <FadeToBlack startFrame={Math.round(6.5 * fps)} />
    </AbsoluteFill>
  );
};
