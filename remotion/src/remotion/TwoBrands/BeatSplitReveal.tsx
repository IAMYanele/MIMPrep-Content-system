// ─────────────────────────────────────────────────────────────
// BEAT 1 — "It Takes Two Brands" SPLIT POSTER  (174f / 5.8s @ 30fps)
// Recreated from the user's design (Downloads/It Takes Two Brands.html):
//   LEFT  = GET SELLERS (business): black + purple glow, house+bolt disc logo
//   RIGHT = ESTEBAN ANDRADE (personal): full-bleed portrait, purple + gold
//   center seam + gold "+" badge.
//
// Simple animation in 3 reveal phases:
//   ① establish  (0–28)   halves + portrait (Ken Burns) + logo disc + seam in
//   ② business   (8–48)   left pill → GET / SELLERS → sub → @getsellers.io
//   ③ personal   (24–70)  right pill → ESTEBAN / ANDRADE → sub → @estenick,
//                          then the gold "+" badge pops (56). Holds to the end.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const inter = loadInter("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily;

// ── palette (from the poster) ─────────────────────────────────
const BLACK = "#000000";
const INK = "#0a0a0f";
const GOLD = "#FACC15";
const BOLT = "#A855F7";
const PURPLE = "#2A1A4A";
const HALF = 540;

// rise-in (translateY + fade) keyed off a delay
const useRise = (delay: number, fromY = 50, cfg = { damping: 18, stiffness: 90 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - delay, fps, config: cfg });
  return { opacity: e, y: interpolate(e, [0, 1], [fromY, 0]) };
};

// ── small inline marks ────────────────────────────────────────
const IgGlyph: React.FC<{ color: string; size?: number }> = ({ color, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none" />
  </svg>
);

const HouseBolt: React.FC<{ size?: number }> = ({ size = 168 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 14 L86 44 V86 H14 V44 Z" fill="#fff" />
    <path d="M54 38 L37 64 H49 L44 84 L65 54 H53 L60 38 Z" fill={BOLT} />
  </svg>
);

// top-left pill ("● BUSINESS BRAND")
const Pill: React.FC<{ text: string; color: string; delay: number }> = ({ text, color, delay }) => {
  const { opacity, y } = useRise(delay, -18);
  return (
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
};

// bottom label block (word-a small accent, word-b huge white, sub)
const Label: React.FC<{
  wordA: string;
  wordB: string;
  accent: string;
  sub: React.ReactNode;
  delay: number;
}> = ({ wordA, wordB, accent, sub, delay }) => {
  const a = useRise(delay, 50);
  const b = useRise(delay + 6, 56);
  const s = useRise(delay + 16, 24);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 170, zIndex: 4 }}>
      <div
        style={{
          fontFamily: anton,
          fontSize: 92,
          lineHeight: 0.88,
          textTransform: "uppercase",
          letterSpacing: "0.005em",
          color: accent,
          opacity: a.opacity,
          transform: `translateY(${a.y}px)`,
        }}
      >
        {wordA}
      </div>
      <div
        style={{
          fontFamily: anton,
          fontSize: 150,
          lineHeight: 0.82,
          textTransform: "uppercase",
          letterSpacing: "0.005em",
          color: "#fff",
          marginTop: 4,
          whiteSpace: "nowrap",
          opacity: b.opacity,
          transform: `translateY(${b.y}px)`,
        }}
      >
        {wordB}
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: inter,
          fontWeight: 500,
          fontSize: 18,
          letterSpacing: "0.005em",
          color: "rgba(255,255,255,0.75)",
          lineHeight: 1.35,
          maxWidth: "90%",
          opacity: s.opacity,
          transform: `translateY(${s.y}px)`,
        }}
      >
        {sub}
      </div>
    </div>
  );
};

const Handle: React.FC<{ text: string; color: string; delay: number }> = ({ text, color, delay }) => {
  const { opacity, y } = useRise(delay, 28);
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        bottom: 64,
        zIndex: 4,
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: inter,
        fontWeight: 600,
        fontSize: 22,
        color,
        letterSpacing: "-0.005em",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <IgGlyph color={color} />
      <span>{text}</span>
    </div>
  );
};

