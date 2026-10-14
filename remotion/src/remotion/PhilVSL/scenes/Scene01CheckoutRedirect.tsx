import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../ui/tokens";
import { SceneShell, innerToAbs } from "../ui/SceneShell";
import { PillButton } from "../ui/PillButton";
import { Cursor, CursorWaypoint } from "../ui/Cursor";
import { Stepper } from "../ui/Stepper";
import { Input } from "../ui/Input";
import { SLINGSHOT, SNAPPY, SOFT, EASE_OUT } from "../animation/springs";

type Props = { durationInFrames: number };

export const Scene01CheckoutRedirect: React.FC<Props> = ({ durationInFrames }) => {
  const { fps } = useVideoConfig();

  return (
    <SceneShell url="checkout.portal.health/success" tabTitle="Order Confirmed" durationInFrames={durationInFrames}>
      {(frame) => {
        // Reveal beats
        const leftCardP = spring({ frame: frame - 12, fps, config: SNAPPY });
        const checkmarkP = spring({ frame: frame - 22, fps, config: SLINGSHOT });
        const headlineP = interpolate(frame, [26, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
        const progressFill = interpolate(frame, [38, 80], [0, 0.72], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
        const ctaHoverP = spring({ frame: frame - 90, fps, config: SNAPPY });
        const rightCardP = spring({ frame: frame - 130, fps, config: SLINGSHOT });
        const stepperP = spring({ frame: frame - 148, fps, config: SNAPPY });

        // Form fields slide in from right with stagger
        const fields = [
          { label: "Full name", placeholder: "Jordan Mills" },
          { label: "Date of birth", placeholder: "04 / 18 / 1989" },
          { label: "Phone number", placeholder: "(415) 555-0142" },
          { label: "Email address", placeholder: "jordan@example.com" },
        ];

        const cursorWaypoints: CursorWaypoint[] = [
          { ...innerToAbs(60, 700), at: 0 },
          { ...innerToAbs(380, 540), at: 70 }, // hover CTA
          { ...innerToAbs(380, 540), at: 95, click: true },
          { ...innerToAbs(1200, 360), at: 130 }, // move to right card
          { ...innerToAbs(1200, 700), at: 175 }, // wander down
        ];

        return (
          <>
            {/* Logo top-left */}
            <div style={{ position: "absolute", left: 36, top: 24 }}>
              <svg width="22" height="26" viewBox="0 0 40 46" fill="none">
                <path d="M20 4 V42" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" />
                <path d="M20 18 C 10 14, 4 18, 4 26 C 12 26, 18 24, 20 18 Z" fill={C.ink} />
                <path d="M20 26 C 30 22, 36 26, 36 34 C 28 34, 22 32, 20 26 Z" fill={C.ink} />
              </svg>
            </div>

            {/* LEFT CARD — Payment successful */}
            <div
              style={{
                position: "absolute",
                left: 80,
                top: 130,
                width: 820,
                background: C.card,
                borderRadius: 28,
                padding: "44px 48px",
                boxShadow: C.shadowSoft,
                border: `1px solid ${C.cardBorder}`,
                opacity: leftCardP,
                transform: `translateY(${interpolate(leftCardP, [0, 1], [40, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: FONT_UI, fontSize: 11, color: C.muted, letterSpacing: "0.16em", fontWeight: 500 }}>
                STEP 1 OF 3 · COMPLETE
              </div>

              {/* Headline row with checkmark */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginTop: 18 }}>
                <div
                  style={{
                    width: 78,
                    height: 78,
                    borderRadius: 999,
                    background: C.sageDeep,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${interpolate(checkmarkP, [0, 1], [0, 1])})`,
                    flexShrink: 0,
                  }}
                >
                  {/* Animated checkmark stroke */}
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12l5 5 9-11"
                      stroke="#F4EFE2"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="30"
                      strokeDashoffset={interpolate(spring({ frame: frame - 30, fps, config: SOFT }), [0, 1], [30, 0])}
                    />
                  </svg>
                </div>
                <div style={{ flex: 1, opacity: headlineP, transform: `translateY(${interpolate(headlineP, [0, 1], [10, 0])}px)` }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 64, lineHeight: 0.95, letterSpacing: "-0.015em", color: C.ink }}>
                    Payment
                    <br />
                    successful.
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ fontFamily: FONT_UI, fontSize: 17, color: C.body, marginTop: 22, lineHeight: 1.4, opacity: headlineP, maxWidth: 540 }}>
                Thank you for joining us. We're getting your account ready and redirecting you to registration.
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 28, opacity: leftCardP }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: FONT_UI, fontSize: 12, color: C.muted }}>
                    Redirecting to registration…
                  </span>
                  <span style={{ fontFamily: FONT_UI, fontSize: 12, color: C.muted, fontWeight: 500 }}>
                    {Math.round(progressFill * 100)}%
                  </span>
                </div>
                <div style={{ height: 6, background: C.input, borderRadius: 999, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${progressFill * 100}%`,
                      background: C.lime,
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>

              {/* CTA row */}
              <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
                <div
                  style={{
                    transform: `scale(${1 + ctaHoverP * 0.03})`,
                    boxShadow: ctaHoverP > 0.5 ? `0 0 0 4px rgba(200,255,140,0.35)` : "none",
                    borderRadius: 999,
                    display: "inline-block",
                  }}
                >
                  <PillButton variant="lime" size="md" label="Continue to Registration" />
                </div>
                <PillButton variant="white" size="md" label="View receipt" />
              </div>

              {/* Divider + plan summary */}
              <div style={{ height: 1, background: C.divider, margin: "32px 0 22px" }} />
              <div style={{ display: "flex", gap: 60 }}>
                <SummaryCol label="Plan" value="Core Wellness · Annual" />
                <SummaryCol label="Total" value="$1,188.00" />
                <SummaryCol label="Next step" value="Registration Form" />
              </div>
            </div>

            {/* RIGHT CARD — Patient registration (loading) */}
            <div
              style={{
                position: "absolute",
                left: 940,
                top: 130,
                width: 760,
                background: C.card,
                borderRadius: 28,
                padding: "44px 44px",
                boxShadow: C.shadowSoft,
                border: `1px solid ${C.cardBorder}`,
                opacity: rightCardP,
                transform: `translateX(${interpolate(rightCardP, [0, 1], [60, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: FONT_UI, fontSize: 11, color: C.muted, letterSpacing: "0.16em", fontWeight: 500 }}>
                LOADING · STEP 2 OF 3
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 48, color: C.ink, marginTop: 14, lineHeight: 1.0 }}>
                Patient registration
              </div>
              <div style={{ fontFamily: FONT_UI, fontSize: 14, color: C.body, marginTop: 10, marginBottom: 24 }}>
                We'll collect the information your care team needs to get started.
              </div>

              <div style={{ opacity: stepperP, transform: `translateY(${interpolate(stepperP, [0, 1], [8, 0])}px)` }}>
                <Stepper
                  steps={[
                    { label: "Checkout", status: "completed" },
                    { label: "Registration", status: "active" },
                    { label: "Verify email", status: "upcoming" },
                  ]}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 28 }}>
                {fields.map((f, i) => {
                  const fp = spring({ frame: frame - (160 + i * 7), fps, config: SNAPPY });
                  return (
                    <div
                      key={f.label}
                      style={{
                        opacity: fp,
                        transform: `translateY(${interpolate(fp, [0, 1], [14, 0])}px)`,
                      }}
                    >
                      <Input label={f.label} placeholder={f.placeholder} />
                    </div>
                  );
                })}
              </div>
            </div>

            <Cursor frame={frame} waypoints={cursorWaypoints} />
          </>
        );
      }}
    </SceneShell>
  );
};

const SummaryCol: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div style={{ fontFamily: FONT_UI, fontSize: 11, color: C.muted, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 500 }}>
      {label}
    </div>
    <div style={{ fontFamily: FONT_UI, fontSize: 15, color: C.ink, marginTop: 4, fontWeight: 500 }}>{value}</div>
  </div>
);

