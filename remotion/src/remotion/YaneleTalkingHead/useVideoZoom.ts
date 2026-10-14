import { interpolate, useCurrentFrame } from "remotion";

// Punch-zoom frames — evenly spaced for natural rhythm across 65s (~1963 frames)
const PUNCH_FRAMES = [90, 240, 420, 600, 780, 960, 1140, 1350, 1560, 1750];
const PUNCH_MAGNITUDE = 0.04;
const PUNCH_DURATION = 15;
const PUNCH_PEAK = 4;

export function useVideoZoom() {
  const frame = useCurrentFrame();

  // Base zoom: slow push-in over sections, quick snap-back between
  const baseScale = interpolate(
    frame,
    [0, 200, 450, 460, 900, 910, 1350, 1360, 1963],
    [1.0, 1.06, 1.1, 1.0, 1.08, 1.0, 1.06, 1.0, 1.04],
    { extrapolateRight: "clamp" },
  );

  // Punch zooms on emphasis beats
  let punchScale = 0;
  for (const pf of PUNCH_FRAMES) {
    if (frame >= pf && frame <= pf + PUNCH_DURATION) {
      const bump = interpolate(
        frame,
        [pf, pf + PUNCH_PEAK, pf + PUNCH_DURATION],
        [0, PUNCH_MAGNITUDE, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      punchScale = Math.max(punchScale, bump);
    }
  }

  // Transform origin Y: face is in upper portion of 9:16 frame
  const originY = interpolate(
    frame,
    [0, 200, 460, 910, 1360],
    [38, 33, 33, 33, 38],
    { extrapolateRight: "clamp" },
  );

  return {
    scale: baseScale + punchScale,
    originX: 50,
    originY,
  };
}
