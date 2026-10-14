import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY, FONT_UI, RADIUS } from "../ui/tokens";
import { SceneShell, innerToAbs } from "../ui/SceneShell";
import { PillButton } from "../ui/PillButton";
import { Cursor, CursorWaypoint } from "../ui/Cursor";
import { TopNav } from "../ui/TopNav";
import { Sidebar } from "../ui/Sidebar";
import { Typewriter } from "../ui/Typewriter";
import { SLINGSHOT, SNAPPY, SOFT, EASE_OUT } from "../animation/springs";

type Props = { durationInFrames: number };

export const Scene08NewMessageModal: React.FC<Props> = ({ durationInFrames }) => {
  const { fps } = useVideoConfig();

  return (
    <SceneShell
      url="app.portal.health/messages/new"
      tabTitle="New Message"
      durationInFrames={durationInFrames}
    >
      {(frame) => {
        // Backdrop dashboard (dimmed)
        const backdropP = spring({ frame: frame - 6, fps, config: SOFT });
        const scrimP = interpolate(frame, [14, 30], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const bannerP = spring({ frame: frame - 22, fps, config: SLINGSHOT });
        const modalP = spring({ frame: frame - 35, fps, config: SLINGSHOT });
        const modalHeadingP = interpolate(frame, [70, 100], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const toP = spring({ frame: frame - 80, fps, config: SNAPPY });
        const subjectFocusP = interpolate(frame, [105, 115], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const bodyFocusP = interpolate(frame, [150, 160], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const sendHoverP = spring({ frame: frame - 190, fps, config: SNAPPY });

        // Typewriter start frames
        const subjectStart = 108;
        const subjectText = "Alternative bloodwork options";
        const bodyStart = 155;
        const bodyText =
          "I'm in a rural area without a Quest within 90 minutes. Looking for the closest alternative.";

        // Modal dims (centered in the chrome inner area: 1760 x 876)
        const modalW = 700;
        const modalH = 560;
        const modalLeft = (1760 - modalW) / 2;
        const modalTop = 200;

        // Cursor waypoints — start near bottom
        const cursorWaypoints: CursorWaypoint[] = [
          { ...innerToAbs(900, 880), at: 0 },
          { ...innerToAbs(modalLeft + 320, modalTop + 215), at: 100 }, // hover subject
          { ...innerToAbs(modalLeft + 320, modalTop + 215), at: 108, click: true },
          { ...innerToAbs(modalLeft + 320, modalTop + 215), at: 135 },
          { ...innerToAbs(modalLeft + 350, modalTop + 320), at: 148 }, // hover textarea
          { ...innerToAbs(modalLeft + 350, modalTop + 320), at: 155, click: true },
          { ...innerToAbs(modalLeft + 350, modalTop + 320), at: 180 },
          { ...innerToAbs(modalLeft + 560, modalTop + 510), at: 198 }, // Send button
          { ...innerToAbs(modalLeft + 560, modalTop + 510), at: 205, click: true },
          { ...innerToAbs(modalLeft + 560, modalTop + 510), at: 217 },
        ];

        return (
          <>
            {/* DIMMED BACKDROP — TopNav + Sidebar + faded "My Secure Messages" view */}
            <div style={{ position: "absolute", inset: 0, opacity: backdropP }}>
              {/* TopNav */}
              <div style={{ position: "absolute", left: 0, top: 0, width: "100%", opacity: 0.4 }}>
                <TopNav userName="Jordan Mills" patientId="6842" />
              </div>

              {/* Sidebar */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 64,
                  width: 220,
                  bottom: 0,
                  opacity: 0.4,
                }}
              >
                <Sidebar
                  items={[
                    { label: "Dashboard" },
                    { label: "My Appointments" },
                    { label: "My Messages", active: true, badge: 1 },
                    { label: "My Documents" },
                    { label: "My Forms" },
                    { label: "My Account" },
                  ]}
                />
              </div>

              {/* Faded heading from previous scene */}
              <div
                style={{
                  position: "absolute",
                  left: 220 + 56,
                  top: 64 + 64,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 76,
                  lineHeight: 0.95,
                  letterSpacing: "-0.02em",
                  color: C.ink,
                  opacity: 0.25,
                }}
              >
                My Secure Messages
              </div>
            </div>

            {/* Dark scrim over content */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(30, 41, 30, 0.42)",
                opacity: scrimP,
              }}
            />

            {/* TOP BANNER — "Don't have a Quest nearby?" */}
            <div
              style={{
                position: "absolute",
                left: (1760 - 720) / 2,
                top: 90,
                width: 720,
                background: C.darkOlive,
                borderRadius: 18,
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                boxShadow: C.shadow,
                opacity: bannerP,
                transform: `translateY(${interpolate(bannerP, [0, 1], [-80, 0])}px)`,
              }}
            >
              {/* Pin icon */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(122,139,94,0.28)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21s-7-7.5-7-12a7 7 0 1114 0c0 4.5-7 12-7 12z"
                    stroke={C.sage}
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="9" r="2.5" stroke={C.sage} strokeWidth="1.8" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 14,
                    color: C.invertedInk,
                    fontWeight: 600,
                    lineHeight: 1.35,
                  }}
                >
                  Don't have a Quest nearby? We've got you covered.
                </div>
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 12,
                    color: "rgba(244,239,226,0.65)",
                    marginTop: 2,
                  }}
                >
                  Tell us your situation and we'll find an alternative draw site.
                </div>
              </div>
            </div>

            {/* CENTERED MODAL */}
            <div
              style={{
                position: "absolute",
                left: modalLeft,
                top: modalTop,
                width: modalW,
                minHeight: modalH,
                background: C.card,
                borderRadius: 28,
                boxShadow: C.shadow,
                padding: "32px 38px 28px",
                opacity: modalP,
                transform: `translateY(${interpolate(modalP, [0, 1], [180, 0])}px) scale(${interpolate(
                  modalP,
                  [0, 1],
                  [0.92, 1],
                )})`,
                transformOrigin: "50% 100%",
              }}
            >
              {/* Top row: SECURE label + close button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 11,
                    color: C.muted,
                    letterSpacing: "0.18em",
                    fontWeight: 500,
                  }}
                >
                  SECURE · ENCRYPTED
                </span>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    background: C.cardSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.muted,
                    fontSize: 16,
                    fontFamily: FONT_UI,
                  }}
                >
                  ×
                </div>
              </div>

              {/* Modal heading */}
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 56,
                  lineHeight: 1.0,
                  letterSpacing: "-0.02em",
                  color: C.ink,
                  marginTop: 14,
                  opacity: modalHeadingP,
                  transform: `translateY(${interpolate(modalHeadingP, [0, 1], [10, 0])}px)`,
                }}
              >
                New message
              </div>

              {/* TO row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  marginTop: 28,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${C.divider}`,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 11,
                    color: C.muted,
                    letterSpacing: "0.16em",
                    fontWeight: 500,
                    width: 64,
                  }}
                >
                  TO
                </span>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 12px 5px 6px",
                    background: C.sage,
                    borderRadius: 999,
                    fontFamily: FONT_UI,
                    fontSize: 13,
                    color: C.invertedInk,
                    fontWeight: 500,
                    opacity: toP,
                    transform: `scale(${interpolate(toP, [0, 1], [0.6, 1])})`,
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      background: C.sageDeep,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: C.lime,
                    }}
                  >
                    CT
                  </span>
                  Care Team
                </div>
              </div>

              {/* SUBJECT row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  paddingTop: 16,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${C.divider}`,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 11,
                    color: C.muted,
                    letterSpacing: "0.16em",
                    fontWeight: 500,
                    width: 64,
                  }}
                >
                  SUBJECT
                </span>
                <div
                  style={{
                    flex: 1,
                    fontFamily: FONT_UI,
                    fontSize: 15,
                    color: C.ink,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    boxShadow:
                      subjectFocusP > 0.3
                        ? `inset 0 -2px 0 ${C.sage}`
                        : `inset 0 -1px 0 ${C.divider}`,
                  }}
                >
                  <Typewriter
                    text={subjectText}
                    frame={frame}
                    startFrame={subjectStart}
                    charsPerFrame={0.7}
                  />
                </div>
              </div>

              {/* TEXTAREA */}
              <div
                style={{
                  marginTop: 18,
                  minHeight: 130,
                  background: C.cardSoft,
                  borderRadius: RADIUS.input,
                  padding: "14px 16px",
                  fontFamily: FONT_UI,
                  fontSize: 14,
                  color: C.ink,
                  lineHeight: 1.55,
                  boxShadow:
                    bodyFocusP > 0.3 ? `inset 0 0 0 2px ${C.sage}` : `inset 0 0 0 1px ${C.divider}`,
                }}
              >
                {frame < bodyStart ? (
                  <span style={{ color: C.muted }}>
                    Describe your location and situation — we'll suggest a Labcorp or
                    mobile-phlebotomy option if there's no Quest nearby.
                  </span>
                ) : (
                  <Typewriter
                    text={bodyText}
                    frame={frame}
                    startFrame={bodyStart}
                    charsPerFrame={0.85}
                  />
                )}
              </div>

              {/* Helper row: Attach + Auto-saved */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: FONT_UI,
                    fontSize: 12,
                    color: C.muted,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M16 12V6a4 4 0 10-8 0v10a2.5 2.5 0 005 0V8"
                      stroke={C.muted}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  Attach file
                </div>
                <span style={{ fontFamily: FONT_UI, fontSize: 12, color: C.muted }}>
                  Auto-saved a moment ago
                </span>
              </div>

              {/* Bottom action row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 22,
                  paddingTop: 20,
                  borderTop: `1px solid ${C.divider}`,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 13,
                    color: C.body,
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: FONT_UI,
                      fontSize: 12,
                      color: C.sage,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="11" width="16" height="10" rx="2" stroke={C.sage} strokeWidth="1.8" />
                      <path d="M8 11V7a4 4 0 018 0v4" stroke={C.sage} strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    Encrypted in transit
                  </div>
                  <div
                    style={{
                      transform: `scale(${1 + sendHoverP * 0.05})`,
                      boxShadow:
                        sendHoverP > 0.5
                          ? `0 0 0 4px rgba(200,255,140,0.4)`
                          : "none",
                      borderRadius: 999,
                    }}
                  >
                    <PillButton variant="lime" size="md" label="Send message" showArrow />
                  </div>
                </div>
              </div>
            </div>

            <Cursor frame={frame} waypoints={cursorWaypoints} />
          </>
        );
      }}
    </SceneShell>
  );
};
