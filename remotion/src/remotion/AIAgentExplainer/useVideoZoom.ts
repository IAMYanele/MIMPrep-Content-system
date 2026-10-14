import { interpolate, useCurrentFrame } from "remotion";

const PUNCH_FRAMES = [69, 183, 537, 856, 1213];
const PUNCH_MAGNITUDE = 0.08;
const PUNCH_DURATION = 12;
const PUNCH_PEAK = 3;

export function useVideoZoom() {
  const frame = useCurrentFrame();

  // Base zoom: dramatic push in per section, quick snap-back between
  const baseScale = interpolate(
    frame,
    [0, 150, 470, 478, 835, 843, 1050, 1058, 1329],
    [1.0, 1.0, 1.15, 1.0, 1.15, 1.0, 1.12, 1.0, 1.08],
    { extrapolateRight: "clamp" },
  );

  // Punch zooms on emphasis words — more dramatic
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

  // Transform origin — face is upper-center of frame
  const originY = interpolate(
    frame,
    [0, 150, 478, 843, 1058],
    [40, 30, 30, 30, 40],
    { extrapolateRight: "clamp" },
  );

  return {
    scale: baseScale + punchScale,
    originX: 50,
    originY,
  };
}
