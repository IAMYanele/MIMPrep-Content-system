import React from "react";
import { C, FONT_UI } from "./tokens";

type Props = {
  url: string;
  tabTitle: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const BrowserChrome: React.FC<Props> = ({ url, tabTitle, children, style }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: C.card,
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: C.shadow,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 44,
          background: C.cardSoft,
          display: "flex",
          alignItems: "center",
          paddingLeft: 18,
          paddingRight: 18,
          gap: 14,
          borderBottom: `1px solid ${C.divider}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ width: 13, height: 13, borderRadius: 999, background: C.redDot, display: "inline-block" }} />
          <span style={{ width: 13, height: 13, borderRadius: 999, background: C.yellowDot, display: "inline-block" }} />
          <span style={{ width: 13, height: 13, borderRadius: 999, background: C.greenDot, display: "inline-block" }} />
        </div>
        {/* Tab */}
        <div
          style={{
            marginLeft: 14,
            height: 30,
            background: C.card,
            borderRadius: "8px 8px 0 0",
            paddingLeft: 14,
            paddingRight: 26,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: FONT_UI,
            fontSize: 12,
            color: C.ink,
            position: "relative",
            top: 7,
            boxShadow: "0 -1px 0 rgba(30,41,30,0.05)",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 2, background: C.sage }} />
          {tabTitle}
          <span style={{ marginLeft: 6, color: C.muted, fontSize: 14 }}>×</span>
        </div>
      </div>
      {/* URL bar */}
      <div
        style={{
          height: 40,
          background: C.cardSoft,
          display: "flex",
          alignItems: "center",
          paddingLeft: 18,
          paddingRight: 18,
          gap: 12,
          borderBottom: `1px solid ${C.divider}`,
          flexShrink: 0,
        }}
      >
        <span style={{ color: C.muted, fontSize: 14 }}>‹</span>
        <span style={{ color: C.muted, fontSize: 14 }}>›</span>
        <span style={{ color: C.muted, fontSize: 13 }}>↻</span>
        <div
          style={{
            flex: 1,
            height: 26,
            background: C.card,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            paddingLeft: 14,
            paddingRight: 14,
            fontFamily: FONT_UI,
            fontSize: 12,
            color: C.body,
            gap: 8,
          }}
        >
          <span style={{ color: C.muted }}>🔒</span>
          {url}
        </div>
        <div style={{ width: 22, height: 22, borderRadius: 999, background: C.sage }} />
      </div>
      {/* Body */}
      <div style={{ flex: 1, position: "relative", background: C.page, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
};
