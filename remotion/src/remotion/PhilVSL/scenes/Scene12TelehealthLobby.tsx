import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../ui/tokens";
import { SceneShell, innerToAbs } from "../ui/SceneShell";
import { PillButton } from "../ui/PillButton";
import { Cursor, CursorWaypoint } from "../ui/Cursor";
import { Logo } from "../ui/Logo";
import { SLINGSHOT, SNAPPY, SOFT, EASE_OUT } from "../animation/springs";

type Props = { durationInFrames: number };

export const Scene12TelehealthLobby: React.FC<Props> = ({ durationInFrames }) => {
  const { fps } = useVideoConfig();

  return (
    <SceneShell
      url="app.portal.health/telehealth"
      tabTitle="Telehealth Visit"
      durationInFrames={durationInFrames}
    >
      {(frame) => {
        // LEFT panel beats
        const leftTopP = interpolate(frame, [14, 35], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const apptCardP = spring({ frame: frame - 18, fps, config: SLINGSHOT });
        const badgeP = spring({ frame: frame - 32, fps, config: SLINGSHOT });

        // Word-by-word heading reveal — words at 38, 50, 62, 74
        const word1P = interpolate(frame, [38, 52], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const word2P = interpolate(frame, [44, 58], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const word3P = interpolate(frame, [50, 64], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const word4P = interpolate(frame, [56, 70], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        const activityCardP = spring({ frame: frame - 50, fps, config: SNAPPY });
        const messagesCardP = spring({ frame: frame - 58, fps, config: SNAPPY });

        // Cursor hovers join button ~115, click ~130
        const joinHoverP = spring({ frame: frame - 110, fps, config: SNAPPY });

        // Transition: 140-210 — left dims/slides left, right slides in
        const transitionP = interpolate(frame, [140, 210], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        // Left dims to 35% opacity and shifts left by 40
        const leftDim = interpolate(transitionP, [0, 1], [1, 0.35]);
        const leftShift = interpolate(transitionP, [0, 1], [0, -40]);
        // Right panel slides in from right
        const rightSlideP = interpolate(frame, [140, 210], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        // Camera preview
        const cameraCardP = spring({ frame: frame - 210, fps, config: SLINGSHOT });

        // Controls stagger
        const ctrl1P = spring({ frame: frame - 250, fps, config: SNAPPY });
        const ctrl2P = spring({ frame: frame - 256, fps, config: SNAPPY });
        const ctrl3P = spring({ frame: frame - 262, fps, config: SNAPPY });
        // Mic toggles on at frame 280
        const micOnP = interpolate(frame, [280, 295], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        const providerInfoP = spring({ frame: frame - 290, fps, config: SOFT });

        // Enter consultation button hover ~360, click ~380
        const enterHoverP = spring({ frame: frame - 355, fps, config: SNAPPY });

        // Connecting indicator
        const connectingP = interpolate(frame, [380, 420], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        // REC timer
        const recElapsed = Math.max(0, Math.floor((frame - 210) / fps));
        const recMin = Math.floor(recElapsed / 60);
        const recSec = recElapsed % 60;
        const recLabel = `${String(recMin).padStart(2, "0")}:${String(recSec).padStart(2, "0")}`;
        const recDotPulse = (Math.sin(frame / 6) + 1) / 2;

        // Inner area = 1760 × 876. Split into two 880px halves.
        const HALF_W = 880;

        const cursorWaypoints: CursorWaypoint[] = [
          { ...innerToAbs(-60, 960), at: 0 },
          { ...innerToAbs(180, 330), at: 115 }, // hover Join Telehealth Visit
          { ...innerToAbs(180, 330), at: 130, click: true },
          { ...innerToAbs(180, 330), at: 145 },
          { ...innerToAbs(1280, 560), at: 360 }, // hover Enter Consultation
          { ...innerToAbs(1280, 560), at: 380, click: true },
          { ...innerToAbs(1280, 560), at: 437 },
        ];

        return (
          <>
            {/* LEFT PANEL — Portal dashboard view */}
            <div
              style={{
                position: "absolute",
                left: innerToAbs(0, 0).x,
                top: innerToAbs(0, 0).y,
                width: HALF_W,
                height: 876,
                background: C.page,
                opacity: leftDim,
                transform: `translateX(${leftShift}px)`,
                overflow: "hidden",
              }}
            >
              {/* Narrow TopNav */}
              <div
                style={{
                  height: 60,
                  background: C.darkOlive,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 22,
                  paddingRight: 22,
                  color: C.invertedInk,
                  fontFamily: FONT_UI,
                  opacity: leftTopP,
                }}
              >
                <Logo size={20} color={C.invertedInk} />
                <div style={{ flex: 1 }} />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3a6 6 0 016 6v4l1.5 3H4.5L6 13V9a6 6 0 016-6zm0 18a2.5 2.5 0 002.5-2.5h-5A2.5 2.5 0 0012 21z"
                    stroke="rgba(244,239,226,0.8)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 14 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: C.sageDeep,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: C.invertedInk,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    JM
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>Jordan Mills</div>
                    <div style={{ fontSize: 10, color: "rgba(244,239,226,0.55)" }}>Today is Oct 24</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: 28 }}>
                {/* Big appointment card — gradient */}
                <div
                  style={{
                    width: "100%",
                    background: `linear-gradient(135deg, ${C.darkOlive} 0%, ${C.sageDeep} 100%)`,
                    borderRadius: 28,
                    padding: "26px 28px",
                    color: C.invertedInk,
                    position: "relative",
                    overflow: "hidden",
                    opacity: apptCardP,
                    transform: `translateY(${interpolate(apptCardP, [0, 1], [60, 0])}px)`,
                    boxShadow: C.shadow,
                    minHeight: 240,
                  }}
                >
                  {/* Sage leaf shapes bottom-right */}
                  <svg
                    width="160"
                    height="160"
                    viewBox="0 0 160 160"
                    style={{ position: "absolute", bottom: -20, right: -20, opacity: 0.45 }}
                  >
                    <path
                      d="M40 100 C 28 70, 50 32, 100 30 C 110 70, 90 110, 40 100 Z"
                      fill={C.sage}
                      opacity={0.5}
                    />
                    <path
                      d="M60 120 C 45 95, 70 60, 120 55 C 130 90, 110 130, 60 120 Z"
                      fill={C.sage}
                      opacity={0.3}
                    />
                  </svg>

                  {/* STARTS IN badge */}
                  <div
                    style={{
                      display: "inline-flex",
                      padding: "4px 10px",
                      background: C.lime,
                      color: C.ink,
                      borderRadius: 999,
                      fontFamily: FONT_UI,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      opacity: badgeP,
                      transform: `scale(${interpolate(badgeP, [0, 1], [0, 1])})`,
                    }}
                  >
                    STARTS IN 15 MINUTES
                  </div>

                  {/* Heading word-by-word */}
                  <div
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 44,
                      lineHeight: 0.98,
                      letterSpacing: "-0.015em",
                      color: C.invertedInk,
                      marginTop: 16,
                    }}
                  >
                    <span style={{ opacity: word1P, display: "inline-block" }}>Your</span>{" "}
                    <span style={{ opacity: word2P, display: "inline-block" }}>appointment</span>{" "}
                    <br />
                    <span style={{ opacity: word3P, display: "inline-block" }}>is</span>{" "}
                    <span style={{ opacity: word4P, display: "inline-block" }}>today.</span>
                  </div>

                  {/* Info row */}
                  <div
                    style={{
                      display: "flex",
                      gap: 22,
                      marginTop: 18,
                      opacity: word4P,
                    }}
                  >
                    <InfoCol label="PROVIDER" value="Dr. Sarah Mitchell" />
                    <InfoCol label="TYPE" value="Initial Consult · 45 min" />
                    <InfoCol label="TIME" value="10:00 AM EST" />
                  </div>

                  {/* Join Telehealth Visit pill */}
                  <div
                    style={{
                      marginTop: 22,
                      opacity: word4P,
                      transform: `scale(${1 + joinHoverP * 0.04})`,
                      display: "inline-block",
                      boxShadow:
                        joinHoverP > 0.5
                          ? `0 0 0 6px rgba(200,255,140,0.35)`
                          : "none",
                      borderRadius: 999,
                    }}
                  >
                    <PillButton
                      variant="lime"
                      size="md"
                      label="Join Telehealth Visit"
                      showCamera
                      showArrow={false}
                    />
                  </div>
                </div>

                {/* Two mini cards row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    marginTop: 14,
                  }}
                >
                  <MiniCard
                    label="ACTIVITY"
                    title="Lab results coming Oct 24"
                    progress={activityCardP}
                  />
                  <MiniCard
                    label="MESSAGES"
                    title="2 new this week"
                    progress={messagesCardP}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT PANEL — Telehealth lobby (dark olive) */}
            <div
              style={{
                position: "absolute",
                left: innerToAbs(HALF_W, 0).x,
                top: innerToAbs(0, 0).y,
                width: HALF_W,
                height: 876,
                background: C.navy,
                overflow: "hidden",
                opacity: rightSlideP,
                transform: `translateX(${interpolate(rightSlideP, [0, 1], [HALF_W, 0])}px)`,
              }}
            >
              {/* Top bar — small */}
              <div
                style={{
                  height: 60,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 22,
                  paddingRight: 22,
                  color: C.invertedInk,
                  fontFamily: FONT_UI,
                  borderBottom: `1px solid rgba(244,239,226,0.08)`,
                }}
              >
                <Logo size={20} color={C.invertedInk} />
                <div style={{ flex: 1 }} />
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 12,
                    color: C.lime,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Pre-call setup
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 17L17 7M17 7H8M17 7V16"
                      stroke={C.lime}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Inner content */}
              <div
                style={{
                  padding: "32px 28px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Camera preview card */}
                <div
                  style={{
                    width: 580,
                    height: 340,
                    background: "#0F1610",
                    borderRadius: 24,
                    border: `1px solid rgba(244,239,226,0.12)`,
                    position: "relative",
                    overflow: "hidden",
                    opacity: cameraCardP,
                    transform: `scale(${interpolate(cameraCardP, [0, 1], [0.85, 1])})`,
                    boxShadow: enterHoverP > 0.5
                      ? `0 0 0 4px rgba(200,255,140,0.35), 0 12px 36px -10px rgba(0,0,0,0.5)`
                      : `0 12px 36px -10px rgba(0,0,0,0.5)`,
                  }}
                >
                  {/* Diagonal stripe pattern */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `repeating-linear-gradient(45deg, rgba(122,139,94,0.06), rgba(122,139,94,0.06) 18px, rgba(122,139,94,0.02) 18px, rgba(122,139,94,0.02) 36px)`,
                    }}
                  />

                  {/* PATIENT label top-left */}
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 16,
                      fontFamily: FONT_UI,
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      color: "rgba(244,239,226,0.55)",
                      fontWeight: 500,
                    }}
                  >
                    PATIENT · JORDAN MILLS
                  </div>

                  {/* REC indicator top-right */}
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 16,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: FONT_UI,
                      fontSize: 11,
                      color: C.invertedInk,
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: C.redDot,
                        opacity: 0.5 + recDotPulse * 0.5,
                      }}
                    />
                    REC {recLabel}
                  </div>

                  {/* Centered camera-off icon */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="2"
                        y="6"
                        width="14"
                        height="12"
                        rx="2"
                        stroke="rgba(244,239,226,0.4)"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M16 10l5-3v10l-5-3z"
                        stroke="rgba(244,239,226,0.4)"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <path
                        d="M3 3l18 18"
                        stroke="rgba(244,239,226,0.6)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div
                      style={{
                        fontFamily: FONT_UI,
                        fontSize: 11,
                        color: "rgba(244,239,226,0.4)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Camera off
                    </div>
                  </div>

                  {/* Bottom-right small audio bars */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 14,
                      right: 16,
                      display: "flex",
                      gap: 3,
                      alignItems: "flex-end",
                    }}
                  >
                    {[8, 14, 20, 12, 16].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          width: 3,
                          height: h,
                          background: micOnP > 0.5 ? C.lime : "rgba(244,239,226,0.3)",
                          borderRadius: 1.5,
                        }}
                      />
                    ))}
                  </div>

                  {/* Success ring when entering */}
                  {connectingP > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 24,
                        border: `2px solid ${C.lime}`,
                        opacity: connectingP * 0.7,
                        transform: `scale(${1 + connectingP * 0.02})`,
                      }}
                    />
                  )}
                </div>

                {/* Controls row */}
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    marginTop: 24,
                  }}
                >
                  <ControlButton progress={ctrl1P} on={micOnP > 0.5}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="9"
                        y="3"
                        width="6"
                        height="12"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M5 11a7 7 0 0014 0M12 18v3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </ControlButton>
                  <ControlButton progress={ctrl2P}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="2"
                        y="6"
                        width="14"
                        height="12"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M16 10l5-3v10l-5-3z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        fill="none"
                      />
                    </svg>
                  </ControlButton>
                  <ControlButton progress={ctrl3P}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                      <path
                        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </ControlButton>
                </div>

                {/* Provider info */}
                <div
                  style={{
                    marginTop: 32,
                    textAlign: "center",
                    opacity: providerInfoP,
                    transform: `translateY(${interpolate(providerInfoP, [0, 1], [10, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      color: "rgba(244,239,226,0.5)",
                      fontWeight: 500,
                    }}
                  >
                    YOU'RE MEETING WITH
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 22,
                      fontWeight: 600,
                      color: C.invertedInk,
                      marginTop: 6,
                    }}
                  >
                    Dr. Sarah Mitchell
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 13,
                      color: "rgba(244,239,226,0.55)",
                      marginTop: 4,
                    }}
                  >
                    Initial Consultation · 45 minutes
                  </div>
                </div>

                {/* Enter consultation pill */}
                <div
                  style={{
                    marginTop: 26,
                    opacity: providerInfoP,
                    transform: `scale(${1 + enterHoverP * 0.04})`,
                    boxShadow:
                      enterHoverP > 0.5
                        ? `0 0 0 8px rgba(200,255,140,0.4)`
                        : "none",
                    borderRadius: 999,
                  }}
                >
                  <PillButton variant="lime" size="md" label="Enter Consultation" />
                </div>

                {/* Connecting indicator */}
                {connectingP > 0 && (
                  <div
                    style={{
                      marginTop: 16,
                      fontFamily: FONT_UI,
                      fontSize: 12,
                      color: "rgba(244,239,226,0.7)",
                      opacity: connectingP,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: C.lime,
                        opacity: 0.5 + recDotPulse * 0.5,
                      }}
                    />
                    Connecting to your provider…
                  </div>
                )}
              </div>
            </div>

            <Cursor frame={frame} waypoints={cursorWaypoints} />
          </>
        );
      }}
    </SceneShell>
  );
};

// --- Helpers ---

const InfoCol: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div
      style={{
        fontFamily: FONT_UI,
        fontSize: 9,
        letterSpacing: "0.16em",
        color: "rgba(244,239,226,0.5)",
        fontWeight: 500,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: FONT_UI,
        fontSize: 13,
        color: C.invertedInk,
        marginTop: 3,
        fontWeight: 500,
      }}
    >
      {value}
    </div>
  </div>
);

const MiniCard: React.FC<{ label: string; title: string; progress: number }> = ({
  label,
  title,
  progress,
}) => {
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 18,
        padding: "16px 18px",
        border: `1px solid ${C.cardBorder}`,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 10,
          letterSpacing: "0.16em",
          color: C.muted,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 14,
          color: C.ink,
          marginTop: 6,
          fontWeight: 500,
        }}
      >
        {title}
      </div>
    </div>
  );
};

const ControlButton: React.FC<{
  progress: number;
  on?: boolean;
  children: React.ReactNode;
}> = ({ progress, on, children }) => {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 999,
        background: on ? "rgba(200,255,140,0.18)" : "rgba(122,139,94,0.2)",
        border: on
          ? `1.5px solid ${C.lime}`
          : `1.5px solid rgba(244,239,226,0.15)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: on ? C.lime : "rgba(244,239,226,0.85)",
        opacity: progress,
        transform: `scale(${interpolate(progress, [0, 1], [0.6, 1])})`,
      }}
    >
      {children}
    </div>
  );
};
