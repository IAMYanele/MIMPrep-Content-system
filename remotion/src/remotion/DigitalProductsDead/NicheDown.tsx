/**
 * Animation 6 — "Niche Down"
 * Layout: Bullseye centered in middle third, text in lower third.
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
  TYPE,
  WIDTH,
  HEIGHT,
} from "./shared";

loadFont("normal", { subsets: ["latin"], weights: ["400", "700"] });

const rings = [
  { label: "FITNESS", size: 480, ringOpacity: 0.1, textOpacity: 0.3 },
  { label: "FITNESS FOR DADS", size: 310, ringOpacity: 0.25, textOpacity: 0.6 },
  { label: "FITNESS FOR BUSY\nDADS WHO TRAVEL", size: 160, ringOpacity: 1, textOpacity: 1, filled: true },
];

// Bullseye dead center
const CX = WIDTH / 2;
const CY = 420;

export const NicheDown: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Outer ring
  const outerEntrance = interpolate(
    frame, [0, ENTRANCE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Zoom phase 1
  const zoom1Delay = ENTRANCE + 8;
  const zoom1 = interpolate(
    frame, [zoom1Delay, zoom1Delay + ENTRANCE + 12], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Zoom phase 2
  const zoom2Delay = zoom1Delay + ENTRANCE + 16;
  const zoom2 = interpolate(
    frame, [zoom2Delay, zoom2Delay + ENTRANCE + 12], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  const scale = 1 + zoom1 * 0.3 + zoom2 * 0.5;

  const outerTextFade = interpolate(zoom1, [0, 0.6], [1, 0.05], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const middleTextFade = interpolate(zoom2, [0, 0.6], [1, 0.15], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Inner glow pulse
  const innerDone = zoom2Delay + ENTRANCE + 12;
  const glowPulse = frame > innerDone
    ? 0.25 + 0.08 * Math.sin(((frame - innerDone) / fps) * Math.PI * 2)
    : 0;

  // Verdict text
  const textDelay = innerDone + Math.round(1.2 * fps);
  const line1Opacity = interpolate(
    frame, [textDelay, textDelay + ENTRANCE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );
  const line1Y = interpolate(
    frame, [textDelay, textDelay + ENTRANCE], [14, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );
  const line2Opacity = interpolate(
    frame, [textDelay + 4, textDelay + 4 + ENTRANCE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );
  const line2Y = interpolate(
    frame, [textDelay + 4, textDelay + 4 + ENTRANCE], [14, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <BackgroundGlow x="50%" y="40%" size={650} />
      <DiagonalMotif position="bottom-left" delay={2} />

      {/* Zoom container — dead center */}
      <div
        style={{
          position: "absolute",
          left: CX, top: CY,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Outer ring */}
        <div style={{
          position: "absolute",
          left: -rings[0].size / 2, top: -rings[0].size / 2,
          width: rings[0].size, height: rings[0].size,
          borderRadius: "50%",
          border: `2px solid rgba(245, 247, 250, ${rings[0].ringOpacity})`,
          opacity: outerEntrance,
        }}>
          <span style={{
            fontFamily, ...TYPE.secondary, fontSize: 38,
            color: C.iceWhite, opacity: rings[0].textOpacity * outerTextFade,
            position: "absolute", top: 50, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap",
          }}>
            {rings[0].label}
          </span>
        </div>

        {/* Middle ring */}
        <div style={{
          position: "absolute",
          left: -rings[1].size / 2, top: -rings[1].size / 2,
          width: rings[1].size, height: rings[1].size,
          borderRadius: "50%",
          border: `2px solid rgba(245, 247, 250, ${rings[1].ringOpacity})`,
          opacity: zoom1,
        }}>
          <span style={{
            fontFamily, ...TYPE.tertiary, fontSize: 20,
            color: C.iceWhite, opacity: rings[1].textOpacity * middleTextFade,
            position: "absolute", top: 36, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap",
          }}>
            {rings[1].label}
          </span>
        </div>

        {/* Inner ring — filled blue accent */}
        <div style={{
          position: "absolute",
          left: -rings[2].size / 2, top: -rings[2].size / 2,
          width: rings[2].size, height: rings[2].size,
          borderRadius: "50%", background: C.accent, opacity: zoom2,
          display: "flex", justifyContent: "center", alignItems: "center",
          boxShadow: glowPulse > 0
            ? `0 0 ${35 + glowPulse * 50}px ${C.accent}, 0 0 ${70 + glowPulse * 80}px ${C.accent}60`
            : "none",
        }}>
          <span style={{
            fontFamily, ...TYPE.label, fontSize: 12,
            color: C.iceWhite, textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.4,
          }}>
            {rings[2].label}
          </span>
        </div>
      </div>

      {/* Verdict — centered in lower third */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: HEIGHT / 4 - 20, textAlign: "center" }}>
        <h2 style={{
          fontFamily, ...TYPE.primary, color: C.iceWhite, margin: 0,
          opacity: line1Opacity, transform: `translateY(${line1Y}px)`,
        }}>
          SPECIFIC = BELIEVABLE
        </h2>
        <h2 style={{
          fontFamily, ...TYPE.primary, color: C.accent, margin: "6px 0 0",
          opacity: line2Opacity, transform: `translateY(${line2Y}px)`,
        }}>
          BELIEVABLE = BUYERS
        </h2>
      </div>

      <FilmGrain />
      <FadeToBlack startFrame={Math.round(8.5 * fps)} />
    </AbsoluteFill>
  );
};
