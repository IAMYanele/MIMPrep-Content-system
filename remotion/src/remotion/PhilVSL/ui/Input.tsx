import React from "react";
import { C, FONT_UI, RADIUS } from "./tokens";

type Props = {
  label?: string;
  value?: string;
  placeholder?: string;
  caret?: boolean;
  caretBlink?: boolean;
  width?: number | string;
  style?: React.CSSProperties;
  small?: boolean;
};

export const Input: React.FC<Props> = ({
  label,
  value,
  placeholder,
  caret = false,
  caretBlink = false,
  width,
  style,
  small,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: width ?? "auto" }}>
      {label && (
        <div
          style={{
            fontFamily: FONT_UI,
            fontSize: 11,
            color: C.muted,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          height: small ? 38 : 48,
          background: C.input,
          borderRadius: RADIUS.input,
          paddingLeft: 14,
          paddingRight: 14,
          display: "flex",
          alignItems: "center",
          fontFamily: FONT_UI,
          fontSize: small ? 13 : 15,
          color: value ? C.ink : C.muted,
          ...style,
        }}
      >
        <span>{value ?? placeholder ?? ""}</span>
        {caret && (
          <span
            style={{
              display: "inline-block",
              width: 1.5,
              height: small ? 16 : 20,
              background: C.ink,
              marginLeft: 1,
              opacity: caretBlink ? 0.2 : 1,
            }}
          />
        )}
      </div>
    </div>
  );
};
