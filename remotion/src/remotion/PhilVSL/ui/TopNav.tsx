import React from "react";
import { C, FONT_UI } from "./tokens";
import { Logo } from "./Logo";

type Props = {
  userName?: string;
  patientId?: string;
};

export const TopNav: React.FC<Props> = ({ userName = "Jordan Mills", patientId = "6842" }) => {
  return (
    <div
      style={{
        height: 64,
        background: C.darkOlive,
        display: "flex",
        alignItems: "center",
        paddingLeft: 28,
        paddingRight: 28,
        color: C.invertedInk,
        fontFamily: FONT_UI,
        flexShrink: 0,
      }}
    >
      <Logo size={22} color={C.invertedInk} />
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3a6 6 0 016 6v4l1.5 3H4.5L6 13V9a6 6 0 016-6zm0 18a2.5 2.5 0 002.5-2.5h-5A2.5 2.5 0 0012 21z"
            stroke="rgba(244,239,226,0.8)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 999, background: C.sageDeep, display: "flex", alignItems: "center", justifyContent: "center", color: C.invertedInk, fontSize: 12, fontWeight: 600 }}>
            JM
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{userName}</div>
            <div style={{ fontSize: 11, color: "rgba(244,239,226,0.55)" }}>Patient ID · {patientId}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
