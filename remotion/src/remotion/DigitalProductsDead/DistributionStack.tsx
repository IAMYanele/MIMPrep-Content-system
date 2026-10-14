/**
 * Animation 7 — "The Distribution Stack"
 * Layout: Bars centered in middle third, text in lower third.
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
  ENTRANCE,
  STAGGER,
  TYPE,
  WIDTH,
  HEIGHT,
  glassCard,
} from "./shared";

loadFont("normal", { subsets: ["latin"], weights: ["400", "700"] });

const bars = [
  { label: "SHORT FORM", purpose: "Reach", icon: "M17 1.01L7 1a2 2 0 00-2 2v18a2 2 0 002 2h10a2 2 0 002-2V3a2 2 0 00-2-1.99zM17 19H7V5h10v14z" },
  { label: "LONG FORM", purpose: "Authority", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" },
  { label: "COMMUNITY", purpose: "Retention", icon: "M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" },
  { label: "CLEAR OFFER", purpose: "Conversion", icon: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" },
];

// Centered bar stack
const BAR_W = 700;
const BAR_H = 76;
const BAR_GAP = 18;
const BAR_LEFT = (WIDTH - BAR_W) / 2;
const BAR_START_Y = 260;
const CONN_X = BAR_LEFT - 28;

export const DistributionStack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Bar entrances
  const barEntrances = bars.map((_, i) => {
    const delay = i * STAGGER;
    return interpolate(
      frame, [delay, delay + ENTRANCE], [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
    );
  });

  const allBarsDone = (bars.length - 1) * STAGGER + ENTRANCE;

  // Connectors
  const connectorEntrances = bars.slice(0, -1).map((_, i) => {
    const barLandTime = i * STAGGER + ENTRANCE;
    return interpolate(
      frame, [barLandTime, barLandTime + 8], [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
    );
  });

  // Blue wash
  const washDelay = allBarsDone + 12;
  const washProgress = interpolate(
    frame, [washDelay, washDelay + ENTRANCE + 8], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Verdict text
  const textDelay = washDelay + ENTRANCE + 12;
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
      <BackgroundGlow x="50%" y="40%" size={650} />
      <DiagonalMotif position="top-right" delay={2} />

      {/* Connector lines */}
      {connectorEntrances.map((progress, i) => (
        <div key={i} style={{
          position: "absolute", left: CONN_X,
          top: BAR_START_Y + BAR_H / 2 + i * (BAR_H + BAR_GAP),
          width: 2, height: BAR_H + BAR_GAP,
          background: C.accent, transformOrigin: "top",
          transform: `scaleY(${progress})`, opacity: 0.4,
        }} />
      ))}

      {/* Bars — centered */}
      {bars.map((bar, i) => {
        const entrance = barEntrances[i];
        const slideX = interpolate(entrance, [0, 1], [60, 0]);
        const y = BAR_START_Y + i * (BAR_H + BAR_GAP);
        const barWashDelay = i * 0.15;
        const barWash = interpolate(
          washProgress, [barWashDelay, Math.min(barWashDelay + 0.4, 1)], [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <div key={i} style={{
            position: "absolute", left: BAR_LEFT, top: y,
            width: BAR_W, height: BAR_H,
            ...glassCard,
            display: "flex", alignItems: "center", padding: "0 24px", gap: 18,
            opacity: entrance, transform: `translateX(${slideX}px)`,
            boxShadow: barWash > 0 ? `inset 0 0 ${24 * barWash}px rgba(59, 130, 246, ${0.07 * barWash})` : "none",
          }}>
            {/* Connector dot */}
            <div style={{
              position: "absolute", left: -30, width: 7, height: 7,
              borderRadius: "50%", background: C.accent, opacity: entrance * 0.5,
            }} />
            {/* Icon */}
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `rgba(59, 130, 246, ${0.08 + barWash * 0.08})`,
              display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={C.iceWhite} opacity={0.75}>
                <path d={bar.icon} />
              </svg>
            </div>
            {/* Label + purpose */}
            <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily, ...TYPE.label, fontSize: 16, color: C.iceWhite, opacity: 0.9 }}>
                {bar.label}
              </span>
              <span style={{ fontFamily, fontSize: 15, fontWeight: 400, color: C.accent, letterSpacing: "0.02em", opacity: 0.7 + barWash * 0.3 }}>
                {bar.purpose}
              </span>
            </div>
          </div>
        );
      })}

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
          DISTRIBUTION IS THE BUSINESS.
        </h2>
      </div>

      <FilmGrain />
      <FadeToBlack startFrame={Math.round(7.5 * fps)} />
    </AbsoluteFill>
  );
};
