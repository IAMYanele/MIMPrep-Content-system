/**
 * Brandon Thomas — 30K Followers Celebration
 * 1920×1080, 30fps, 5s (150 frames)
 *
 * Flow:
 *   0.00–1.20s  Background pulses in. Profile card slides up from bottom (centered).
 *   0.60–1.80s  Avatar pops, yellow ring sweeps in, handle/name/stats reveal.
 *   1.60–3.30s  Massive "30K" scales in below the profile with glow + confetti burst.
 *   3.00–5.00s  "Boom! Congrats on 30K followers with your AI clone" reveals at bottom.
 *
 * NOTE: drop a square headshot at public/brandon-thomas.jpg and it will appear
 * inside the avatar ring. Without it, a stylized silhouette placeholder is shown.
 */
import {
  fontFamily,
  loadFont,
} from "@remotion/google-fonts/PlusJakartaSans";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

loadFont("normal", { subsets: ["latin"], weights: ["400", "600", "700", "800"] });

const W = 1920;
const H = 1080;

// Brand palette — pulled from the IG screenshot
const C = {
  bg: "#000000",
  bgGlow: "#0a0a14",
  yellow: "#F4C429",
  yellowBright: "#FFD84D",
  yellowGlow: "#FFE16B",
  white: "#FFFFFF",
  mute: "#9CA3AF",
  verified: "#1DA1F2",
  accent: "#7C3AED",
  pink: "#EC4899",
  cyan: "#22D3EE",
};

const FPS = 30;
const AVATAR_PHOTO = "brandon-thomas.jpg";

// ─── Confetti particles (deterministic so render is stable) ───────────
const CONFETTI_COUNT = 90;
const confetti = Array.from({ length: CONFETTI_COUNT }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  const r = (mult: number) => {
    const x = Math.sin(seed * mult + i * (mult + 1)) * 10000;
    return x - Math.floor(x);
  };
  const angle = (i / CONFETTI_COUNT) * Math.PI * 2 + r(1) * 0.5;
  const speed = 420 + r(2) * 620;
  const colors = [C.yellow, C.yellowBright, C.white, C.accent, C.pink, C.verified, C.cyan];
  return {
    angle,
    speed,
    color: colors[i % colors.length],
    size: 7 + r(3) * 12,
    rot: r(4) * Math.PI * 2,
    rotSpeed: (r(5) - 0.5) * 9,
    drift: (r(6) - 0.5) * 0.7,
    delay: Math.floor(r(7) * 6),
    shape: i % 4, // 0=rect, 1=square, 2=circle, 3=streak
  };
});

// ─── Verified blue checkmark (Instagram-style) ────────────────────────
const VerifiedBadge: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 1l2.4 2.4 3.4-.5.5 3.4L20.7 8.7 19.3 12l1.4 3.3-2.4 2.4-.5 3.4-3.4-.5L12 23l-2.4-2.4-3.4.5-.5-3.4L3.3 15.3 4.7 12 3.3 8.7l2.4-2.4.5-3.4 3.4.5L12 1z"
      fill={C.verified}
    />
    <path
      d="M9.5 12.5l2 2 4-4.5"
      stroke="white"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// ─── Stylized SVG silhouette placeholder ──────────────────────────────
