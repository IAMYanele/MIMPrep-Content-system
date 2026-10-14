import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY, FONT_UI, RADIUS } from "../ui/tokens";
import { SceneShell, innerToAbs } from "../ui/SceneShell";
import { PillButton } from "../ui/PillButton";
import { Cursor, CursorWaypoint } from "../ui/Cursor";
import { TopNav } from "../ui/TopNav";
import { Sidebar } from "../ui/Sidebar";
import { Typewriter } from "../ui/Typewriter";
import { SLINGSHOT, SNAPPY, EASE_OUT } from "../animation/springs";

type Props = { durationInFrames: number };

export const Scene05MyAccount: React.FC<Props> = ({ durationInFrames }) => {
  const { fps } = useVideoConfig();

  return (
    <SceneShell
      url="app.portal.health/account"
      tabTitle="My Account"
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
        const headingP = interpolate(frame, [14, 35], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const card1P = spring({ frame: frame - 22, fps, config: SLINGSHOT });
        const card2P = spring({ frame: frame - 50, fps, config: SLINGSHOT });
        const card3P = spring({ frame: frame - 110, fps, config: SLINGSHOT });

        // Toggle "flip on" — early ~30-50f
        const emailToggle = interpolate(frame, [30, 50], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const smsToggle = interpolate(frame, [38, 60], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        // Card 3 lime glow pulse
        const glowPhase = Math.max(0, frame - 130);
        const glow = (Math.sin(glowPhase / 8) + 1) / 2;
        const glowAlpha = interpolate(glow, [0, 1], [0.2, 0.55]);

        // Drop zone pulse — scale 1→1.02→1 between 195–215
        const dropPulse =
          interpolate(frame, [195, 205, 215], [1, 1.02, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

        // "Take a photo" button hover
        const takePhotoHover = spring({ frame: frame - 255, fps, config: SNAPPY });

        const SIDEBAR_W = 220;

        // Cursor waypoints
        const cursorWaypoints: CursorWaypoint[] = [
          { ...innerToAbs(1700, 980), at: 0 },
          { ...innerToAbs(620, 360), at: 55 }, // hover full name field
          { ...innerToAbs(620, 360), at: 65, click: true },
          { ...innerToAbs(620, 360), at: 90 },
          { ...innerToAbs(1200, 360), at: 105 }, // jump to phone
          { ...innerToAbs(1200, 360), at: 115, click: true },
          { ...innerToAbs(1200, 360), at: 135 },
          { ...innerToAbs(1100, 660), at: 190 }, // glide to drop zone
          { ...innerToAbs(1100, 660), at: 240 },
          { ...innerToAbs(1100, 730), at: 268 }, // Take a photo button
          { ...innerToAbs(1100, 730), at: 275, click: true },
          { ...innerToAbs(1100, 730), at: 300 },
        ];

        return (
          <>
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

              {/* Row */}
              <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                {/* Sidebar */}
                <div
                  style={{
                    transform: `translateX(${interpolate(sidebarP, [0, 1], [-SIDEBAR_W, 0])}px)`,
                    opacity: sidebarP,
                    flexShrink: 0,
                  }}
                >
                  <Sidebar
                    items={[
                      { label: "Dashboard" },
                      { label: "My Appointments" },
                      { label: "My Messages", badge: 1 },
                      { label: "My Documents" },
                      { label: "My Forms" },
                      { label: "My Account", active: true },
                    ]}
                  />
                </div>

                {/* Content */}
                <div
                  style={{
                    flex: 1,
                    background: C.page,
                    position: "relative",
                    padding: "30px 40px 30px 40px",
                    overflow: "hidden",
                  }}
                >
                  {/* Breadcrumb */}
                  <div
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 12,
                      color: C.muted,
                      opacity: headingP,
                    }}
                  >
                    Dashboard / My Account Information
                  </div>

                  {/* Heading row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      marginTop: 4,
                      opacity: headingP,
                      transform: `translateY(${interpolate(headingP, [0, 1], [8, 0])}px)`,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 78,
                        lineHeight: 0.95,
                        letterSpacing: "-0.02em",
                        color: C.ink,
                      }}
                    >
                      My Account.
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_UI,
                        fontSize: 12,
                        color: C.muted,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: C.sage,
                          display: "inline-block",
                        }}
                      />
                      Profile 60% complete
                    </div>
                  </div>

                  {/* CARD 1 — Notifications */}
                  <div
                    style={{
                      marginTop: 24,
                      width: 1300,
                      background: C.card,
                      borderRadius: 24,
                      padding: "26px 30px",
                      border: `1px solid ${C.cardBorder}`,
                      boxShadow: C.shadowSoft,
                      opacity: card1P,
                      transform: `translateY(${interpolate(card1P, [0, 1], [50, 0])}px)`,
                      display: "flex",
                      alignItems: "center",
                      gap: 28,
                    }}
                  >
                    <div style={{ minWidth: 240 }}>
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 11,
                          color: C.muted,
                          letterSpacing: "0.16em",
                          fontWeight: 500,
                        }}
                      >
                        01 NOTIFICATIONS
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 30,
                          color: C.ink,
                          marginTop: 4,
                          letterSpacing: "-0.01em",
                          lineHeight: 1.05,
                        }}
                      >
                        Contact preferences
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flex: 1,
                        gap: 24,
                        justifyContent: "flex-end",
                      }}
                    >
                      <ToggleRow label="Email" value="jordan@example.com" on={emailToggle} />
                      <ToggleRow label="SMS" value="(415) 555-0142" on={smsToggle} />
                      <ToggleRow label="Phone calls" value="For urgent matters only" on={0} muted />
                    </div>
                  </div>

                  {/* CARD 2 — Emergency contact */}
                  <div
                    style={{
                      marginTop: 18,
                      width: 1300,
                      background: C.card,
                      borderRadius: 24,
                      padding: "26px 30px",
                      border: `1px solid ${C.cardBorder}`,
                      boxShadow: C.shadowSoft,
                      opacity: card2P,
                      transform: `translateY(${interpolate(card2P, [0, 1], [60, 0])}px)`,
                      display: "flex",
                      alignItems: "center",
                      gap: 28,
                    }}
                  >
                    <div style={{ minWidth: 240 }}>
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 11,
                          color: C.muted,
                          letterSpacing: "0.16em",
                          fontWeight: 500,
                        }}
                      >
                        02 IN CASE OF
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 30,
                          color: C.ink,
                          marginTop: 4,
                          letterSpacing: "-0.01em",
                          lineHeight: 1.05,
                        }}
                      >
                        Emergency contact
                      </div>
                    </div>

                    <div style={{ display: "flex", flex: 1, gap: 14 }}>
                      <TypedInputField
                        label="Full name"
                        text="Avery Mills"
                        frame={frame}
                        startFrame={70}
                      />
                      <FilledInputField label="Relationship" value="Spouse" />
                      <TypedInputField
                        label="Phone number"
                        text="(415) 555-0188"
                        frame={frame}
                        startFrame={115}
                        charsPerFrame={0.7}
                      />
                    </div>
                  </div>

                  {/* CARD 3 — Verify identity (highlighted) */}
                  <div
                    style={{
                      marginTop: 18,
                      width: 1300,
                      background: C.card,
                      borderRadius: 24,
                      padding: "28px 32px",
                      border: `2px solid ${C.lime}`,
                      boxShadow: `${C.shadowSoft}, 0 0 0 ${4 + glow * 4}px rgba(200,255,140,${glowAlpha * 0.3})`,
                      opacity: card3P,
                      transform: `translateY(${interpolate(card3P, [0, 1], [70, 0])}px)`,
                      display: "flex",
                      gap: 28,
                      position: "relative",
                    }}
                  >
                    {/* REQUIRED badge top-left */}
                    <div
                      style={{
                        position: "absolute",
                        left: 24,
                        top: -14,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          background: C.lime,
                          color: C.ink,
                          fontFamily: FONT_UI,
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.14em",
                          padding: "5px 10px",
                          borderRadius: 999,
                        }}
                      >
                        REQUIRED
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 11,
                          color: C.sage,
                          letterSpacing: "0.14em",
                          fontWeight: 500,
                          background: C.page,
                          padding: "3px 8px",
                          borderRadius: 999,
                        }}
                      >
                        For compliance
                      </div>
                    </div>

                    {/* Left column — copy + checklist */}
                    <div style={{ flex: 1, paddingTop: 10 }}>
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 11,
                          color: C.muted,
                          letterSpacing: "0.16em",
                          fontWeight: 500,
                        }}
                      >
                        03 VERIFY IDENTITY
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 40,
                          color: C.ink,
                          marginTop: 6,
                          letterSpacing: "-0.015em",
                          lineHeight: 1.0,
                        }}
                      >
                        Upload your
                        <br />
                        driver's license.
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 14,
                          color: C.body,
                          marginTop: 12,
                          lineHeight: 1.5,
                          maxWidth: 380,
                        }}
                      >
                        A government-issued photo ID is needed before your care team can place
                        orders or write prescriptions.
                      </div>
                      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                        <CheckItem label="Encrypted in transit & at rest" />
                        <CheckItem label="Only your care team sees this" />
                        <CheckItem label="Stored for 7 years per HIPAA" />
                      </div>
                    </div>

                    {/* Right column — drop zone */}
                    <div
                      style={{
                        flex: 1.1,
                        background: "rgba(200,255,140,0.08)",
                        border: `2px dashed ${C.sage}`,
                        borderRadius: 20,
                        padding: 26,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 12,
                        minHeight: 280,
                        transform: `scale(${dropPulse})`,
                      }}
                    >
                      {/* ID card icon */}
                      <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
                        <rect
                          x="6"
                          y="14"
                          width="52"
                          height="36"
                          rx="4"
                          stroke={C.sage}
                          strokeWidth="2"
                          fill={C.cardSoft}
                        />
                        <rect x="13" y="22" width="14" height="14" rx="2" fill={C.sage} opacity="0.5" />
                        <path
                          d="M32 26h18M32 32h18M32 38h12"
                          stroke={C.sage}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M40 8v6M37 11l3-3 3 3"
                          stroke={C.sage}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 26,
                          color: C.ink,
                          letterSpacing: "-0.01em",
                          textAlign: "center",
                        }}
                      >
                        Drop your driver's license here
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 13,
                          color: C.body,
                          textAlign: "center",
                        }}
                      >
                        or <span style={{ color: C.sage, textDecoration: "underline" }}>browse files</span>{" "}
                        · JPG, PNG, or PDF up to 10MB
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          transform: `scale(${1 + takePhotoHover * 0.05})`,
                          boxShadow:
                            takePhotoHover > 0.5
                              ? `0 0 0 4px rgba(200,255,140,0.35)`
                              : "none",
                          borderRadius: 999,
                        }}
                      >
                        <PillButton variant="white" size="md" label="Take a photo" showCamera />
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

