import React from "react";
import { C, FONT_UI } from "./tokens";

type Step = { label: string; status: "completed" | "active" | "upcoming" };

type Props = {
  steps: Step[];
  style?: React.CSSProperties;
};

export const Stepper: React.FC<Props> = ({ steps, style }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, ...style }}>
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        const dotBg =
          s.status === "completed" ? C.sage : s.status === "active" ? C.lime : "transparent";
        const dotBorder = s.status === "upcoming" ? `1.5px solid ${C.dividerStrong}` : "none";
        const dotColor = s.status === "completed" || s.status === "active" ? C.ink : C.muted;
        const labelColor = s.status === "active" ? C.ink : s.status === "completed" ? C.body : C.muted;

        return (
          <React.Fragment key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: dotBg,
                  border: dotBorder,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT_UI,
                  fontSize: 11,
                  fontWeight: 600,
                  color: dotColor,
                }}
              >
                {s.status === "completed" ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5 9-11" stroke={C.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span style={{ fontFamily: FONT_UI, fontSize: 13, color: labelColor, fontWeight: s.status === "active" ? 500 : 400 }}>
                {s.label}
              </span>
            </div>
            {!isLast && (
              <span
                style={{
                  flex: 1,
                  minWidth: 40,
                  height: 1,
                  background: C.dividerStrong,
                  borderTop: `1px dashed ${C.dividerStrong}`,
                  borderBottom: "none",
                  borderLeft: "none",
                  borderRight: "none",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
