// ─────────────────────────────────────────────────────────────
// "It Takes Two Brands" — @estenick (personal) × @getsellers.io (business)
// Shared design tokens for the 9:16 short-form overlay comp.
// House caption font is Space Grotesk 700 — we match it here.
// ─────────────────────────────────────────────────────────────
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

export const { fontFamily } = loadFont("normal", {
  subsets: ["latin"],
  weights: ["500", "700"],
});

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Source video (lives in public/). Use with staticFile().
export const VIDEO_SRC = "avatar-video.mp4";

// Full-overlay hero scenes sit on WHITE (per art direction).
export const BG = "#FFFFFF";
export const BG_SOFT = "#F3F4F8";

// ── BUSINESS team — GetSellers (cool). Palette from their live brand CSS.
export const BUSINESS = {
  ink: "#081028", // navy card fill
  inkDeep: "#050B1C",
  blue: "#009BFB", // electric blue accent
  blueDeep: "#001AAC",
  text: "#FFFFFF",
  handle: "@getsellers.io",
  name: "GET SELLERS",
  label: "BUSINESS BRAND",
} as const;

// ── PERSONAL team — Esteban Andrade / @estenick (warm). Gold + purple signature.
export const PERSONAL = {
  ink: "#2A1A4A", // deep purple card fill
  inkDeep: "#1B1033",
  gold: "#FACC15", // gold accent
  goldDeep: "#EAB308",
  purple: "#8C45FF",
  text: "#FFFFFF",
  handle: "@estenick",
  name: "ESTEBAN ANDRADE",
  label: "PERSONAL BRAND",
} as const;

// Shared unifier color for the "build both" resolution + CTA pill.
export const UNIFY = "#FACC15";

// House spring presets (lifted from YaneleTalkingHead / AIAgentExplainer).
export const SPRINGS = {
  card: { damping: 16, stiffness: 100 },
  hook: { damping: 18, stiffness: 80 },
  cta: { damping: 14, stiffness: 80 },
  pop: { damping: 20, stiffness: 200 },
  icon: { damping: 12, stiffness: 120 },
  settle: { damping: 200 },
} as const;