const ToggleRow: React.FC<{ label: string; value: string; on: number; muted?: boolean }> = ({
  label,
  value,
  on,
  muted,
}) => {
  // on goes from 0 (off) → 1 (on)
  const knobX = interpolate(on, [0, 1], [3, 23]);
  const bg = interpolate(on, [0, 1], [0.15, 1]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 180,
        opacity: muted ? 0.7 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
        <span style={{ fontFamily: FONT_UI, fontSize: 14, color: C.ink, fontWeight: 500 }}>
          {label}
        </span>
        {/* Toggle pill */}
        <div
          style={{
            width: 44,
            height: 24,
            borderRadius: 999,
            background: muted
              ? "rgba(30,41,30,0.12)"
              : `rgba(122,139,94,${bg})`,
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 3,
              left: knobX,
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#FFFFFF",
              boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            }}
          />
        </div>
      </div>
      <div style={{ fontFamily: FONT_UI, fontSize: 12, color: C.muted }}>{value}</div>
    </div>
  );
};

const TypedInputField: React.FC<{
  label: string;
  text: string;
  frame: number;
  startFrame: number;
  charsPerFrame?: number;
}> = ({ label, text, frame, startFrame, charsPerFrame = 0.6 }) => {
  const local = Math.max(0, frame - startFrame);
  const typingActive = local >= 0 && local * charsPerFrame < text.length + 4;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
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
      <div
        style={{
          height: 48,
          background: C.input,
          borderRadius: RADIUS.input,
          paddingLeft: 14,
          paddingRight: 14,
          display: "flex",
          alignItems: "center",
          fontFamily: FONT_UI,
          fontSize: 15,
          color: C.ink,
          boxShadow: typingActive ? `inset 0 0 0 1.5px ${C.sage}` : "none",
        }}
      >
        <Typewriter
          text={text}
          frame={frame}
          startFrame={startFrame}
          charsPerFrame={charsPerFrame}
        />
      </div>
    </div>
  );
};

const FilledInputField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
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
    <div
      style={{
        height: 48,
        background: C.input,
        borderRadius: RADIUS.input,
        paddingLeft: 14,
        paddingRight: 14,
        display: "flex",
        alignItems: "center",
        fontFamily: FONT_UI,
        fontSize: 15,
        color: C.ink,
      }}
    >
      {value}
    </div>
  </div>
);

const CheckItem: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 999,
        background: C.sage,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12l5 5 9-11"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
    <span style={{ fontFamily: FONT_UI, fontSize: 13, color: C.body }}>{label}</span>
  </div>
);
