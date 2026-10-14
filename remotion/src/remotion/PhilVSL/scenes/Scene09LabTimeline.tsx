import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../ui/tokens";
import { SceneShell, innerToAbs } from "../ui/SceneShell";
import { Cursor, CursorWaypoint } from "../ui/Cursor";
import { TopNav } from "../ui/TopNav";
import { Sidebar } from "../ui/Sidebar";
import { SLINGSHOT, SNAPPY, SOFT, EASE_OUT } from "../animation/springs";

type Props = { durationInFrames: number };

type StepStatus = "complete" | "active" | "upcoming";

type LabStep = {
  step: string;
  label: string;
  status: StepStatus;
  meta: string;
  icon: React.ReactNode;
};

export const Scene09LabTimeline: React.FC<Props> = ({ durationInFrames }) => {
  const { fps } = useVideoConfig();

  return (
    <SceneShell
      url="app.portal.health/labs"
      tabTitle="Lab Results"
      durationInFrames={durationInFrames}
    >
      {(frame) => {
        const topNavP = spring({ frame: frame - 14, fps, config: SOFT });
        const sidebarP = spring({ frame: frame - 18, fps, config: SOFT });
        const orderLabelP = interpolate(frame, [20, 38], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const headlineLine1P = interpolate(frame, [26, 46], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const headlineLine2P = interpolate(frame, [34, 56], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const bodyP = interpolate(frame, [44, 64], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        const timelineCardP = spring({ frame: frame - 55, fps, config: SLINGSHOT });

        // Individual step animations
        const step1P = spring({ frame: frame - 95, fps, config: SLINGSHOT });
        const lineDraw1P = interpolate(frame, [115, 130], [100, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const step2P = spring({ frame: frame - 125, fps, config: SLINGSHOT });
        const step3P = interpolate(frame, [145, 170], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const step4P = interpolate(frame, [170, 195], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        const reassureP = spring({ frame: frame - 200, fps, config: SNAPPY });
        const detailsP = spring({ frame: frame - 230, fps, config: SLINGSHOT });

        // Continuous pulse on step 2 once it has appeared
        const step2Settled = frame >= 145;
        const pulse = step2Settled ? 1 + 0.06 * Math.sin((frame - 135) * 0.18) : 1;
        const glowAlpha = step2Settled
          ? 0.25 + 0.2 * (0.5 + 0.5 * Math.sin((frame - 135) * 0.18))
          : 0;

        // Cursor waypoints
        const cursorWaypoints: CursorWaypoint[] = [
          { ...innerToAbs(1620, 880), at: 0 },
          { ...innerToAbs(1620, 880), at: 240 },
          // Drift to step 2
          { ...innerToAbs(700, 580), at: 320 },
          { ...innerToAbs(700, 580), at: 360 },
          // Drift to reassurance card
          { ...innerToAbs(540, 780), at: 410 },
          { ...innerToAbs(540, 780), at: 460 },
        ];

        const stepIcons = {
          check: (
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12l5 5 9-11"
                stroke="#F4EFE2"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
          flask: (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 3h6M10 3v6L5 19a2 2 0 002 3h10a2 2 0 002-3l-5-10V3"
                stroke={C.ink}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
          doc: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 3h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
                stroke={C.muted}
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M15 3v6h6" stroke={C.muted} strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          ),
          chart: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 20h16M7 16V10M12 16V7M17 16V13"
                stroke={C.muted}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ),
        };

        const steps: LabStep[] = [
          {
            step: "STEP 1",
            label: "Blood Drawn",
            status: "complete",
            meta: "Quest · Boulder · Oct 18",
            icon: stepIcons.check,
          },
          {
            step: "STEP 2",
            label: "Processing at Lab",
            status: "active",
            meta: "3–8 business days · in progress",
            icon: stepIcons.flask,
          },
          {
            step: "STEP 3",
            label: "Results Received",
            status: "upcoming",
            meta: "Reviewed by care team · —",
            icon: stepIcons.doc,
          },
          {
            step: "STEP 4",
            label: "Posted to Your Chart",
            status: "upcoming",
            meta: "With provider notes · —",
            icon: stepIcons.chart,
          },
        ];

        // Helper for per-step opacity/scale
        const stepReveal = (i: number): { opacity: number; scale: number } => {
          if (i === 0)
            return {
              opacity: step1P,
              scale: interpolate(step1P, [0, 1], [0.3, 1]),
            };
          if (i === 1)
            return {
              opacity: step2P,
              scale: interpolate(step2P, [0, 1], [0.3, 1]) * pulse,
            };
          if (i === 2) return { opacity: step3P, scale: interpolate(step3P, [0, 1], [0.85, 1]) };
          return { opacity: step4P, scale: interpolate(step4P, [0, 1], [0.85, 1]) };
        };

        return (
          <>
            {/* TopNav */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                opacity: topNavP,
                transform: `translateY(${interpolate(topNavP, [0, 1], [-20, 0])}px)`,
              }}
            >
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
                opacity: sidebarP,
                transform: `translateX(${interpolate(sidebarP, [0, 1], [-30, 0])}px)`,
              }}
            >
              <Sidebar
                items={[
                  { label: "Dashboard" },
                  { label: "My Appointments" },
                  { label: "My Messages", badge: 1 },
                  { label: "My Documents", active: true },
                  { label: "My Forms" },
                  { label: "My Account" },
                ]}
              />
            </div>

            {/* CONTENT AREA */}
            <div
              style={{
                position: "absolute",
                left: 220,
                top: 64,
                right: 0,
                bottom: 0,
                background: C.page,
                overflow: "hidden",
              }}
            >
              {/* Lab order label */}
              <div
                style={{
                  position: "absolute",
                  left: 56,
                  top: 38,
                  fontFamily: FONT_UI,
                  fontSize: 11,
                  color: C.muted,
                  letterSpacing: "0.18em",
                  fontWeight: 500,
                  opacity: orderLabelP,
                }}
              >
                LAB ORDER · #LAB-44821
              </div>

              {/* Massive 2-line headline */}
              <div
                style={{
                  position: "absolute",
                  left: 56,
                  top: 66,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 96,
                  lineHeight: 0.95,
                  letterSpacing: "-0.022em",
                  color: C.ink,
                }}
              >
                <div
                  style={{
                    opacity: headlineLine1P,
                    transform: `translateY(${interpolate(headlineLine1P, [0, 1], [12, 0])}px)`,
                  }}
                >
                  Your bloodwork
                </div>
                <div
                  style={{
                    opacity: headlineLine2P,
                    transform: `translateY(${interpolate(headlineLine2P, [0, 1], [12, 0])}px)`,
                  }}
                >
                  is on its way.
                </div>
              </div>

              {/* Body copy */}
              <div
                style={{
                  position: "absolute",
                  left: 56,
                  top: 274,
                  width: 800,
                  fontFamily: FONT_UI,
                  fontSize: 17,
                  color: C.body,
                  lineHeight: 1.5,
                  opacity: bodyP,
                  transform: `translateY(${interpolate(bodyP, [0, 1], [8, 0])}px)`,
                }}
              >
                We'll notify you the moment results land. Typical turnaround is 3–8 business days
                from your draw.
              </div>

              {/* BIG TIMELINE CARD */}
              <div
                style={{
                  position: "absolute",
                  left: 56,
                  top: 336,
                  right: 56,
                  background: C.cardSoft,
                  borderRadius: 28,
                  border: `1px solid ${C.cardBorder}`,
                  boxShadow: C.shadowSoft,
                  padding: "48px 60px",
                  opacity: timelineCardP,
                  transform: `translateY(${interpolate(timelineCardP, [0, 1], [80, 0])}px)`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  {steps.map((s, i) => {
                    const { opacity, scale } = stepReveal(i);
                    const isComplete = s.status === "complete";
                    const isActive = s.status === "active";
                    const circleBg = isComplete
                      ? C.sageDeep
                      : isActive
                        ? C.lime
                        : "transparent";
                    const circleBorder =
                      s.status === "upcoming"
                        ? `2px solid ${C.dividerStrong}`
                        : "none";
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          width: 200,
                          flexShrink: 0,
                          opacity,
                          zIndex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: 88,
                            height: 88,
                            borderRadius: 999,
                            background: circleBg,
                            border: circleBorder,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            transform: `scale(${scale})`,
                            boxShadow: isActive
                              ? `0 0 0 8px rgba(200,255,140,${glowAlpha}), 0 0 0 16px rgba(200,255,140,${glowAlpha * 0.5})`
                              : "none",
                          }}
                        >
                          {s.icon}
                          {isComplete && (
                            <div
                              style={{
                                position: "absolute",
                                top: -4,
                                right: -4,
                                width: 26,
                                height: 26,
                                borderRadius: 999,
                                background: C.sage,
                                border: `2px solid ${C.cardSoft}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M5 12l5 5 9-11"
                                  stroke="#F4EFE2"
                                  strokeWidth="3.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            fontFamily: FONT_UI,
                            fontSize: 10,
                            color: C.muted,
                            letterSpacing: "0.18em",
                            fontWeight: 500,
                            marginTop: 22,
                          }}
                        >
                          {s.step}
                        </div>
                        <div
                          style={{
                            fontFamily: FONT_UI,
                            fontSize: 18,
                            color: C.ink,
                            fontWeight: 600,
                            marginTop: 6,
                            textAlign: "center",
                            lineHeight: 1.2,
                          }}
                        >
                          {s.label}
                        </div>
                        <div
                          style={{
                            fontFamily: FONT_UI,
                            fontSize: 12,
                            color: isActive ? C.sage : C.muted,
                            marginTop: 6,
                            textAlign: "center",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {s.meta}
                        </div>
                      </div>
                    );
                  })}

                  {/* Connecting lines layer — drawn behind the nodes */}
                  <svg
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 44,
                      width: "100%",
                      height: 4,
                      pointerEvents: "none",
                      zIndex: 0,
                    }}
                    preserveAspectRatio="none"
                    viewBox="0 0 100 4"
                  >
                    {/* Step 1 -> Step 2: solid sage, animated draw */}
                    <line
                      x1="14.5"
                      y1="2"
                      x2="38.5"
                      y2="2"
                      stroke={C.sage}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeDasharray="100"
                      strokeDashoffset={lineDraw1P}
                      pathLength={100}
                    />
                    {/* Step 2 -> Step 3: dashed gray */}
                    <line
                      x1="42"
                      y1="2"
                      x2="62"
                      y2="2"
                      stroke="rgba(30,41,30,0.18)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    {/* Step 3 -> Step 4: dashed gray */}
                    <line
                      x1="65.5"
                      y1="2"
                      x2="85"
                      y2="2"
                      stroke="rgba(30,41,30,0.18)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                </div>
              </div>

              {/* REASSURANCE CARD */}
              <div
                style={{
                  position: "absolute",
                  left: 56,
                  top: 710,
                  width: 1080,
                  background: C.card,
                  borderRadius: 18,
                  border: `1px solid ${C.cardBorder}`,
                  borderLeft: `4px solid ${C.sage}`,
                  boxShadow: C.shadowSoft,
                  padding: "22px 26px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 18,
                  opacity: reassureP,
                  transform: `translateY(${interpolate(reassureP, [0, 1], [30, 0])}px)`,
                }}
              >
                {/* Bell icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: C.limeSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3a6 6 0 016 6v4l1.5 3H4.5L6 13V9a6 6 0 016-6zm0 18a2.5 2.5 0 002.5-2.5h-5A2.5 2.5 0 0012 21z"
                      stroke={C.sageDeep}
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 18,
                      color: C.ink,
                      fontWeight: 600,
                    }}
                  >
                    No need to keep tabs on it — we've got it from here.
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 13,
                      color: C.body,
                      marginTop: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    You'll get a secure message and an email the moment results post to your
                    chart.
                  </div>
                </div>
              </div>

              {/* ORDER DETAILS — bottom right */}
              <div
                style={{
                  position: "absolute",
                  right: 56,
                  top: 710,
                  width: 360,
                  background: C.card,
                  borderRadius: 18,
                  border: `1px solid ${C.cardBorder}`,
                  boxShadow: C.shadowSoft,
                  padding: "20px 24px",
                  opacity: detailsP,
                  transform: `translateX(${interpolate(detailsP, [0, 1], [60, 0])}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 11,
                    color: C.muted,
                    letterSpacing: "0.18em",
                    fontWeight: 500,
                    marginBottom: 14,
                  }}
                >
                  ORDER DETAILS
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <DetailItem label="PANEL" value="Comprehensive" />
                  <DetailItem label="MARKERS" value="48 biomarkers" />
                  <DetailItem label="DRAWN" value="Oct 18 2026" />
                  <DetailItem label="EXPECTED" value="Oct 24–28" />
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

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div
      style={{
        fontFamily: FONT_UI,
        fontSize: 10,
        color: C.muted,
        letterSpacing: "0.16em",
        fontWeight: 500,
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: FONT_UI,
        fontSize: 13,
        color: C.ink,
        fontWeight: 500,
        marginTop: 3,
      }}
    >
      {value}
    </div>
  </div>
);
