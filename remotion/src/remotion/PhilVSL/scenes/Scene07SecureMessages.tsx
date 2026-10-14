import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../ui/tokens";
import { SceneShell, innerToAbs } from "../ui/SceneShell";
import { PillButton } from "../ui/PillButton";
import { Cursor, CursorWaypoint } from "../ui/Cursor";
import { TopNav } from "../ui/TopNav";
import { Sidebar } from "../ui/Sidebar";
import { Logo } from "../ui/Logo";
import { SLINGSHOT, SNAPPY, SOFT, EASE_OUT } from "../animation/springs";

type Props = { durationInFrames: number };

type InboxRow = {
  sender: string;
  time: string;
  subject: string;
  preview: string;
  highlighted?: boolean;
  unread?: boolean;
};

export const Scene07SecureMessages: React.FC<Props> = ({ durationInFrames }) => {
  const { fps } = useVideoConfig();

  return (
    <SceneShell
      url="app.portal.health/messages"
      tabTitle="Secure Messages"
      durationInFrames={durationInFrames}
    >
      {(frame) => {
        // Chrome entrance handled by SceneShell. Inner reveals:
        const topNavP = spring({ frame: frame - 14, fps, config: SOFT });
        const sidebarP = spring({ frame: frame - 18, fps, config: SOFT });
        const headingP = interpolate(frame, [20, 40], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const labelP = interpolate(frame, [22, 40], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const composeP = spring({ frame: frame - 30, fps, config: SLINGSHOT });
        const inboxPanelP = spring({ frame: frame - 35, fps, config: SNAPPY });
        const inboxRowP = (i: number) =>
          spring({ frame: frame - (45 + i * 6), fps, config: SNAPPY });
        // Email message panel + lab-order content reveal much earlier so the
        // numbered Quest instructions are readable while the narrator is still
        // describing them. Shifted ~25-40 frames earlier across the board.
        const messagePanelP = spring({ frame: frame - 100, fps, config: SLINGSHOT });
        const messageHeaderP = interpolate(frame, [140, 170], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const stepP = (i: number) =>
          spring({ frame: frame - (175 + i * 16), fps, config: SLINGSHOT });

        // CTA hover on Book at Quest — earlier to match earlier reveals
        const bookHoverP = spring({ frame: frame - 280, fps, config: SNAPPY });

        // Inbox row click is at frame 100. Before that, the Care Team row
        // shows as unread (lime dot + bold) but NOT selected. After click,
        // it transitions to the "open/selected" treatment with lime fill.
        const CLICK_FRAME = 100;
        const selectedP = interpolate(
          frame,
          [CLICK_FRAME - 2, CLICK_FRAME + 6],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        // Glow pulse on the selected row — only after click
        const glowPulse =
          selectedP *
          interpolate((frame - CLICK_FRAME) % 50, [0, 25, 50], [0.25, 0.7, 0.25], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

        const inboxRows: InboxRow[] = [
          {
            sender: "Care Team",
            time: "Today 9:42 AM",
            subject: "Your lab order is ready — Quest Diagnostics",
            preview: "Hi Jordan — your initial bloodwork order has been submitted to Quest…",
            // `highlighted` (selected) is now derived from `selectedP` per-row below.
            unread: true,
          },
          {
            sender: "Dr. Sarah Mitchell",
            time: "Yesterday",
            subject: "Welcome to the practice",
            preview: "Looking forward to our initial consultation next week…",
          },
          {
            sender: "Billing",
            time: "Mon 10/14",
            subject: "Receipt for your membership",
            preview: "Thank you for joining. Your annual membership…",
          },
          {
            sender: "Care Team",
            time: "Oct 8",
            subject: "How are you feeling today?",
            preview: "A quick check-in from your care coordinator…",
          },
        ];

        // Cursor waypoints — chrome-body coords. Clicks moved up ~25f to
        // match the earlier email reveal.
        // First (Care Team) row centre ≈ (486, 345). Message body ≈ (1100, 500).
        // Book at Quest pill centre ≈ (820, 770).
        const cursorWaypoints: CursorWaypoint[] = [
          { ...innerToAbs(80, 880), at: 0 },
          { ...innerToAbs(486, 345), at: 90 }, // arrive on Care Team row
          { ...innerToAbs(486, 345), at: 100, click: true },
          { ...innerToAbs(486, 345), at: 125 },
          { ...innerToAbs(1100, 500), at: 195 }, // drift over message body
          { ...innerToAbs(820, 770), at: 290 }, // arrive on Book at Quest
          { ...innerToAbs(820, 770), at: 305, click: true },
          { ...innerToAbs(820, 770), at: 325 },
          { ...innerToAbs(1500, 870), at: 365 },
        ];

        return (
          <>
            {/* Portal shell — TopNav across the top */}
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
                  { label: "My Messages", active: true, badge: 1 },
                  { label: "My Documents" },
                  { label: "My Forms" },
                  { label: "My Account" },
                ]}
              />
            </div>

            {/* CONTENT AREA — to the right of sidebar */}
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
              {/* SECURE label */}
              <div
                style={{
                  position: "absolute",
                  left: 56,
                  top: 36,
                  fontFamily: FONT_UI,
                  fontSize: 11,
                  color: C.muted,
                  letterSpacing: "0.18em",
                  fontWeight: 500,
                  opacity: labelP,
                }}
              >
                SECURE · END-TO-END ENCRYPTED
              </div>

              {/* Heading */}
              <div
                style={{
                  position: "absolute",
                  left: 56,
                  top: 64,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 76,
                  lineHeight: 0.95,
                  letterSpacing: "-0.02em",
                  color: C.ink,
                  opacity: headingP,
                  transform: `translateY(${interpolate(headingP, [0, 1], [10, 0])}px)`,
                }}
              >
                My Secure Messages
              </div>

              {/* Compose pill — top right */}
              <div
                style={{
                  position: "absolute",
                  right: 56,
                  top: 80,
                  opacity: composeP,
                  transform: `scale(${interpolate(composeP, [0, 1], [0.4, 1])})`,
                  transformOrigin: "100% 50%",
                }}
              >
                <PillButton variant="lime" size="md" label="Compose message" showArrow />
              </div>

              {/* TWO COLUMN BODY */}
              {/* LEFT: Inbox list */}
              <div
                style={{
                  position: "absolute",
                  left: 56,
                  top: 180,
                  width: 420,
                  background: C.card,
                  borderRadius: 24,
                  border: `1px solid ${C.cardBorder}`,
                  boxShadow: C.shadowSoft,
                  padding: "22px 0 8px",
                  opacity: inboxPanelP,
                  transform: `translateX(${interpolate(inboxPanelP, [0, 1], [-40, 0])}px)`,
                  maxHeight: 640,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0 24px 14px",
                    alignItems: "center",
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
                    1 unread · 24 total
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {inboxRows.map((row, i) => {
                    const p = inboxRowP(i);
                    // Only the first (Care Team) row gets the click-driven
                    // selected treatment. selectedP ramps 0→1 around frame 125.
                    const sel = i === 0 ? selectedP : 0;
                    return (
                      <div
                        key={i}
                        style={{
                          padding: "14px 24px",
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
                          gap: 4,
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
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {row.unread && (
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: 999,
                                  background: C.lime,
                                  display: "inline-block",
                                  boxShadow: `0 0 0 2px ${C.sageDeep}`,
                                }}
                              />
                            )}
                            <span
                              style={{
                                fontFamily: FONT_UI,
                                fontSize: 13,
                                color: C.ink,
                                fontWeight: row.unread ? 600 : 500,
                              }}
                            >
                              {row.sender}
                            </span>
                          </div>
                          <span
                            style={{
                              fontFamily: FONT_UI,
                              fontSize: 11,
                              color: C.muted,
                            }}
                          >
                            {row.time}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: FONT_UI,
                            fontSize: 13,
                            color: row.unread ? C.ink : C.body,
                            fontWeight: row.unread ? 600 : 400,
                          }}
                        >
                          {row.subject}
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
                          {row.preview}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Opened message panel */}
              <div
                style={{
                  position: "absolute",
                  left: 500,
                  top: 180,
                  right: 56,
                  background: C.card,
                  borderRadius: 28,
                  border: `1px solid ${C.cardBorder}`,
                  boxShadow: C.shadowSoft,
                  padding: "32px 36px",
                  opacity: messagePanelP,
                  transform: `translateY(${interpolate(messagePanelP, [0, 1], [80, 0])}px)`,
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 20,
                    opacity: messageHeaderP,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 32,
                      lineHeight: 1.0,
                      letterSpacing: "-0.01em",
                      color: C.ink,
                      maxWidth: 700,
                    }}
                  >
                    Your lab order is ready — Quest Diagnostics instructions
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      background: C.sage,
                      borderRadius: 999,
                      fontFamily: FONT_UI,
                      fontSize: 12,
                      color: C.invertedInk,
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: C.lime,
                        display: "inline-block",
                      }}
                    />
                    Action required
                  </div>
                </div>

                {/* Sender row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 18,
                    opacity: messageHeaderP,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
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
                  <span style={{ fontFamily: FONT_UI, fontSize: 12, color: C.muted }}>·</span>
                  <span style={{ fontFamily: FONT_UI, fontSize: 12, color: C.muted }}>
                    To you · Today at 9:42 AM
                  </span>
                </div>

                {/* Body intro */}
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 15,
                    color: C.body,
                    lineHeight: 1.55,
                    marginTop: 22,
                    opacity: messageHeaderP,
                  }}
                >
                  Hi Jordan — your lab order has been submitted to Quest Diagnostics! Here's what
                  to do next:
                </div>

                {/* Three numbered steps */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    marginTop: 22,
                  }}
                >
                  {[
                    {
                      title: "Visit a Quest location",
                      desc: "Use the locator below to find the nearest patient service center.",
                    },
                    {
                      title: "Bring these with you",
                      desc: "Your name, date of birth, and a photo ID. No appointment needed.",
                    },
                    {
                      title: "No fasting required",
                      desc:
                        "Eat and drink normally before your draw — unless your provider noted otherwise.",
                    },
                  ].map((step, i) => {
                    const p = stepP(i);
                    // Number circle punch: 0 -> 1.15 -> 1
                    const numScale =
                      p < 0.6
                        ? interpolate(p, [0, 0.6], [0, 1.15], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                          })
                        : interpolate(p, [0.6, 1], [1.15, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                          });
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 16,
                          opacity: p,
                          transform: `translateY(${interpolate(p, [0, 1], [16, 0])}px)`,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 999,
                            background: C.lime,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: FONT_UI,
                            fontSize: 14,
                            fontWeight: 700,
                            color: C.ink,
                            flexShrink: 0,
                            transform: `scale(${numScale})`,
                          }}
                        >
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, paddingTop: 4 }}>
                          <div
                            style={{
                              fontFamily: FONT_UI,
                              fontSize: 15,
                              fontWeight: 600,
                              color: C.ink,
                            }}
                          >
                            {step.title}
                          </div>
                          <div
                            style={{
                              fontFamily: FONT_UI,
                              fontSize: 13,
                              color: C.body,
                              marginTop: 3,
                              lineHeight: 1.4,
                            }}
                          >
                            {step.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom CTA row */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 30,
                    opacity: interpolate(frame, [280, 300], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${1 + bookHoverP * 0.05})`,
                      boxShadow:
                        bookHoverP > 0.5
                          ? `0 0 0 4px rgba(200,255,140,0.4)`
                          : "none",
                      borderRadius: 999,
                      display: "inline-block",
                    }}
                  >
                    <PillButton variant="lime" size="md" label="Book at Quest" showArrow />
                  </div>
                  <PillButton variant="white" size="md" label="Find a location" showArrow />
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
