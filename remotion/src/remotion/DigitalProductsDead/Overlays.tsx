import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, EASE_OUT, MARGIN } from "./shared";

/**
 * FilmGrain — Foreground depth layer.
 * Adds subtle noise texture on top of everything.
 * Rulebook §1.5: Foreground overlays add production value.
 */
export const FilmGrain: React.FC<{ opacity?: number }> = ({
  opacity = 0.035,
}) => {
  const frame = useCurrentFrame();
  // Shift the pattern every frame for organic feel
  const offsetX = (frame * 17) % 200;
  const offsetY = (frame * 13) % 200;

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

/**
 * DiagonalMotif — Recurring visual element.
 * Rulebook §9.2: Establish a visual motif in first 2-3s, echo throughout.
 * A thin diagonal line that appears subtly in corners.
 */
export const DiagonalMotif: React.FC<{
  position?: "top-right" | "bottom-left";
  delay?: number;
}> = ({ position = "top-right", delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame,
    [delay, delay + Math.round(0.6 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  const isTopRight = position === "top-right";

  return (
    <svg
      style={{
        position: "absolute",
        top: isTopRight ? MARGIN - 20 : undefined,
        bottom: isTopRight ? undefined : MARGIN - 20,
        right: isTopRight ? MARGIN : undefined,
        left: isTopRight ? undefined : MARGIN,
        width: 200,
        height: 200,
        pointerEvents: "none",
        opacity: 0.08,
      }}
    >
      <line
        x1={isTopRight ? 200 : 0}
        y1={isTopRight ? 0 : 200}
        x2={isTopRight ? 0 : 200}
        y2={isTopRight ? 200 : 0}
        stroke={C.iceWhite}
        strokeWidth="1"
        strokeDasharray="283"
        strokeDashoffset={283 * (1 - progress)}
      />
    </svg>
  );
};

/**
 * FadeToBlack — Consistent scene exit.
 * Rulebook §6.4: Transition types should be consistent.
 */
export const FadeToBlack: React.FC<{
  startFrame: number;
  duration?: number;
}> = ({ startFrame, duration = 15 }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{ backgroundColor: C.black, opacity, pointerEvents: "none" }}
    />
  );
};

/**
 * BackgroundGlow — Midground depth layer.
 * Rulebook §1.5: Background layers should be desaturated / lower contrast.
 * Single subtle radial glow, never competing with foreground.
 */
export const BackgroundGlow: React.FC<{
  x?: string;
  y?: string;
  size?: number;
  color?: string;
}> = ({
  x = "65%",
  y = "35%",
  size = 600,
  color = C.royalBlue,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}12 0%, transparent 65%)`,
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    }}
  />
);
