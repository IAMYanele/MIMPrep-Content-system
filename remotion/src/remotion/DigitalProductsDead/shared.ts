import { Easing } from "remotion";

// ─────────────────────────────────────────────────
// COLOR PALETTE — 60-30-10 Rule
// 60% dominant: black (#0A0A0A)
// 30% secondary: royalBlue (#1A3A6B) + muted whites
// 10% accent:   accentBlue (#3B82F6) — ONE element per frame only
// ─────────────────────────────────────────────────
export const C = {
  black: "#0A0A0A",
  royalBlue: "#1A3A6B",
  iceWhite: "#F5F7FA",
  accent: "#3B82F6",
  red: "#EF4444",
  // Secondary tones (30% band)
  secondary: "rgba(245, 247, 250, 0.55)",
  tertiary: "rgba(245, 247, 250, 0.30)",
  subtle: "rgba(245, 247, 250, 0.12)",
  // Glass
  glass: "rgba(255, 255, 255, 0.03)",
  glassBorder: "rgba(255, 255, 255, 0.07)",
} as const;

// ─────────────────────────────────────────────────
// EASING — Global consistency
// Entrance:  EASE_OUT (fast start, slow settle)
// Exit:      EASE_IN (slow start, fast away)
// Reposition: EASE_IN_OUT
// ─────────────────────────────────────────────────
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_IN_OUT = Easing.bezier(0.25, 0.1, 0.25, 1);

// ─────────────────────────────────────────────────
// DIMENSIONS & GRID
// 12-column grid at 1920px, 80px margins, 24px gutters
// ─────────────────────────────────────────────────
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
export const MARGIN = 80; // safe area — inner 91.7%
export const GUTTER = 24;
export const COL_W = (WIDTH - MARGIN * 2 - GUTTER * 11) / 12; // ~122.7px

// Grid helper: get x position for column start (0-indexed)
export const col = (n: number): number => MARGIN + n * (COL_W + GUTTER);
// Thirds
export const THIRD_X = WIDTH / 3; // 640
export const THIRD_Y = HEIGHT / 3; // 360

// ─────────────────────────────────────────────────
// TIMING CONSTANTS (in frames at 30fps)
// Rulebook: 50-120ms stagger, 300-500ms entrances
// ─────────────────────────────────────────────────
export const STAGGER = 3; // ~100ms at 30fps
export const ENTRANCE = 12; // 400ms — element entrance duration
export const TRANSITION = 18; // 600ms — scene transition
export const HOLD_MIN = 90; // 3s minimum hold for readable text

// ─────────────────────────────────────────────────
// TYPOGRAPHIC SCALE — 1.5x modular scale
// Primary: 52px | Secondary: 34px | Tertiary: 24px (minimum)
// ─────────────────────────────────────────────────
export const TYPE = {
  primary: {
    fontSize: 52,
    fontWeight: 700 as const,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    lineHeight: 1.1,
  },
  secondary: {
    fontSize: 34,
    fontWeight: 700 as const,
    letterSpacing: "0.02em",
    lineHeight: 1.25,
  },
  tertiary: {
    fontSize: 24,
    fontWeight: 400 as const,
    letterSpacing: "0.02em",
    lineHeight: 1.45,
  },
  label: {
    fontSize: 14,
    fontWeight: 700 as const,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    lineHeight: 1.2,
  },
} as const;

// ─────────────────────────────────────────────────
// GLASS CARD — consistent corner radius (16px everywhere)
// ─────────────────────────────────────────────────
export const glassCard: React.CSSProperties = {
  background: C.glass,
  border: `1px solid ${C.glassBorder}`,
  borderRadius: 16,
};