const AvatarPlaceholder: React.FC = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="skin" cx="50%" cy="35%" r="50%">
        <stop offset="0%" stopColor="#F3CFA8" />
        <stop offset="100%" stopColor="#D9A77E" />
      </radialGradient>
      <linearGradient id="suit" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#1F1F1F" />
        <stop offset="100%" stopColor="#0A0A0A" />
      </linearGradient>
    </defs>
    {/* Head */}
    <ellipse cx="50" cy="40" rx="17" ry="20" fill="url(#skin)" />
    {/* Hair — short fade with sweep */}
    <path
      d="M 33 38 Q 32 22 50 20 Q 68 22 67 38 Q 65 28 60 26 Q 58 31 55 30 Q 52 27 50 28 Q 47 27 45 30 Q 42 31 40 26 Q 35 28 33 38 Z"
      fill="#1F140C"
    />
    {/* Eyes hint */}
    <ellipse cx="44" cy="42" rx="1.4" ry="1.6" fill="#3B2A1F" />
    <ellipse cx="56" cy="42" rx="1.4" ry="1.6" fill="#3B2A1F" />
    {/* Smile */}
    <path d="M 43 48 Q 50 53 57 48" stroke="#5B3A28" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    {/* Neck */}
    <rect x="44" y="58" width="12" height="10" fill="url(#skin)" />
    {/* Suit shoulders */}
    <path d="M 14 100 Q 14 70 34 64 L 50 78 L 66 64 Q 86 70 86 100 Z" fill="url(#suit)" />
    {/* Shirt */}
    <path d="M 41 100 L 41 70 L 50 82 L 59 70 L 59 100 Z" fill="#F4F4F4" />
    {/* Tie */}
    <path d="M 46 82 L 54 82 L 55 92 L 50 100 L 45 92 Z" fill="#2A2A2A" />
    <path d="M 46 82 L 54 82 L 53 86 L 50 88 L 47 86 Z" fill="#3A3A3A" />
  </svg>
);

// ─── Avatar with yellow ring (matches IG profile look) ────────────────
const AvatarRing: React.FC<{ size: number; ringProgress: number; popScale: number }> = ({
  size,
  ringProgress,
  popScale,
}) => {
  const ringWidth = size * 0.05;
  const r = (size - ringWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const innerGap = ringWidth * 1.8;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: `scale(${popScale})`,
      }}
    >
      {/* Yellow glow halo */}
      <div
        style={{
          position: "absolute",
          inset: -size * 0.1,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.yellowGlow}66 0%, transparent 60%)`,
          opacity: ringProgress,
          filter: "blur(24px)",
        }}
      />
      {/* Ring sweep */}
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.yellow}
          strokeWidth={ringWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ringProgress)}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 22px ${C.yellow}cc)` }}
        />
      </svg>
      {/* Photo well */}
      <div
        style={{
          position: "absolute",
          inset: innerGap,
          borderRadius: "50%",
          overflow: "hidden",
          background: `radial-gradient(circle at 50% 40%, #FFE89A 0%, ${C.yellow} 60%, #C99A0F 100%)`,
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.3)",
        }}
      >
        <AvatarPlaceholder />
        {/* Photo is scaled up (1.22) to crop out Brandon's own cyan ring
            that's baked into his IG profile pic. overflow:hidden on parent
            does the clipping. */}
        <img
          src={staticFile(AVATAR_PHOTO)}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.22)",
            transformOrigin: "center 45%",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    </div>
  );
};

