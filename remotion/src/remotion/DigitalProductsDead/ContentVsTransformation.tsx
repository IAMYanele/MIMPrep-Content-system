/**
 * Animation 3 — "Content vs Transformation"
 * Layout: Split visual centered in middle third, verdict text in lower third.
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

const CX = WIDTH / 2;

// Silhouette figure
const Figure: React.FC<{
  morphProgress: number;
  glowOpacity: number;
}> = ({ morphProgress, glowOpacity }) => {
  const headY = interpolate(morphProgress, [0, 1], [38, 28]);
  const shoulderWidth = interpolate(morphProgress, [0, 1], [28, 38]);
  const bodyHeight = interpolate(morphProgress, [0, 1], [50, 65]);
  return (
    <svg width="140" height="160" viewBox="0 0 140 160">
      <defs>
        <filter id="figBlur"><feGaussianBlur stdDeviation="22" /></filter>
      </defs>
      <circle cx="70" cy="80" r="60" fill={C.accent} opacity={glowOpacity} filter="url(#figBlur)" />
      <circle cx="70" cy={headY} r="16" fill={C.iceWhite} opacity={0.9} />
      <rect x={70 - shoulderWidth / 2} y={headY + 20} width={shoulderWidth} height={bodyHeight} rx="9" fill={C.iceWhite} opacity={0.9} />
    </svg>
  );
};

export const ContentVsTransformation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Divider at center, draws top→bottom
  const dividerDraw = interpolate(
    frame, [0, ENTRANCE + 4], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Left: "Content" — muted
  const leftDelay = ENTRANCE + 6;
  const leftProgress = interpolate(
    frame, [leftDelay, leftDelay + ENTRANCE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Module skeleton lines stagger
  const moduleEntrances = Array.from({ length: 5 }).map((_, i) => {
    const delay = leftDelay + 4 + i * STAGGER;
    return interpolate(
      frame, [delay, delay + ENTRANCE], [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
    );
  });

  // Red X
  const xDelay = leftDelay + 4 + 5 * STAGGER + ENTRANCE;
  const xOpacity = interpolate(
    frame, [xDelay, xDelay + 8], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Right: "Transformation"
  const rightDelay = xDelay + 12;
  const rightProgress = interpolate(
    frame, [rightDelay, rightDelay + ENTRANCE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Morph
  const morphDelay = rightDelay + 6;
  const morphProgress = interpolate(
    frame, [morphDelay, morphDelay + ENTRANCE + 8], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Check
  const checkDelay = morphDelay + ENTRANCE;
  const checkOpacity = interpolate(
    frame, [checkDelay, checkDelay + 8], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Verdict dim
  const verdictDelay = checkDelay + 12;
  const verdictProgress = interpolate(
    frame, [verdictDelay, verdictDelay + ENTRANCE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN },
  );
  const leftDim = interpolate(verdictProgress, [0, 1], [1, 0.15]);
  const glowIntensity = interpolate(verdictProgress, [0, 1], [0.12, 0.25]);

  // Bottom text
  const textDelay = verdictDelay + 4;
  const textOpacity = interpolate(
    frame, [textDelay, textDelay + ENTRANCE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );
  const textSlideY = interpolate(
    frame, [textDelay, textDelay + ENTRANCE], [14, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Panels centered in middle third (y: 300-680)
  const PANEL_TOP = 300;
  const PANEL_H = 380;
  const PANEL_W = 380;
  const GAP = 60;

  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <BackgroundGlow x="50%" y="42%" size={700} />
      <DiagonalMotif position="top-right" delay={2} />

      {/* Divider at center */}
      <div
        style={{
          position: "absolute",
          left: CX,
          top: PANEL_TOP,
          width: 1,
          height: PANEL_H,
          background: C.iceWhite,
          opacity: 0.12,
          transform: `scaleY(${dividerDraw})`,
          transformOrigin: "top",
        }}
      />

      {/* LEFT: Content */}
      <div
        style={{
          position: "absolute",
          left: CX - GAP / 2 - PANEL_W,
          top: PANEL_TOP,
          width: PANEL_W,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          paddingTop: 30,
          opacity: leftProgress * leftDim,
        }}
      >
        <span style={{ fontFamily, ...TYPE.label, color: C.iceWhite, opacity: 0.4 }}>
          CONTENT
        </span>
        <div style={{ ...glassCard, width: 280, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 8, borderRadius: 4, background: C.subtle, width: `${65 + (i % 3) * 12}%`, opacity: moduleEntrances[i] }} />
          ))}
        </div>
        <div style={{ opacity: xOpacity, textAlign: "center" }}>
          <svg width="36" height="36" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
          <p style={{ fontFamily, fontSize: 18, color: C.iceWhite, opacity: 0.45, margin: "6px 0 0", letterSpacing: "0.02em" }}>
            47 modules. No result.
          </p>
        </div>
      </div>

      {/* RIGHT: Transformation */}
      <div
        style={{
          position: "absolute",
          left: CX + GAP / 2,
          top: PANEL_TOP,
          width: PANEL_W,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          paddingTop: 30,
          opacity: rightProgress,
        }}
      >
        <span style={{ fontFamily, ...TYPE.label, color: C.iceWhite }}>
          TRANSFORMATION
        </span>
        <Figure morphProgress={morphProgress} glowOpacity={glowIntensity} />
        <div style={{ opacity: checkOpacity }}>
          <svg width="40" height="40" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <p style={{ fontFamily, ...TYPE.tertiary, color: C.iceWhite, opacity: checkOpacity * 0.85, margin: 0, textAlign: "center" }}>
          Clear outcome. Fast win.
        </p>
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
          RESULTS, NOT LESSONS.
        </h2>
      </div>

      <FilmGrain />
      <FadeToBlack startFrame={Math.round(7.5 * fps)} />
    </AbsoluteFill>
  );
};
