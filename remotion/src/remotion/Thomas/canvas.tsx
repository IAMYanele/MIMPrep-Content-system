import React from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
// The fonts are served from public/ rather than fetched from gstatic on every
// render: a transient ERR_NO_BUFFER_SPACE from Google killed a whole batch, and
// 27 renders should not depend on the network 27 times.

// Thomas — "The Study System". The one bespoke canvas every major animation lives
// inside, per the Iman editor brain: a single accent colour on a textured black
// field, one condensed heavy display face, one handwritten face as the editor's
// voice, and tape/stamp labels for corrections.

if (typeof document !== "undefined" && !document.getElementById("thomas-fonts")) {
  const style = document.createElement("style");
  style.id = "thomas-fonts";
  style.textContent = `
    @font-face{font-family:'AntonLocal';font-weight:400;font-display:block;
      src:url('${staticFile("thomas/fonts/anton.woff2")}') format('woff2');}
    @font-face{font-family:'CaveatLocal';font-weight:400;font-display:block;
      src:url('${staticFile("thomas/fonts/caveat.woff2")}') format('woff2');}`;
  document.head.appendChild(style);

  // hold the render until the faces are actually usable, or the first frames
  // would be captured in the fallback font
  const handle = delayRender("thomas fonts");
  Promise.all([
    document.fonts.load("1em AntonLocal"),
    document.fonts.load("1em CaveatLocal"),
  ])
    .catch(() => undefined)
    .then(() => continueRender(handle));
}

export const DISPLAY = "AntonLocal, Impact, sans-serif";
export const SCRIPT = "CaveatLocal, cursive";

export const INK = "#0E0E10";
export const RED = "#E3372B";
export const BONE = "#F4F0E8";
export const DIM = "#6E6A64";

// Paper grain, as an inline SVG turbulence so nothing has to ship as an asset.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/** The textured field. Every full-screen major sits on this. */
export const Field: React.FC<{ children?: React.ReactNode; tint?: string }> = ({
  children,
  tint,
}) => (
  <AbsoluteFill style={{ backgroundColor: INK }}>
    {/* a faint vignetted wash so the field is never flat */}
    <AbsoluteFill
      style={{
        background: `radial-gradient(70% 60% at 50% 42%, ${tint ?? "#1A1B1F"} 0%, ${INK} 72%)`,
      }}
    />
    <AbsoluteFill
      style={{ backgroundImage: GRAIN, opacity: 0.08, mixBlendMode: "overlay" }}
    />
    {children}
    {/* edge falloff keeps the eye centred */}
    <AbsoluteFill
      style={{
        boxShadow: "inset 0 0 220px 90px rgba(0,0,0,0.75)",
        pointerEvents: "none",
      }}
    />
  </AbsoluteFill>
);

/** The talking head, windowed out of the assembled cut. */
export const Base: React.FC<{ from: number }> = ({ from }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile("thomas/assembly.mp4")}
        trimBefore={Math.round(from * fps)}
        muted
      />
    </AbsoluteFill>
  );
};

/** Left-to-right reveal — the write-on motion used throughout. */
export const WriteOn: React.FC<{
  at?: number;
  dur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at = 0, dur = 0.42, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [at * fps, (at + dur) * fps], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ ...style, clipPath: `inset(0 ${100 - p}% 0 0)` }}>{children}</div>
  );
};

/** Overshooting pop, used for anything that lands on a word. */
export const usePop = (at: number, stiffness = 120) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - Math.round(at * fps),
    fps,
    config: { damping: 12, mass: 0.7, stiffness },
  });
};

/** Rubber stamp: slams in rotated, with a dry-ink edge. */
export const Stamp: React.FC<{ at: number; text: string; rotate?: number; size?: number }> = ({
  at,
  text,
  rotate = -7,
  size = 92,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame - at * fps) / fps;
  if (t < 0) return null;
  // overshoot down onto the page, then settle
  const scale = interpolate(t, [0, 0.07, 0.16], [2.4, 0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(t, [0, 0.05], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        transform: `rotate(${rotate}deg) scale(${scale})`,
        // slightly under full ink, which reads as a rubber stamp without the
        // legibility cost of masking the fill with the grain
        opacity: opacity * 0.94,
        border: `7px solid ${RED}`,
        borderRadius: 10,
        padding: "14px 34px 10px",
        fontFamily: DISPLAY,
        fontSize: size,
        letterSpacing: 2,
        color: RED,
        textTransform: "uppercase",
        background: "rgba(227,55,43,0.07)",
        boxShadow: `0 0 0 2px rgba(227,55,43,0.25)`,
      }}
    >
      {text}
    </div>
  );
};

/** Hero word: the single compressed phrase a RED major is built around. */
export const Hero: React.FC<{
  at?: number;
  children: React.ReactNode;
  size?: number;
  colour?: string;
}> = ({ at = 0, children, size = 150, colour = BONE }) => {
  const pop = usePop(at);
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: 0.96,
        letterSpacing: -1,
        textTransform: "uppercase",
        color: colour,
        textAlign: "center",
        opacity: pop,
        transform: `translateY(${(1 - pop) * 26}px) scale(${interpolate(pop, [0, 1], [0.93, 1])})`,
      }}
    >
      {children}
    </div>
  );
};

/** The editor's voice: handwritten asides. */
export const Aside: React.FC<{
  at?: number;
  children: React.ReactNode;
  size?: number;
  rotate?: number;
  style?: React.CSSProperties;
}> = ({ at = 0, children, size = 64, rotate = -3, style }) => {
  const pop = usePop(at, 90);
  return (
    <div
      style={{
        fontFamily: SCRIPT,
        fontSize: size,
        color: RED,
        transform: `rotate(${rotate}deg) scale(${interpolate(pop, [0, 1], [0.9, 1])})`,
        opacity: pop,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Tape label — used to pin cards and screenshots to the field. */
export const Tape: React.FC<{ style?: React.CSSProperties; rotate?: number }> = ({
  style,
  rotate = -4,
}) => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      width: 150,
      height: 44,
      background: "rgba(244,240,232,0.30)",
      borderLeft: "1px solid rgba(244,240,232,0.45)",
      borderRight: "1px solid rgba(244,240,232,0.45)",
      transform: `rotate(${rotate}deg)`,
      backdropFilter: "blur(1px)",
      ...style,
    }}
  />
);
