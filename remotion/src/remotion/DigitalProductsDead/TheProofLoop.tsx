/**
 * Animation 5 — "The Proof Loop"
 * Layout: Flywheel centered in middle third, text in lower third.
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

const nodes = [
  { label: "BUYER JOINS", icon: "M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" },
  { label: "GETS A WIN", icon: "M5 16V8h14v8H5zM12 2L8 6h8l-4-4zm0 20l4-4H8l4 4zm8-10l4 4V8l-4 4zM0 12l4-4v8l-4-4z" },
  { label: "POSTS PROOF", icon: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 000-6 3 3 0 00-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9a3 3 0 000 6c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 002.92 2.92A2.92 2.92 0 0021 18.98 2.92 2.92 0 0018 16.08z" },
  { label: "ATTRACTS\nNEXT BUYER", icon: "M3 7v2h2V7H3zm0 4v2h2v-2H3zm4 0v2h2v-2H7zm0-4v2h2V7H7zm-4 8v2h2v-2H3zm8-8v2h2V7h-2zm6-4v2h2V3h-2zm-6 0v2h2V3h-2zm6 8v2h2v-2h-2zm0-4v2h2V7h-2zm0 8v2h2v-2h-2z" },
];

// Flywheel dead center of middle third
const CX = WIDTH / 2;
const CY = 440;
const RADIUS = 175;

const nodePositions = nodes.map((_, i) => {
  const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CX + Math.cos(angle) * RADIUS,
    y: CY + Math.sin(angle) * RADIUS,
  };
});

export const TheProofLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const circumference = 2 * Math.PI * RADIUS;

  // Circle draws
  const circleProgress = interpolate(
    frame, [0, ENTRANCE + 6], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );

  // Nodes staggered
  const nodesDelay = ENTRANCE + 8;
  const nodeEntrances = nodes.map((_, i) => {
    const delay = nodesDelay + i * STAGGER;
    return interpolate(
      frame, [delay, delay + ENTRANCE], [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
    );
  });

  const allNodesDone = nodesDelay + (nodes.length - 1) * STAGGER + ENTRANCE;

  // Orbit dot
  const orbitStart = allNodesDone + 6;
  const orbitActive = frame >= orbitStart;
  const orbitTime = orbitActive ? (frame - orbitStart) / fps : 0;
  const revolutions = orbitTime * (0.35 + orbitTime * 0.06);
  const orbitAngle = revolutions * Math.PI * 2 - Math.PI / 2;
  const orbX = CX + Math.cos(orbitAngle) * RADIUS;
  const orbY = CY + Math.sin(orbitAngle) * RADIUS;

  // Node pulse
  const nodePulse = nodes.map((_, i) => {
    if (!orbitActive) return 0;
    const nodeAngle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    const angleDiff = Math.abs(((orbitAngle - nodeAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
    return angleDiff < 0.4 ? interpolate(angleDiff, [0, 0.4], [0.35, 0]) : 0;
  });

  // Verdict text
  const textDelay = orbitStart + Math.round(1.5 * fps);
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
      <BackgroundGlow x="50%" y="42%" size={600} />
      <DiagonalMotif position="top-right" delay={2} />

      {/* Circle path */}
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <circle
          cx={CX} cy={CY} r={RADIUS} fill="none" stroke={C.iceWhite}
          strokeWidth="1.5" strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - circleProgress)} opacity={0.15}
        />
        {nodePositions.map((_, i) => {
          const midAngle = ((i + 0.5) / nodes.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <circle key={i}
              cx={CX + Math.cos(midAngle) * (RADIUS + 24)}
              cy={CY + Math.sin(midAngle) * (RADIUS + 24)}
              r="2.5" fill={C.iceWhite} opacity={circleProgress * 0.2}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => {
        const pos = nodePositions[i];
        const entrance = nodeEntrances[i];
        const pulse = nodePulse[i];
        const slideY = interpolate(entrance, [0, 1], [16, 0]);
        return (
          <div
            key={i}
            style={{
              ...glassCard,
              position: "absolute",
              left: pos.x - 85, top: pos.y - 38,
              width: 170, height: 76,
              display: "flex", alignItems: "center", gap: 10, padding: "0 14px",
              opacity: entrance,
              transform: `translateY(${slideY}px)`,
              boxShadow: pulse > 0 ? `0 0 ${16 + pulse * 24}px rgba(59, 130, 246, ${pulse})` : "none",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={C.iceWhite} opacity={0.6}>
              <path d={node.icon} />
            </svg>
            <span style={{ fontFamily, ...TYPE.label, color: C.iceWhite, opacity: 0.8, whiteSpace: "pre-line", lineHeight: 1.3 }}>
              {node.label}
            </span>
          </div>
        );
      })}

      {/* Orbit dot — accent */}
      {orbitActive && (
        <div style={{
          position: "absolute", left: orbX - 7, top: orbY - 7,
          width: 14, height: 14, borderRadius: "50%",
          background: C.accent, boxShadow: `0 0 18px ${C.accent}, 0 0 36px ${C.accent}80`,
        }} />
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
          PROOF SELLS THE NEXT BUYER.
        </h2>
      </div>

      <FilmGrain />
      <FadeToBlack startFrame={Math.round(7.5 * fps)} />
    </AbsoluteFill>
  );
};
