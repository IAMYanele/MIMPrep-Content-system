// Vita Bella design tokens — pulled from vitabella.com brand spec + the 12 PNG mockups.
export const C = {
  // Backgrounds
  page: "#F0EBE0",        // warm off-white page bg
  card: "#FFFFFF",        // crisp white card surface
  cardSoft: "#F8F5F0",    // tinted card variant
  input: "#EAE5DA",       // input fill

  // Brand
  navy: "#1E291E",        // near-black olive (text, dark nav)
  darkOlive: "#2D3319",   // top nav / sidebar bg
  sage: "#7A8B5E",        // accent + checkmarks + secondary text
  sageDeep: "#5F704A",
  lime: "#C8FF8C",        // primary CTA / highlights
  limeSoft: "#DFF3B8",    // selected row background tint

  // Text
  ink: "#1E291E",
  body: "#4A4A40",
  muted: "#8A8A7E",
  invertedInk: "#F4EFE2",

  // States
  amber: "#D69C3A",
  amberSoft: "#FAE9C9",
  redDot: "#E55B4B",
  yellowDot: "#E9B441",
  greenDot: "#7BB661",

  // Borders / dividers
  divider: "rgba(30, 41, 30, 0.08)",
  dividerStrong: "rgba(30, 41, 30, 0.18)",
  cardBorder: "rgba(30, 41, 30, 0.06)",

  // Shadow
  shadow: "0 30px 60px -30px rgba(30, 41, 30, 0.18), 0 8px 20px -10px rgba(30, 41, 30, 0.08)",
  shadowSoft: "0 14px 30px -16px rgba(30, 41, 30, 0.12)",
} as const;

// Typography
export const FONT_DISPLAY = "'Instrument Serif', 'Times New Roman', serif";
export const FONT_UI = "'Inter Tight', 'Inter', system-ui, sans-serif";

export const TYPE = {
  hero: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 400,
    fontSize: 76,
    lineHeight: 0.95,
    letterSpacing: "-0.02em",
    color: C.ink,
  },
  h1: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 400,
    fontSize: 58,
    lineHeight: 1.0,
    letterSpacing: "-0.015em",
    color: C.ink,
  },
  h2: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 400,
    fontSize: 38,
    lineHeight: 1.05,
    letterSpacing: "-0.01em",
    color: C.ink,
  },
  h3: {
    fontFamily: FONT_UI,
    fontWeight: 600,
    fontSize: 22,
    lineHeight: 1.2,
    color: C.ink,
  },
  body: {
    fontFamily: FONT_UI,
    fontWeight: 400,
    fontSize: 16,
    lineHeight: 1.45,
    color: C.body,
  },
  bodyLg: {
    fontFamily: FONT_UI,
    fontWeight: 400,
    fontSize: 18,
    lineHeight: 1.45,
    color: C.body,
  },
  label: {
    fontFamily: FONT_UI,
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: C.muted,
  },
  small: {
    fontFamily: FONT_UI,
    fontWeight: 400,
    fontSize: 13,
    color: C.muted,
  },
  pillBtn: {
    fontFamily: FONT_UI,
    fontWeight: 500,
    fontSize: 15,
    letterSpacing: "0.005em",
  },
} as const;

// Sizing
export const RADIUS = {
  card: 28,
  cardSm: 18,
  pill: 999,
  input: 12,
  chip: 999,
} as const;

export const W = 1920;
export const H = 1080;
