/**
 * Animation 4 — "The Funnel"
 * Layout: Ascending steps centered in middle third, text in lower third.
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
  EASE_IN_OUT,
  ENTRANCE,
  STAGGER,
  TYPE,
  WIDTH,
  HEIGHT,
  glassCard,
} from "./shared";

loadFont("normal", { subsets: ["latin"], weights: ["400", "700"] });

const steps = [
  { label: "LOW TICKET", sub: "Gets attention" },
  { label: "TRUST BUILT", sub: "Filters serious buyers" },
  { label: "HIGH TICKET", sub: "Funds your life" },
  { label: "SCALE", sub: "Grows the business" },
];

// Centered ascending staircase
const STEP_W = 220;
const STEP_GAP = 24;
const TOTAL_W = steps.length * STEP_W + (steps.length - 1) * STEP_GAP;
const START_X = (WIDTH - TOTAL_W) / 2;

const stepLayout = steps.map((_, i) => ({
  x: START_X + i * (STEP_W + STEP_GAP),
  y: 600 - i * 80,
  h: 72 + i * 16,
}));

export const TheFunnel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Steps entrance
  const stepEntrances = steps.map((_, i) => {
    const delay = i * STAGGER;
    return interpolate(
      frame, [delay, delay + ENTRANCE], [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
    );
  });

  const allStepsDone = (steps.length - 1) * STAGGER + ENTRANCE;

  // Orb travel
  const orbDelay = allStepsDone + 8;
  const orbDuration = Math.round(2.5 * fps);
  const orbProgress = interpolate(
    frame, [orbDelay, orbDelay + orbDuration], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT },
  );
  const orbVisible = frame >= orbDelay;

  const orbX = interpolate(orbProgress, [0, 0.33, 0.66, 1],
    stepLayout.map((s) => s.x + STEP_W / 2));
  const orbY = interpolate(orbProgress, [0, 0.33, 0.66, 1],
    stepLayout.map((s) => s.y - 20));

  // Label glow
  const labelGlow = steps.map((_, i) => {
    if (!orbVisible) return 0;
    const threshold = i / 3;
    return interpolate(orbProgress, [Math.max(threshold - 0.05, 0), threshold + 0.05], [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  });

  // Orb pulse at top
  const orbPulse = orbProgress >= 0.95
    ? 1 + 0.12 * Math.sin(((frame - orbDelay - orbDuration) / fps) * Math.PI * 3)
    : 1;

  // Verdict text
  const textDelay = orbDelay + orbDuration + 6;
  const textOpacity = interpolate(
    frame, [textDelay, textDelay + ENTRANCE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );
  const textSlideY = interpolate(
    frame, [textDelay, textDelay + ENTRANCE], [14, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <BackgroundGlow x="50%" y="40%" size={600} />
      <DiagonalMotif position="bottom-left" delay={2} />

      {/* Light trail */}
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <path
          d={stepLayout.map((s, i) => `${i === 0 ? "M" : "L"} ${s.x + STEP_W / 2} ${s.y - 20}`).join(" ")}
          fill="none" stroke={C.accent} strokeWidth="1.5"
          opacity={orbVisible ? 0.2 : 0}
          strokeDasharray="1200" strokeDashoffset={1200 * (1 - orbProgress)}
        />
      </svg>

      {/* Steps — centered ascending */}
      {steps.map((step, i) => {
        const layout = stepLayout[i];
        const entrance = stepEntrances[i];
        const slideY = interpolate(entrance, [0, 1], [40, 0]);
        const glow = labelGlow[i];

        return (
          <div key={i} style={{ position: "absolute", left: layout.x, top: layout.y, width: STEP_W, opacity: entrance, transform: `translateY(${slideY}px)` }}>
            <div
              style={{
                ...glassCard,
                width: STEP_W,
                height: layout.h,
                background: glow > 0 ? `linear-gradient(180deg, rgba(59,130,246,${0.06 * glow}) 0%, ${C.glass} 100%)` : C.glass,
                border: `1px solid ${glow > 0 ? `rgba(59,130,246,${0.15 * glow})` : C.glassBorder}`,
              }}
            />
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <p style={{ fontFamily, ...TYPE.label, color: C.iceWhite, opacity: 0.5 + glow * 0.5, margin: 0 }}>
                {step.label}
              </p>
              <p style={{ fontFamily, fontSize: 15, fontWeight: 400, color: C.iceWhite, opacity: 0.35 + glow * 0.4, letterSpacing: "0.02em", margin: "4px 0 0" }}>
                {step.sub}
              </p>
            </div>
          </div>
        );
      })}

      {/* Orb — accent */}
      {orbVisible && (
        <div
          style={{
            position: "absolute",
            left: orbX - 10, top: orbY - 10,
            width: 20, height: 20, borderRadius: "50%",
            background: C.accent,
            boxShadow: `0 0 24px ${C.accent}, 0 0 48px ${C.accent}80`,
            transform: `scale(${orbPulse})`,
          }}
        />
      )}

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
          BUILD THE LADDER.
        </h2>
      </div>

      <FilmGrain />
      <FadeToBlack startFrame={Math.round(8.5 * fps)} />
    </AbsoluteFill>
  );
};
