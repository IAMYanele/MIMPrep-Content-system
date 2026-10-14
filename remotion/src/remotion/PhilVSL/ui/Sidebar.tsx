import React from "react";
import { C, FONT_UI } from "./tokens";
import { Logo } from "./Logo";

type Item = { label: string; active?: boolean; badge?: number };

type Props = {
  items: Item[];
  width?: number;
};

const ICONS: Record<string, React.ReactNode> = {
  Dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  "My Appointments": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  "My Messages": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 5h16v11H8l-4 4V5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  "My Secure Messages": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 5h16v11H8l-4 4V5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  "My Documents": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 3h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15 3v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  "My Forms": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  "My Account": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

export const Sidebar: React.FC<Props> = ({ items, width = 220 }) => {
  return (
    <div
      style={{
        width,
        background: C.darkOlive,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        paddingTop: 28,
        paddingBottom: 28,
        color: C.invertedInk,
        fontFamily: FONT_UI,
        position: "relative",
        height: "100%",
      }}
    >
      <div style={{ paddingLeft: 26, marginBottom: 36, display: "flex", alignItems: "center", gap: 10 }}>
        <Logo size={24} color={C.invertedInk} />
      </div>
      <div style={{ paddingLeft: 18, fontSize: 10, color: "rgba(244,239,226,0.45)", letterSpacing: "0.18em", marginBottom: 10 }}>
        PORTAL
      </div>
      <nav style={{ display: "flex", flexDirection: "column" }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingLeft: 18,
              paddingRight: 18,
              height: 40,
              color: item.active ? C.lime : "rgba(244,239,226,0.78)",
              background: item.active ? "rgba(200,255,140,0.08)" : "transparent",
              borderLeft: item.active ? `3px solid ${C.lime}` : "3px solid transparent",
              fontSize: 14,
              fontWeight: item.active ? 500 : 400,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {ICONS[item.label] ?? <span style={{ width: 18, height: 18 }} />}
              {item.label}
            </span>
            {item.badge !== undefined && (
              <span
                style={{
                  background: C.lime,
                  color: C.ink,
                  borderRadius: 999,
                  width: 22,
                  height: 18,
                  fontSize: 11,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Care team CTA */}
      <div style={{ marginTop: "auto", padding: 18 }}>
        <div style={{ fontFamily: FONT_UI, color: C.invertedInk, fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
          Care team
          <br />
          here for you.
        </div>
        <div style={{ fontSize: 11, color: "rgba(244,239,226,0.55)", marginBottom: 8 }}>
          Reach out anytime in secure messages.
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: C.lime }}>
          Contact us
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M7 17L17 7M17 7H8M17 7V16" stroke={C.lime} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};
