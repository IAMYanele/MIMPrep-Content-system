import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../ui/tokens";
import { SceneShell, innerToAbs } from "../ui/SceneShell";
import { PillButton } from "../ui/PillButton";
import { Cursor, CursorWaypoint } from "../ui/Cursor";
import { TopNav } from "../ui/TopNav";
import { Sidebar } from "../ui/Sidebar";
import { SLINGSHOT, SNAPPY, SOFT, EASE_OUT } from "../animation/springs";

type Props = { durationInFrames: number };

export const Scene04Dashboard: React.FC<Props> = ({ durationInFrames }) => {
  const { fps } = useVideoConfig();

  return (
    <SceneShell
      url="app.portal.health/portal"
      tabTitle="Dashboard — Patient Portal"
      durationInFrames={durationInFrames}
    >
      {(frame) => {
        // Beats
        const topNavP = interpolate(frame, [12, 30], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const sidebarP = spring({ frame: frame - 18, fps, config: SNAPPY });
        const heroP = spring({ frame: frame - 24, fps, config: SLINGSHOT });
        const headlineP = interpolate(frame, [36, 60], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const ctaP = spring({ frame: frame - 50, fps, config: SNAPPY });
        // Quick Links and Today panel come in EARLIER — v2 only gives this
        // scene 108 frames total, so the right-side panels needed to land by
        // mid-scene at the latest. quickP shifted 80 → 25, todayP 95 → 42.
        const apptCardP = spring({ frame: frame - 40, fps, config: SLINGSHOT });
        const msgsCardP = spring({ frame: frame - 45, fps, config: SLINGSHOT });
        const healthP = spring({ frame: frame - 55, fps, config: SOFT });
        const quickP = spring({ frame: frame - 25, fps, config: SLINGSHOT });
        const todayP = spring({ frame: frame - 42, fps, config: SOFT });

        // Pulse on the highlighted quick-link "My Account Information" when cursor hovers (~55+)
        const pulsePhase = Math.max(0, frame - 55);
        const pulse = (Math.sin(pulsePhase / 6) + 1) / 2; // 0..1
        const pulseGlow = interpolate(pulse, [0, 1], [0.18, 0.5]);

        // Layout constants — inner area is 1760 × 876
        const SIDEBAR_W = 220;

        // Cursor waypoints — fly straight to the Quick Links highlight much
        // earlier so it lands during the v2 scene's short 4.3s window.
        const cursorWaypoints: CursorWaypoint[] = [
          { ...innerToAbs(-60, 960), at: 0 },
          { ...innerToAbs(700, 240), at: 22 }, // brief hero glance
          { ...innerToAbs(1620, 220), at: 55 }, // → My Account Information
          { ...innerToAbs(1620, 220), at: 140 },
        ];

        return (
          <>
            {/* Portal shell — TopNav + Sidebar + content */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* TopNav */}
              <div style={{ opacity: topNavP, flexShrink: 0 }}>
                <TopNav userName="Jordan Mills" patientId="6842" />
              </div>

              {/* Below row: sidebar + content */}
              <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                {/* Sidebar — slides in from left */}
                <div
                  style={{
                    transform: `translateX(${interpolate(sidebarP, [0, 1], [-SIDEBAR_W, 0])}px)`,
                    opacity: sidebarP,
                    flexShrink: 0,
                  }}
                >
                  <Sidebar
                    items={[
                      { label: "Dashboard", active: true },
                      { label: "My Appointments" },
                      { label: "My Messages", badge: 1 },
                      { label: "My Documents" },
                      { label: "My Forms" },
                      { label: "My Account" },
                    ]}
                  />
                </div>

                {/* Content area */}
                <div
                  style={{
                    flex: 1,
                    background: C.page,
                    position: "relative",
                    padding: "32px 32px 32px 32px",
                  }}
                >
                  {/* HERO CARD */}
                  <div
                    style={{
                      width: 1080,
                      height: 260,
                      background: C.darkOlive,
                      borderRadius: 28,
                      padding: "36px 40px",
                      color: C.invertedInk,
                      position: "relative",
                      overflow: "hidden",
                      opacity: heroP,
                      transform: `translateY(${interpolate(heroP, [0, 1], [60, 0])}px)`,
                      boxShadow: C.shadow,
                    }}
                  >
                    {/* Sage leaf flourishes top-right */}
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 120 120"
                      style={{ position: "absolute", top: -10, right: -10, opacity: 0.5 }}
                    >
                      <path
                        d="M30 70 C 20 50, 35 25, 70 22 C 80 50, 65 78, 30 70 Z"
                        fill={C.sage}
                        opacity={0.35}
                      />
                      <path
                        d="M50 90 C 38 70, 55 45, 90 42 C 100 70, 85 100, 50 90 Z"
                        fill={C.sage}
                        opacity={0.22}
                      />
                    </svg>

                    {/* Label */}
                    <div
                      style={{
                        fontFamily: FONT_UI,
                        fontSize: 11,
                        letterSpacing: "0.16em",
                        color: "rgba(244,239,226,0.55)",
                        fontWeight: 500,
                      }}
                    >
                      WELCOME
                    </div>

                    {/* Heading row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 32,
                        marginTop: 14,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: FONT_DISPLAY,
                            fontSize: 68,
                            lineHeight: 0.98,
                            letterSpacing: "-0.015em",
                            color: C.invertedInk,
                            opacity: headlineP,
                            transform: `translateY(${interpolate(headlineP, [0, 1], [10, 0])}px)`,
                          }}
                        >
                          Hello, Jordan.
                        </div>
                        <div
                          style={{
                            fontFamily: FONT_UI,
                            fontSize: 15,
                            color: "rgba(244,239,226,0.72)",
                            lineHeight: 1.45,
                            marginTop: 16,
                            maxWidth: 520,
                            opacity: headlineP,
                          }}
                        >
                          Your journey to optimal health starts here. Complete your account to unlock care.
                        </div>
                      </div>

                      {/* Right column — 40% + CTA */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 14,
                          minWidth: 240,
                          opacity: ctaP,
                          transform: `scale(${interpolate(ctaP, [0, 1], [0.85, 1])})`,
                          transformOrigin: "100% 50%",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                          <div
                            style={{
                              fontFamily: FONT_DISPLAY,
                              fontSize: 56,
                              lineHeight: 1.0,
                              color: C.lime,
                            }}
                          >
                            40%
                          </div>
                          <div
                            style={{
                              fontFamily: FONT_UI,
                              fontSize: 12,
                              color: "rgba(244,239,226,0.65)",
                              textAlign: "right",
                              lineHeight: 1.3,
                            }}
                          >
                            Account setup
                            <br />2 of 5 complete
                          </div>
                        </div>
                        <PillButton variant="lime" size="md" label="Complete setup" />
                      </div>
                    </div>
                  </div>

                  {/* Row of 2 summary cards */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                      marginTop: 18,
                      width: 1080,
                    }}
                  >
                    {/* Upcoming appointments */}
                    <div
                      style={{
                        background: C.card,
                        borderRadius: 24,
                        padding: "22px 26px",
                        border: `1px solid ${C.cardBorder}`,
                        boxShadow: C.shadowSoft,
                        opacity: apptCardP,
                        transform: `translateY(${interpolate(apptCardP, [0, 1], [40, 0])}px)`,
                        minHeight: 200,
                      }}
                    >
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
                            letterSpacing: "0.16em",
                            fontWeight: 500,
                          }}
                        >
                          UPCOMING APPOINTMENTS
                        </span>
                        <span style={{ fontFamily: FONT_UI, fontSize: 12, color: C.muted }}>
                          View all
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 14, marginTop: 22, alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: C.cardSoft,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <rect
                              x="3"
                              y="5"
                              width="18"
                              height="16"
                              rx="2"
                              stroke={C.sage}
                              strokeWidth="1.6"
                            />
                            <path
                              d="M3 9h18M8 3v4M16 3v4"
                              stroke={C.sage}
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: FONT_UI, fontSize: 15, color: C.ink, fontWeight: 500 }}>
                            No appointments yet
                          </div>
                          <div
                            style={{
                              fontFamily: FONT_UI,
                              fontSize: 13,
                              color: C.muted,
                              marginTop: 4,
                              lineHeight: 1.4,
                            }}
                          >
                            Book your initial consultation to get started.
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 22 }}>
                        <PillButton variant="white" size="sm" label="Schedule consultation" />
                      </div>
                    </div>

                    {/* Recent messages */}
                    <div
                      style={{
                        background: C.card,
                        borderRadius: 24,
                        padding: "22px 26px",
                        border: `1px solid ${C.cardBorder}`,
                        boxShadow: C.shadowSoft,
                        opacity: msgsCardP,
                        transform: `translateY(${interpolate(msgsCardP, [0, 1], [40, 0])}px)`,
                        minHeight: 200,
                      }}
                    >
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
                            letterSpacing: "0.16em",
                            fontWeight: 500,
                          }}
                        >
                          RECENT MESSAGES
                        </span>
                        <span
                          style={{
                            background: C.lime,
                            color: C.ink,
                            fontFamily: FONT_UI,
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 999,
                            letterSpacing: "0.08em",
                          }}
                        >
                          1 NEW
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 14, marginTop: 20, alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            background: C.sageDeep,
                            color: C.invertedInk,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: FONT_UI,
                            fontSize: 12,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          CT
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "baseline",
                            }}
                          >
                            <span style={{ fontFamily: FONT_UI, fontSize: 14, color: C.ink, fontWeight: 500 }}>
                              Care Team
                            </span>
                            <span style={{ fontFamily: FONT_UI, fontSize: 11, color: C.muted }}>Today</span>
                          </div>
                          <div style={{ fontFamily: FONT_UI, fontSize: 14, color: C.ink, marginTop: 2 }}>
                            Your lab order is ready
                          </div>
                          <div
                            style={{
                              fontFamily: FONT_UI,
                              fontSize: 12,
                              color: C.muted,
                              marginTop: 6,
                              lineHeight: 1.45,
                            }}
                          >
                            Hi Jordan — your initial bloodwork order has been submitted. Here's how to book your draw…
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Health Records card — full width */}
                  <div
                    style={{
                      width: 1080,
                      marginTop: 16,
                      background: C.card,
                      borderRadius: 24,
                      padding: "20px 26px",
                      border: `1px solid ${C.cardBorder}`,
                      boxShadow: C.shadowSoft,
                      opacity: healthP,
                      transform: `translateY(${interpolate(healthP, [0, 1], [24, 0])}px)`,
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: C.cardSoft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 18l5-7 4 4 5-7 4 5"
                          stroke={C.sage}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 11,
                          color: C.muted,
                          letterSpacing: "0.16em",
                          fontWeight: 500,
                        }}
                      >
                        HEALTH RECORDS
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 26,
                          color: C.ink,
                          marginTop: 4,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Waiting your first labs
                      </div>
                    </div>
                    <div style={{ fontFamily: FONT_UI, fontSize: 12, color: C.muted }}>
                      Last updated —
                    </div>
                  </div>

                  {/* RIGHT SIDEBAR PANEL — Quick links */}
                  <div
                    style={{
                      position: "absolute",
                      right: 32,
                      top: 32,
                      width: 240,
                      opacity: quickP,
                      transform: `translateX(${interpolate(quickP, [0, 1], [40, 0])}px)`,
                    }}
                  >
                    <div
                      style={{
                        background: C.card,
                        borderRadius: 24,
                        padding: "20px 18px",
                        border: `1px solid ${C.cardBorder}`,
                        boxShadow: C.shadowSoft,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 11,
                          color: C.muted,
                          letterSpacing: "0.16em",
                          fontWeight: 500,
                        }}
                      >
                        QUICK LINKS
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 28,
                          color: C.ink,
                          marginTop: 4,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Get started
                      </div>

                      <div style={{ marginTop: 14, display: "flex", flexDirection: "column" }}>
                        <QuickLinkRow
                          label="My Account Information"
                          highlighted
                          pulseGlow={pulseGlow}
                          showPulse={frame >= 115}
                        />
                        <QuickLinkRow label="My Forms & Consents" />
                        <QuickLinkRow label="My Appointments" />
                        <QuickLinkRow label="My Documents" />
                        <QuickLinkRow label="My Secure Messages" />
                        <QuickLinkRow label="Meet Our Providers" />
                      </div>
                    </div>

                    {/* TODAY'S VISIT card */}
                    <div
                      style={{
                        marginTop: 14,
                        background: C.darkOlive,
                        color: C.invertedInk,
                        borderRadius: 24,
                        padding: "18px 18px",
                        opacity: todayP,
                        transform: `translateY(${interpolate(todayP, [0, 1], [20, 0])}px)`,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 10,
                          color: "rgba(244,239,226,0.55)",
                          letterSpacing: "0.16em",
                          fontWeight: 500,
                        }}
                      >
                        TODAY'S VISIT
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 26,
                          color: C.invertedInk,
                          marginTop: 4,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        None scheduled
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 12,
                          color: "rgba(244,239,226,0.65)",
                          marginTop: 8,
                          lineHeight: 1.45,
                        }}
                      >
                        Once you book a consult, you'll see your join link here.
                      </div>
                    </div>
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

// --- Helpers ---

const QuickLinkRow: React.FC<{
  label: string;
  highlighted?: boolean;
  pulseGlow?: number;
  showPulse?: boolean;
}> = ({ label, highlighted, pulseGlow = 0, showPulse }) => {
  const bg = highlighted ? C.limeSoft : "transparent";
  const borderLeft = highlighted ? `3px solid ${C.lime}` : "3px solid transparent";
  const color = highlighted ? C.ink : C.body;
  const fontWeight = highlighted ? 500 : 400;
  const boxShadow =
    highlighted && showPulse
      ? `0 0 0 ${2 + pulseGlow * 6}px rgba(200,255,140,${pulseGlow * 0.45})`
      : "none";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        borderLeft,
        background: bg,
        color,
        fontFamily: FONT_UI,
        fontSize: 13,
        fontWeight,
        borderRadius: highlighted ? 8 : 0,
        marginLeft: -12,
        marginRight: -12,
        boxShadow,
      }}
    >
      <span>{label}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 17L17 7M17 7H8M17 7V16"
          stroke={highlighted ? C.ink : C.muted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
