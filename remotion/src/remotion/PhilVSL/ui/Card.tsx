import React from "react";
import { C, RADIUS } from "./tokens";

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  variant?: "white" | "soft" | "dark" | "highlight";
  borderHighlight?: boolean;
  padding?: number;
  radius?: number;
};

export const Card: React.FC<Props> = ({
  children,
  style,
  variant = "white",
  borderHighlight = false,
  padding = 28,
  radius = RADIUS.card,
}) => {
  const bg = {
    white: C.card,
    soft: C.cardSoft,
    dark: C.darkOlive,
    highlight: C.limeSoft,
  }[variant];

  const color = variant === "dark" ? C.invertedInk : C.ink;

  return (
    <div
      style={{
        background: bg,
        color,
        borderRadius: radius,
        padding,
        boxShadow: C.shadowSoft,
        border: borderHighlight ? `2px solid ${C.lime}` : `1px solid ${C.cardBorder}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
