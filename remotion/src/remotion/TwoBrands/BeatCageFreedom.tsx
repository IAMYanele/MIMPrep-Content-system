// ─────────────────────────────────────────────────────────────
// BEAT 4 — "LIMITED vs FREEDOM" clean poster split  (249f / 8.3s @ 30fps)
// Redesign of the old cage/burst → matches the opening poster's visual
// language (black business left / purple-gold personal right, Anton, seam).
// VO: "A business brand is limited to the industry it serves,
//      but a personal brand has the freedom to experiment."
//   "but" ≈ f138 · "freedom" ≈ f198
//
// LEFT (LIMITED) is present from the start; RIGHT half stays dim until the
// pivot, then FREEDOM reveals in gold with a glow swell (~f132) and a small
// emphasis pulse on "freedom" (~f198). Clean — no busy animation.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const inter = loadInter("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily;

const GOLD = "#FACC15";
const BOLT = "#A855F7";
const HALF = 540;
const REVEAL = 132; // FREEDOM appears on "but ... the freedom"
const PEAK = 198; // "freedom" spoken — emphasis pulse

const Pill: React.FC<{ text: string; color: string; opacity: number; y: number }> = ({
  text,
  color,
  opacity,
  y,
}) => (
  <div
    style={{
      position: "absolute",
      top: 40,
      left: 40,
      zIndex: 5,
      opacity,
      transform: `translateY(${y}px)`,
      fontFamily: inter,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.28em",
      textTransform: "uppercase",
      color,
      padding: "11px 16px",
      borderRadius: 999,
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(6px)",
      border: "1px solid rgba(255,255,255,0.14)",
      lineHeight: 1.1,
    }}
  >
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 12px ${color}` }} />
    {text}
  </div>
);

export const BeatCageFreedom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // establish: halves slide in from the seam + fade
  const halfIn = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const leftX = interpolate(halfIn, [0, 1], [-50, 0]);
  const rightX = interpolate(halfIn, [0, 1], [50, 0]);

  // seam draw
  const seamE = spring({ frame: frame - 6, fps, config: { damping: 200 }, durationInFrames: 24 });

  // LEFT (LIMITED) rise — early
  const limPill = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 90 } });
  const limWord = spring({ frame: frame - 12, fps, config: { damping: 18, stiffness: 90 } });
  const limSub = spring({ frame: frame - 22, fps, config: { damping: 18, stiffness: 90 } });

  // RIGHT (PERSONAL pill early, FREEDOM on the pivot)
  const perPill = spring({ frame: frame - 16, fps, config: { damping: 18, stiffness: 90 } });
  const freeWord = spring({ frame: frame - REVEAL, fps, config: { damping: 14, stiffness: 110 } });
  const freeSub = spring({ frame: frame - (REVEAL + 12), fps, config: { damping: 18, stiffness: 90 } });

  // right half: dim → bright on reveal; gold glow swell + emphasis pulse
  const rightLift = interpolate(frame, [REVEAL - 8, REVEAL + 16], [0.32, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow = interpolate(frame, [REVEAL, REVEAL + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const peakE = spring({ frame: frame - PEAK, fps, config: { damping: 9, stiffness: 130 } });
  const freeScale = interpolate(freeWord, [0, 1], [0.7, 1]) * (1 + interpolate(peakE, [0, 1], [0, 0.06]));

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: inter, overflow: "hidden" }}>
      {/* ===== LEFT — BUSINESS / LIMITED ===== */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: HALF,
          height: 1920,
          overflow: "hidden",
          opacity: halfIn,
          transform: `translateX(${leftX}px)`,
          background: "radial-gradient(70% 50% at 50% 30%, rgba(168,85,247,0.16), transparent 65%), #000000",
        }}
      >
        <Pill text="Business Brand" color={BOLT} opacity={limPill} y={interpolate(limPill, [0, 1], [-18, 0])} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: anton,
              fontSize: 112,
              lineHeight: 0.9,
              textTransform: "uppercase",
              letterSpacing: "0.005em",
              color: "#fff",
              opacity: limWord,
              transform: `translateY(${interpolate(limWord, [0, 1], [50, 0])}px)`,
            }}
          >
            Limited
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: inter,
              fontWeight: 600,
              fontSize: 22,
              color: BOLT,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              opacity: limSub,
              transform: `translateY(${interpolate(limSub, [0, 1], [20, 0])}px)`,
            }}
          >
            to the industry it serves
          </div>
        </div>
      </div>

      {/* ===== RIGHT — PERSONAL / FREEDOM ===== */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: HALF,
          width: HALF,
          height: 1920,
          overflow: "hidden",
          opacity: halfIn,
          transform: `translateX(${rightX}px)`,
          background: "radial-gradient(70% 55% at 50% 40%, rgba(250,204,21,0.22), transparent 60%), #2A1A4A",
        }}
      >
        {/* dim veil that lifts on the pivot */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            opacity: 1 - rightLift,
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        {/* gold glow swell behind FREEDOM */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "radial-gradient(45% 30% at 50% 50%, rgba(250,204,21,0.30), transparent 70%)",
            opacity: glow,
            pointerEvents: "none",
          }}
        />
        <Pill text="Personal Brand" color={GOLD} opacity={perPill} y={interpolate(perPill, [0, 1], [-18, 0])} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 36px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: anton,
              fontSize: 116,
              lineHeight: 0.9,
              textTransform: "uppercase",
              letterSpacing: "0.005em",
              color: GOLD,
              textShadow: `0 0 ${40 * glow}px rgba(250,204,21,${0.6 * glow})`,
              opacity: freeWord,
              transform: `translateY(${interpolate(freeWord, [0, 1], [50, 0])}px) scale(${freeScale})`,
            }}
          >
            Freedom
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: inter,
              fontWeight: 600,
              fontSize: 22,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              opacity: freeSub,
              transform: `translateY(${interpolate(freeSub, [0, 1], [20, 0])}px)`,
            }}
          >
            to experiment &amp; evolve
          </div>
        </div>
      </div>

      {/* ===== center seam ===== */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: 2,
          transform: "translateX(-50%)",
          transformOrigin: "center",
          scale: `1 ${seamE}`,
          zIndex: 5,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 25%, rgba(255,255,255,0.22) 75%, rgba(255,255,255,0) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