// ─── Background ───────────────────────────────────────────────────────
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = 0.85 + Math.sin(frame * 0.08) * 0.05;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 55%, ${C.bgGlow} 0%, ${C.bg} 65%)`,
          opacity: glow,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 60%, ${C.yellow}1F 0%, transparent 55%)`,
          opacity: glow * pulse,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 20% 30%, ${C.accent}14 0%, transparent 50%), radial-gradient(circle at 80% 30%, ${C.cyan}10 0%, transparent 50%)`,
          opacity: glow * pulse,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Confetti burst ───────────────────────────────────────────────────
const ConfettiBurst: React.FC<{ originX: number; originY: number; startFrame: number }> = ({
  originX,
  originY,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 5 }}>
      {confetti.map((p, i) => {
        const t = Math.max(0, (localFrame - p.delay) / FPS);
        if (t <= 0) return null;
        const x = originX + Math.cos(p.angle) * p.speed * t + p.drift * 220 * t * t;
        const y = originY + Math.sin(p.angle) * p.speed * t + 980 * t * t * 0.5;
        const opacity = interpolate(t, [0, 0.25, 1.6, 2.4], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const rotation = p.rot + p.rotSpeed * t;
        if (opacity <= 0) return null;
        const isStreak = p.shape === 3;
        const isCircle = p.shape === 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - p.size / 2,
              top: y - p.size / 2,
              width: isStreak ? p.size * 2.2 : p.size,
              height: isStreak ? p.size * 0.35 : isCircle ? p.size : p.size * 0.55,
              background: p.color,
              opacity,
              transform: `rotate(${rotation}rad)`,
              borderRadius: isCircle ? "50%" : 2,
              boxShadow: `0 0 8px ${p.color}99`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Profile section (top of canvas) ──────────────────────────────────
const ProfileSection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card slide up
  const slideSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85, mass: 0.9 },
  });
  const translateY = interpolate(slideSpring, [0, 1], [220, 0]);
  const cardOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Avatar pop
  const avatarDelay = 14;
  const avatarSpring = spring({
    frame: frame - avatarDelay,
    fps,
    config: { damping: 9, stiffness: 130, mass: 0.65 },
  });
  const avatarScale = interpolate(avatarSpring, [0, 1], [0.25, 1]);
  const ringProgress = interpolate(
    frame,
    [avatarDelay + 4, avatarDelay + 32],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Text reveals
  const reveal = (start: number) => ({
    opacity: interpolate(frame, [start, start + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    y: interpolate(frame, [start, start + 12], [14, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  });

  const handle = reveal(26);
  const name = reveal(32);
  const stats = reveal(40);

  // Profile shrinks slightly when 30K bursts in (to make room visually)
  const shrinkStart = 50;
  const shrinkSpring = spring({
    frame: frame - shrinkStart,
    fps,
    config: { damping: 18, stiffness: 80, mass: 1 },
  });
  const profileScale = interpolate(shrinkSpring, [0, 1], [1, 0.78]);
  const profileShiftY = interpolate(shrinkSpring, [0, 1], [0, -40]);

  const AVATAR_SIZE = 280;

  return (
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: cardOpacity,
        transform: `translateY(${translateY + profileShiftY}px) scale(${profileScale})`,
        transformOrigin: "center top",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
        <AvatarRing size={AVATAR_SIZE} ringProgress={ringProgress} popScale={avatarScale} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: handle.opacity,
              transform: `translateY(${handle.y}px)`,
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: 56,
                fontWeight: 700,
                color: C.white,
                letterSpacing: -1,
                lineHeight: 1,
              }}
            >
              brandonthomasofficial
            </span>
            <VerifiedBadge size={42} />
          </div>
          <span
            style={{
              fontFamily,
              fontSize: 32,
              fontWeight: 400,
              color: C.mute,
              opacity: name.opacity,
              transform: `translateY(${name.y}px)`,
              lineHeight: 1.1,
            }}
          >
            Brandon Thomas
          </span>
          <div
            style={{
              display: "flex",
              gap: 38,
              marginTop: 16,
              opacity: stats.opacity,
              transform: `translateY(${stats.y}px)`,
            }}
          >
            <Stat value="326" label="posts" />
            <Stat value="30.8K" label="followers" highlight />
            <Stat value="228" label="following" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ value: string; label: string; highlight?: boolean }> = ({
  value,
  label,
  highlight,
}) => (
  <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
    <span
      style={{
        fontFamily,
        fontSize: 28,
        fontWeight: 700,
        color: highlight ? C.yellow : C.white,
        textShadow: highlight ? `0 0 18px ${C.yellow}88` : "none",
      }}
    >
      {value}
    </span>
    <span style={{ fontFamily, fontSize: 22, fontWeight: 400, color: C.mute }}>
      {label}
    </span>
  </div>
);

// ─── The big 30K reveal (center-lower) ────────────────────────────────
const BigNumber: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = 48;
  const local = frame - startFrame;

  // Number counter
  const countProgress = interpolate(local, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const count = Math.floor(countProgress * 30);

  // Spring scale pop
  const popSpring = spring({
    frame: local,
    fps,
    config: { damping: 8, stiffness: 105, mass: 0.55 },
  });
  const scale = interpolate(popSpring, [0, 1], [0.15, 1]);

  // Gentle continuous pulse
  const pulseFrame = Math.max(0, local - 26);
  const pulse = 1 + Math.sin(pulseFrame * 0.16) * 0.022;

  // Glow ramp
  const glow = interpolate(local, [0, 22, 50], [0, 1, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(local, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const centerX = W / 2;
  const centerY = 660;

  return (
    <>
      <ConfettiBurst originX={centerX} originY={centerY - 60} startFrame={startFrame + 4} />
      <div
        style={{
          position: "absolute",
          left: centerX - 600,
          top: centerY - 240,
          width: 1200,
          height: 480,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity,
          transform: `scale(${scale * pulse})`,
          zIndex: 3,
        }}
      >
        {/* Glow halo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle, ${C.yellow}66 0%, transparent 55%)`,
            opacity: glow,
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            fontFamily,
            fontSize: 380,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: -14,
            background: `linear-gradient(180deg, #FFFFFF 0%, ${C.yellowBright} 50%, ${C.yellow} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: `drop-shadow(0 0 30px ${C.yellow}aa) drop-shadow(0 8px 24px rgba(0,0,0,0.6))`,
            position: "relative",
          }}
        >
          {count}K
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 52,
            fontWeight: 700,
            color: C.white,
            letterSpacing: 10,
            marginTop: -4,
            opacity: interpolate(local, [18, 32], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            position: "relative",
            textShadow: `0 0 20px ${C.yellow}55`,
          }}
        >
          FOLLOWERS
        </div>
      </div>
    </>
  );
};

// ─── Bottom celebration text ──────────────────────────────────────────
const CelebrationText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = 92;
  const local = frame - startFrame;

  const words = ["Boom!", "Congrats", "on", "30K", "followers", "with", "your", "AI", "clone"];

  const containerSpring = spring({
    frame: local,
    fps,
    config: { damping: 14, stiffness: 95, mass: 0.85 },
  });
  const containerY = interpolate(containerSpring, [0, 1], [36, 0]);
  const containerOpacity = interpolate(local, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Underline bar grows in after words land
  const barProgress = interpolate(local, [32, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: containerOpacity,
        transform: `translateY(${containerY}px)`,
        zIndex: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 18,
          alignItems: "baseline",
          flexWrap: "nowrap",
          justifyContent: "center",
        }}
      >
        {words.map((word, i) => {
          const wordDelay = i * 2.5;
          const wordOpacity = interpolate(
            local,
            [wordDelay, wordDelay + 9],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const wordY = interpolate(
            local,
            [wordDelay, wordDelay + 9],
            [16, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const isHighlight = word === "30K";
          const isBoom = word === "Boom!";
          const isClone = word === "clone";
          const color = isHighlight ? C.yellow : isBoom ? C.yellowBright : C.white;
          return (
            <span
              key={i}
              style={{
                fontFamily,
                fontSize: 60,
                fontWeight: isHighlight || isBoom ? 800 : isClone ? 700 : 600,
                color,
                opacity: wordOpacity,
                transform: `translateY(${wordY}px)`,
                letterSpacing: -1,
                textShadow: isHighlight || isBoom ? `0 0 28px ${C.yellow}aa` : "none",
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
      {/* Accent underline */}
      <div
        style={{
          marginTop: 18,
          height: 4,
          width: 220 * barProgress,
          background: `linear-gradient(90deg, transparent, ${C.yellow}, transparent)`,
          borderRadius: 4,
          boxShadow: `0 0 14px ${C.yellow}`,
        }}
      />
    </div>
  );
};

// ─── Top horizontal streak (sweeping highlight) ───────────────────────
const TopStreak: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [4, 30], [-300, W + 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 4),
  });
  const opacity = interpolate(frame, [4, 14, 30], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: sweep - 240,
        width: 480,
        height: 4,
        background: `linear-gradient(90deg, transparent, ${C.yellow}, transparent)`,
        opacity,
        filter: "blur(2px)",
        boxShadow: `0 0 22px ${C.yellow}`,
      }}
    />
  );
};

// ─── Main composition ─────────────────────────────────────────────────
// All phase components use the absolute composition frame directly and
// gate themselves by frame number.
export const Brandon30K: React.FC = () => {
  return (
    <AbsoluteFill style={{ width: W, height: H }}>
      <Background />
      <TopStreak />
      <ProfileSection />
      <BigNumber />
      <CelebrationText />
    </AbsoluteFill>
  );
};