// bottom dark gradient for text legibility (the .scene::after)
const BottomScrim: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "55%",
      zIndex: 2,
      pointerEvents: "none",
      background:
        "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 25%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)",
    }}
  />
);

export const BeatSplitReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ① establish
  const halfIn = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const leftX = interpolate(halfIn, [0, 1], [-50, 0]);
  const rightX = interpolate(halfIn, [0, 1], [50, 0]);

  // portrait Ken Burns (slow zoom)
  const kb = interpolate(frame, [0, durationInFrames], [1.0, 1.07]);
  const portraitIn = interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // logo disc spring-in + gentle float
  const discE = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 110 } });
  const discScale = interpolate(discE, [0, 1], [0.7, 1]);
  const discFloat = Math.sin((frame / fps) * 1.8) * 5;

  // seam draw
  const seamE = spring({ frame: frame - 6, fps, config: { damping: 200 }, durationInFrames: 24 });

  // ③ "+" badge pop + breathe
  const badgeE = spring({ frame: frame - 56, fps, config: { damping: 12, stiffness: 120 } });
  const badgeScale = interpolate(badgeE, [0, 1], [0, 1]);
  const badgeBreathe = 1 + Math.sin((frame / fps) * 2.2) * 0.03;

  return (
    <AbsoluteFill style={{ background: BLACK, fontFamily: inter, overflow: "hidden" }}>
      {/* ============ LEFT — GET SELLERS (business) ============ */}
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
          background:
            "radial-gradient(70% 50% at 50% 28%, rgba(168,85,247,0.20), transparent 65%), #000000",
        }}
      >
        {/* centered logo disc */}
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", zIndex: 3 }}>
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "radial-gradient(closest-side, #1a1a22 0%, #0a0a0e 100%)",
              display: "grid",
              placeItems: "center",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 60px rgba(168,85,247,0.25)",
              transform: `scale(${discScale}) translateY(${discFloat}px)`,
              opacity: discE,
            }}
          >
            <HouseBolt size={168} />
          </div>
        </div>

        <BottomScrim />
        <Pill text="Business Brand" color={BOLT} delay={8} />
        <Label
          wordA="Get"
          wordB="Sellers"
          accent={BOLT}
          delay={14}
          sub={<>Exclusive motivated seller leads &amp; appointments.<br />Built for investors &amp; closers.</>}
        />
        <Handle text="@getsellers.io" color={BOLT} delay={36} />
      </div>

      {/* ============ RIGHT — ESTEBAN ANDRADE (personal) ============ */}
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
          background:
            "radial-gradient(70% 55% at 50% 28%, rgba(250,204,21,0.22), transparent 65%), #2A1A4A",
        }}
      >
        {/* full-bleed portrait */}
        <Img
          src={staticFile("esteban.jpg")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 28%",
            opacity: portraitIn,
            transform: `scale(${kb})`,
            zIndex: 1,
          }}
        />

        <BottomScrim />
        <Pill text="Personal Brand" color={GOLD} delay={24} />
        <Label
          wordA="Esteban"
          wordB="Andrade"
          accent={GOLD}
          delay={30}
          sub={<>Ads &amp; business for REIpreneurs.<br />$35M+ in deals · Miami.</>}
        />
        <Handle text="@estenick" color={GOLD} delay={50} />
      </div>

      {/* ============ center seam ============ */}
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
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.25) 75%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* ============ gold "+" badge ============ */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${badgeScale * badgeBreathe})`,
          zIndex: 7,
          opacity: badgeE,
        }}
      >
        <div
          style={{
            width: 118,
            height: 118,
            borderRadius: "50%",
            background: GOLD,
            display: "grid",
            placeItems: "center",
            boxShadow: "0 0 0 10px rgba(0,0,0,0.85), 0 0 60px rgba(250,204,21,0.55)",
          }}
        >
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
