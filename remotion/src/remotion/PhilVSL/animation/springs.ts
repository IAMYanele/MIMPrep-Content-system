import { interpolate, spring, Easing } from "remotion";

// Slingshot spring — heavy overshoot, snappy settle. Use for the main scene card.
export const SLINGSHOT = { mass: 1.05, damping: 9, stiffness: 110, overshootClamping: false };

// Snappy — quick, slight overshoot. For sub-cards inside a scene.
export const SNAPPY = { mass: 0.7, damping: 11, stiffness: 160, overshootClamping: false };

// Soft — gentle, no overshoot. For text reveals.
export const SOFT = { mass: 0.6, damping: 14, stiffness: 130, overshootClamping: true };

// Easing for explicit interpolations
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const BACK_OUT = Easing.bezier(0.34, 1.56, 0.64, 1); // overshoot

// Slide-up entrance (slingshot from below). Returns translateY (px).
export const slideUp = ({
  frame,
  fps,
  delay = 0,
  fromY = 220,
  config = SLINGSHOT,
}: {
  frame: number;
  fps: number;
  delay?: number;
  fromY?: number;
  config?: typeof SLINGSHOT;
}) => {
  const p = spring({ frame: frame - delay, fps, config });
  return interpolate(p, [0, 1], [fromY, 0]);
};

// Slide-down exit. Returns translateY (px). Pass timeUntilEnd = local frame distance to end.
export const slideDown = ({
  frame,
  fps,
  durationInFrames,
  exitFrames = 14,
  toY = 260,
}: {
  frame: number;
  fps: number;
  durationInFrames: number;
  exitFrames?: number;
  toY?: number;
}) => {
  const exitStart = durationInFrames - exitFrames;
  return interpolate(frame, [exitStart, durationInFrames], [0, toY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN,
  });
};

// Combined enter+exit y offset for a "scene card" — slings up, holds, drops down.
export const useCardOffset = ({
  frame,
  fps,
  durationInFrames,
  delay = 0,
}: {
  frame: number;
  fps: number;
  durationInFrames: number;
  delay?: number;
}) => {
  const enter = slideUp({ frame, fps, delay });
  const exit = slideDown({ frame, fps, durationInFrames });
  return enter + exit;
};

// Opacity envelope — 0 → 1 over fadeIn, hold, → 0 over fadeOut.
export const fadeEnvelope = ({
  frame,
  durationInFrames,
  fadeInFrames = 6,
  fadeOutFrames = 10,
}: {
  frame: number;
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}) => {
  return interpolate(
    frame,
    [0, fadeInFrames, durationInFrames - fadeOutFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};
