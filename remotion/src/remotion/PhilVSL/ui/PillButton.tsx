import React from "react";
import { C, FONT_UI } from "./tokens";

type Props = {
  variant?: "lime" | "white" | "dark";
  size?: "sm" | "md" | "lg";
  label: string;
  showArrow?: boolean;
  style?: React.CSSProperties;
  showCamera?: boolean;
  selected?: boolean;
};

export const PillButton: React.FC<Props> = ({
  variant = "lime",
  size = "md",
  label,
  showArrow = true,
  showCamera = false,
  selected = false,
  style,
}) => {
  const bg = variant === "lime" ? C.lime : variant === "dark" ? C.darkOlive : C.card;
  const fg = variant === "dark" ? C.invertedInk : C.ink;
  const border = variant === "white" ? `1px solid ${C.divider}` : "none";

  const dims = {
    sm: { h: 34, px: 16, fs: 13 },
    md: { h: 44, px: 22, fs: 15 },
    lg: { h: 56, px: 28, fs: 17 },
  }[size];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: dims.h,
        paddingLeft: dims.px,
        paddingRight: dims.px,
        background: bg,
        color: fg,
        borderRadius: 999,
        border,
        fontFamily: FONT_UI,
        fontWeight: 500,
        fontSize: dims.fs,
        whiteSpace: "nowrap",
        boxShadow: selected
          ? `0 0 0 3px ${C.lime}, 0 0 0 5px rgba(200,255,140,0.3)`
          : variant === "lime"
            ? "0 2px 0 rgba(30,41,30,0.05)"
            : "none",
        ...style,
      }}
    >
      {showCamera && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="6" width="14" height="12" rx="2" fill={fg} />
          <path d="M16 10l5-3v10l-5-3z" fill={fg} />
        </svg>
      )}
      {label}
      {showArrow && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 2 }}>
          <path d="M7 17L17 7M17 7H8M17 7V16" stroke={fg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};
