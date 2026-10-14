// ─────────────────────────────────────────────────────────────
// BrandKit — presentational (mostly unanimated) brand atoms.
// Scenes import these and choreograph the WRAPPERS (translate/scale/opacity).
// Keeping the marks here guarantees the two brands look identical across scenes.
// ─────────────────────────────────────────────────────────────
import React from "react";
import { OffthreadVideo, staticFile } from "remotion";
import { BUSINESS, PERSONAL, UNIFY, VIDEO_SRC, fontFamily } from "./theme";

type Team = "business" | "personal";

const teamCfg = (team: Team) => (team === "business" ? BUSINESS : PERSONAL);
const teamAccent = (team: Team) =>
  team === "business" ? BUSINESS.blue : PERSONAL.gold;

// "GET SELLERS" wordmark — white text + a blue "G" mark square.
export const GetSellersWordmark: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 46, color = "#FFFFFF" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.28, fontFamily }}>
    <div
      style={{
        width: size * 1.05,
        height: size * 1.05,
        borderRadius: size * 0.26,
        background: BUSINESS.blue,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.72,
        boxShadow: `0 6px 20px ${BUSINESS.blue}66`,
      }}
    >
      G
    </div>
    <div
      style={{
        color,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.02em",
        lineHeight: 1,
      }}
    >
      GET SELLERS
    </div>
  </div>
);

// Circular, ringed live face pulled from the avatar video itself (muted).
export const FaceCircle: React.FC<{
  size?: number;
  ring?: string;
  ringWidth?: number;
}> = ({ size = 240, ring = PERSONAL.gold, ringWidth = 6 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      background: "#000",
      border: `${ringWidth}px solid ${ring}`,
      boxShadow: `0 18px 50px ${ring}55`,
    }}
  >
    <OffthreadVideo
      src={staticFile(VIDEO_SRC)}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </div>
);

// Brand handle text (auto-colored to the team accent).
export const Handle: React.FC<{ team: Team; size?: number }> = ({
  team,
  size = 34,
}) => (
  <span
    style={{
      fontFamily,
      fontWeight: 700,
      fontSize: size,
      color: teamAccent(team),
      letterSpacing: "0.01em",
    }}
  >
    {teamCfg(team).handle}
  </span>
);

// Small uppercase label chip (BUSINESS BRAND / PERSONAL BRAND).
export const LabelChip: React.FC<{ team: Team; size?: number }> = ({
  team,
  size = 22,
}) => {
  const accent = teamAccent(team);
  return (
    <div
      style={{
        background: `${accent}22`,
        color: accent,
        fontFamily,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.14em",
        padding: `${size * 0.45}px ${size * 0.9}px`,
        borderRadius: 999,
      }}
    >
      {teamCfg(team).label}
    </div>
  );
};

// A full brand card. Business → wordmark. Personal → face (or name).
export const BrandCard: React.FC<{
  team: Team;
  width?: number;
  height?: number;
  showFace?: boolean;
  style?: React.CSSProperties;
}> = ({ team, width = 400, height = 520, showFace = false, style }) => {
  const cfg = teamCfg(team);
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 40,
        background: cfg.ink,
        padding: 44,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        boxShadow: "0 40px 90px rgba(10,16,40,0.30)",
        fontFamily,
        ...style,
      }}
    >
      <LabelChip team={team} />
      {team === "business" ? (
        <GetSellersWordmark size={46} />
      ) : showFace ? (
        <FaceCircle size={210} ring={PERSONAL.gold} />
      ) : (
        <div
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 38,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {PERSONAL.name}
        </div>
      )}
      <Handle team={team} size={32} />
    </div>
  );
};

// GetSellers-style CTA pill — yellow fill, navy text.
export const PillCTA: React.FC<{
  children: React.ReactNode;
  fontSize?: number;
  style?: React.CSSProperties;
}> = ({ children, fontSize = 36, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      background: UNIFY,
      color: BUSINESS.ink,
      fontFamily,
      fontWeight: 700,
      fontSize,
      padding: `${fontSize * 0.62}px ${fontSize * 1.25}px`,
      borderRadius: 999,
      boxShadow: `0 18px 46px ${UNIFY}66`,
      ...style,
    }}
  >
    {children}
  </div>
);
