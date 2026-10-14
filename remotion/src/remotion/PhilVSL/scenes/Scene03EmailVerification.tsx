import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY, FONT_UI, RADIUS } from "../ui/tokens";
import { SceneShell, innerToAbs } from "../ui/SceneShell";
import { PillButton } from "../ui/PillButton";
import { Cursor, CursorWaypoint } from "../ui/Cursor";
import { Logo } from "../ui/Logo";
import { SLINGSHOT, SNAPPY, SOFT, EASE_OUT } from "../animation/springs";

type Props = { durationInFrames: number };

type InboxItem = {
  sender: string;
  subject: string;
  preview: string;
  time: string;
  unread?: boolean;
  highlighted?: boolean;
  icon?: React.ReactNode;
};

export const Scene03EmailVerification: React.FC<Props> = ({ durationInFrames }) => {
  const { fps } = useVideoConfig();

  return (
    <SceneShell
      url="app.portal.health/verify"
      tabTitle="Verify Your Email"
      durationInFrames={durationInFrames}
    >
      {(frame) => {
        // Reveal beats
        const leftPanelP = spring({ frame: frame - 12, fps, config: SLINGSHOT });
        const envelopeP = spring({ frame: frame - 18, fps, config: SLINGSHOT });
        const headlineP = interpolate(frame, [25, 55], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const bodyP = interpolate(frame, [40, 60], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const inboxPanelP = spring({ frame: frame - 55, fps, config: SLINGSHOT });
        const inboxItemP = (i: number) =>
          spring({ frame: frame - (75 + i * 7), fps, config: SNAPPY });

        // Email content reveals after click (frame ~170)
        const emailOpenP = interpolate(frame, [170, 220], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const emailBannerP = spring({ frame: frame - 180, fps, config: SOFT });
        const verifyButtonHoverP = spring({ frame: frame - 232, fps, config: SNAPPY });

        // Care Team row click happens at frame 150. Before that the row shows
        // as UNREAD (lime dot + bold) but NOT selected. After click, lime fill
        // + border + glow fade in.
        const INBOX_CLICK_FRAME = 150;
        const selectedP = interpolate(
          frame,
          [INBOX_CLICK_FRAME - 2, INBOX_CLICK_FRAME + 6],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        // Pulse glow on the selected Care Team item — only after click
        const glowPulse =
          selectedP *
          interpolate(
            (frame - INBOX_CLICK_FRAME) % 50,
            [0, 25, 50],
            [0.3, 0.7, 0.3],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

        // Countdown for resend pill: 00:42 -> tick down
        const countdownSec = Math.max(0, 42 - Math.floor((frame - 60) / 25));
        const countdownStr = `00:${countdownSec.toString().padStart(2, "0")}`;

        const inboxItems: InboxItem[] = [
          {
            sender: "Care Team",
            subject: "Verify your email address",
            preview: "Welcome — please confirm your email…",
            time: "2m ago",
            unread: true,
            // `highlighted` (selected) is now derived from `selectedP` per-row below.
          },
          {
            sender: "Notion",
            subject: "Your weekly digest",
            preview: "12 new mentions in your workspace",
            time: "1h",
          },
          {
            sender: "Strava",
            subject: "Monthly challenge complete",
            preview: "You crushed 80km this month",
            time: "3h",
          },
          {
            sender: "Mom",
            subject: "Re: Thanksgiving",
            preview: "Sounds great — bringing the pie",
            time: "5h",
          },
          {
            sender: "GitHub",
            subject: "[portal/main] PR #482 merged",
            preview: "Squash-merged into main",
            time: "9h",
          },
          {
            sender: "LinkedIn",
            subject: "Sarah added you",
            preview: "2 new connections this week",
            time: "1d",
          },
        ];

        // Cursor waypoints — chrome-body coords.
        // Right panel sits at chrome x:700. Inbox list (340px wide) inside it
        // spans chrome x:700-1040. First row (Care Team) sits at chrome
        // y ~58-126, centre ~92. Verify button in email pane sits around
        // chrome (1180, 400).
        const cursorWaypoints: CursorWaypoint[] = [
          { ...innerToAbs(220, 280), at: 0 }, // start hovering envelope area
          { ...innerToAbs(220, 280), at: 30 },
          { ...innerToAbs(870, 95), at: 140 }, // arrive on Care Team row
          { ...innerToAbs(870, 95), at: 150, click: true },
          { ...innerToAbs(870, 95), at: 200 },
          { ...innerToAbs(1180, 400), at: 235 }, // hover Verify email address
          { ...innerToAbs(1180, 400), at: 245, click: true },
          { ...innerToAbs(1180, 400), at: 265 },
        ];

        return (
          <>
            {/* LEFT PANEL (cream bg ~700px wide) */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 700,
                height: "100%",
                background: C.page,
                opacity: leftPanelP,
                transform: `translateY(${interpolate(leftPanelP, [0, 1], [40, 0])}px)`,
              }}
            >
              {/* Logo top-left */}
              <div style={{ position: "absolute", left: 36, top: 24 }}>
                <Logo size={22} color={C.ink} />
              </div>

              {/* Envelope icon + content container */}
              <div
                style={{
                  position: "absolute",
                  left: 80,
                  top: 200,
                  width: 540,
                }}
              >
                {/* Big envelope icon */}
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 24,
                    background: C.limeSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${interpolate(envelopeP, [0, 1], [0.2, 1])})`,
                    position: "relative",
                    marginBottom: 40,
                  }}
                >
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="6" width="18" height="14" rx="2" stroke={C.sageDeep} strokeWidth="1.8" />
                    <path d="M3 8l9 6 9-6" stroke={C.sageDeep} strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                  {/* Notification dot */}
                  <div
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: C.sageDeep,
                      color: C.lime,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: FONT_UI,
                      fontSize: 11,
                      fontWeight: 700,
                      border: `2px solid ${C.page}`,
                      transform: `scale(${interpolate(envelopeP, [0, 1], [0, 1])})`,
                    }}
                  >
                    1
                  </div>
                </div>

                {/* STEP label */}
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 11,
                    color: C.muted,
                    letterSpacing: "0.16em",
                    fontWeight: 500,
                    opacity: headlineP,
                  }}
                >
                  STEP 3 OF 3
                </div>

                {/* Huge headline */}
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 88,
                    lineHeight: 0.95,
                    letterSpacing: "-0.02em",
                    color: C.ink,
                    marginTop: 14,
                    opacity: headlineP,
                    transform: `translateY(${interpolate(headlineP, [0, 1], [12, 0])}px)`,
                  }}
                >
                  Check your
                  <br />
                  email.
                </div>

                {/* Body */}
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 17,
                    color: C.body,
                    marginTop: 22,
                    lineHeight: 1.45,
                    opacity: bodyP,
                    transform: `translateY(${interpolate(bodyP, [0, 1], [8, 0])}px)`,
                  }}
                >
                  We've sent a verification link to
                  <br />
                  <span style={{ color: C.ink, fontWeight: 500 }}>jordan@example.com</span>
                </div>

                {/* Didn't get it? Resend pill + countdown */}
                <div
                  style={{
                    marginTop: 30,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    opacity: bodyP,
                  }}
                >
                  <span style={{ fontFamily: FONT_UI, fontSize: 13, color: C.muted }}>
                    Didn't get it?
                  </span>
                  <PillButton variant="white" size="sm" label="Resend email" showArrow />
                  <span
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 12,
                      color: C.muted,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {countdownStr}
                  </span>
                </div>
              </div>

              {/* Footer-left */}
              <div
                style={{
                  position: "absolute",
                  left: 36,
                  bottom: 28,
                  fontFamily: FONT_UI,
                  fontSize: 12,
                  color: C.muted,
                }}
              >
                Wrong email address?
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 36,
                  bottom: 28,
                  fontFamily: FONT_UI,
                  fontSize: 12,
                  color: C.body,
                  fontWeight: 500,
                }}
              >
                Update
              </div>
            </div>

            {/* RIGHT PANEL — Inbox + opened email */}
            <div
              style={{
                position: "absolute",
                left: 700,
                top: 0,
                width: 1060,
                height: "100%",
                background: C.card,
                opacity: inboxPanelP,
                transform: `translateX(${interpolate(inboxPanelP, [0, 1], [120, 0])}px)`,
                display: "flex",
              }}
            >
              {/* Inbox list (left side of right panel) */}
              <div
                style={{
                  width: 340,
                  height: "100%",
                  borderRight: `1px solid ${C.divider}`,
                  display: "flex",
                  flexDirection: "column",
                  flexShrink: 0,
                }}
              >
                {/* Inbox header */}
                <div
                  style={{
                    padding: "26px 22px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 16,
                      color: C.ink,
                      fontWeight: 600,
                    }}
                  >
                    Inbox
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 11,
                      color: C.muted,
                      letterSpacing: "0.08em",
                      fontWeight: 500,
                    }}
                  >
                    204
                  </span>
                </div>

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {inboxItems.map((item, i) => {
                    const p = inboxItemP(i);
                    // Only the first (Care Team) row gets click-driven select.
                    const sel = i === 0 ? selectedP : 0;
                    return (
                      <div
                        key={i}
                        style={{
                          padding: "12px 22px 14px",
                          background:
                            i === 0
                              ? `rgba(200,255,140,${0.22 * sel})`
                              : "transparent",
                          borderLeft:
                            i === 0
                              ? `3px solid rgba(200,255,140,${sel})`
                              : "3px solid transparent",
                          boxShadow:
                            i === 0
                              ? `inset 0 0 0 1px rgba(200,255,140,${glowPulse})`
                              : "none",
                          opacity: p,
                          transform: `translateY(${interpolate(p, [0, 1], [10, 0])}px)`,
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                          borderBottom: `1px solid ${C.divider}`,
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
                              fontSize: 13,
                              color: C.ink,
                              fontWeight: item.unread ? 600 : 500,
                            }}
                          >
                            {item.sender}
                          </span>
                          <span
                            style={{
                              fontFamily: FONT_UI,
                              fontSize: 11,
                              color: C.muted,
                            }}
                          >
                            {item.time}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: FONT_UI,
                            fontSize: 12,
                            color: item.unread ? C.ink : C.body,
                            fontWeight: item.unread ? 600 : 400,
                          }}
                        >
                          {item.subject}
                        </span>
                        <span
                          style={{
                            fontFamily: FONT_UI,
                            fontSize: 11,
                            color: C.muted,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.preview}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Opened email pane */}
              <div
                style={{
                  flex: 1,
                  padding: "26px 32px",
                  display: "flex",
                  flexDirection: "column",
                  opacity: emailOpenP,
                  transform: `translateY(${interpolate(emailOpenP, [0, 1], [12, 0])}px)`,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 30,
                    color: C.ink,
                    lineHeight: 1.0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Verify your email address
                </div>

                {/* Sender row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 14,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: C.cardSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${C.divider}`,
                    }}
                  >
                    <Logo size={14} color={C.ink} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span
                      style={{
                        fontFamily: FONT_UI,
                        fontSize: 13,
                        color: C.ink,
                        fontWeight: 600,
                      }}
                    >
                      Care Team
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_UI,
                        fontSize: 11,
                        color: C.sage,
                        textDecoration: "underline",
                      }}
                    >
                      noreply@portal.health · 2 min ago
                    </span>
                  </div>
                </div>

                {/* Olive welcome banner */}
                <div
                  style={{
                    marginTop: 22,
                    background: C.darkOlive,
                    borderRadius: RADIUS.cardSm,
                    padding: "16px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    opacity: emailBannerP,
                    transform: `translateY(${interpolate(emailBannerP, [0, 1], [10, 0])}px)`,
                  }}
                >
                  <Logo size={20} color={C.invertedInk} />
                  <span
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 11,
                      color: C.invertedInk,
                      letterSpacing: "0.18em",
                      fontWeight: 500,
                    }}
                  >
                    WELCOME TO THE PRACTICE
                  </span>
                </div>

                {/* Greeting */}
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 38,
                    lineHeight: 1.05,
                    letterSpacing: "-0.01em",
                    color: C.ink,
                    marginTop: 22,
                    opacity: emailOpenP,
                  }}
                >
                  Hi Jordan — let's verify it's really you.
                </div>

                {/* Body text */}
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 14,
                    color: C.body,
                    marginTop: 14,
                    lineHeight: 1.5,
                    opacity: emailOpenP,
                  }}
                >
                  Welcome aboard. Click the button below to confirm your email and unlock your patient
                  portal — appointments, secure messages, lab orders, and more.
                </div>

                {/* Big lime button */}
                <div
                  style={{
                    marginTop: 24,
                    transform: `scale(${1 + verifyButtonHoverP * 0.04})`,
                    boxShadow:
                      verifyButtonHoverP > 0.5 ? `0 0 0 4px rgba(200,255,140,0.35)` : "none",
                    borderRadius: 999,
                    display: "inline-block",
                    opacity: emailOpenP,
                  }}
                >
                  <PillButton variant="lime" size="lg" label="Verify email address" />
                </div>

                {/* Footer */}
                <div style={{ flex: 1 }} />
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 11,
                    color: C.muted,
                    marginTop: 28,
                    opacity: emailOpenP,
                  }}
                >
                  This link expires in 24 hours. If you didn't create an account, you can safely ignore
                  this message.
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
