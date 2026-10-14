import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY, FONT_UI, RADIUS } from "../ui/tokens";
import { SceneShell, innerToAbs } from "../ui/SceneShell";
import { PillButton } from "../ui/PillButton";
import { Cursor, CursorWaypoint } from "../ui/Cursor";
import { Stepper } from "../ui/Stepper";
import { Input } from "../ui/Input";
import { Typewriter } from "../ui/Typewriter";
import { SLINGSHOT, SNAPPY, SOFT, EASE_OUT } from "../animation/springs";

type Props = { durationInFrames: number };

export const Scene02RegistrationForm: React.FC<Props> = ({ durationInFrames }) => {
  const { fps } = useVideoConfig();

  return (
    <SceneShell
      url="app.portal.health/registration"
      tabTitle="Patient Registration"
      durationInFrames={durationInFrames}
    >
      {(frame) => {
        // Reveal beats
        const stepperP = spring({ frame: frame - 12, fps, config: SNAPPY });
        const leftCardP = spring({ frame: frame - 18, fps, config: SLINGSHOT });
        const headlineP = interpolate(frame, [26, 48], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const rightCardP = spring({ frame: frame - 90, fps, config: SLINGSHOT });
        const bannerP = spring({ frame: frame - 150, fps, config: SOFT });
        const submitHoverP = spring({ frame: frame - 200, fps, config: SNAPPY });

        // Form field stagger
        const fieldDelay = (i: number) => 30 + i * 5;
        const fieldP = (i: number) => spring({ frame: frame - fieldDelay(i), fps, config: SNAPPY });

        // Cursor waypoints — start off-screen-bottom-left
        const cursorWaypoints: CursorWaypoint[] = [
          { ...innerToAbs(-80, 960), at: 0 },
          { ...innerToAbs(320, 270), at: 50 }, // hover first name
          { ...innerToAbs(320, 270), at: 70 },
          { ...innerToAbs(1300, 380), at: 140, click: true }, // click card number field
          { ...innerToAbs(1300, 380), at: 180 },
          { ...innerToAbs(1620, 820), at: 205 }, // hover submit
          { ...innerToAbs(1620, 820), at: 215, click: true }, // click submit
          { ...innerToAbs(1620, 820), at: 240 },
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

            {/* "Need help?" top right */}
            <div
              style={{
                position: "absolute",
                right: 36,
                top: 24,
                fontFamily: FONT_UI,
                fontSize: 11,
                color: C.muted,
                textAlign: "right",
                lineHeight: 1.2,
              }}
            >
              Need
              <br />
              help?
            </div>

            {/* Stepper */}
            <div
              style={{
                position: "absolute",
                left: 80,
                top: 78,
                width: 800,
                opacity: stepperP,
                transform: `translateY(${interpolate(stepperP, [0, 1], [10, 0])}px)`,
              }}
            >
              <Stepper
                steps={[
                  { label: "Step 1 - Checkout", status: "completed" },
                  { label: "Step 2 - Registration", status: "active" },
                  { label: "Step 3 - Verify email", status: "upcoming" },
                ]}
              />
            </div>

            {/* Step 2 of 3 label */}
            <div
              style={{
                position: "absolute",
                right: 36,
                top: 90,
                fontFamily: FONT_UI,
                fontSize: 11,
                color: C.muted,
                opacity: stepperP,
              }}
            >
              Step 2 of 3
            </div>

            {/* LEFT CARD — Personal info */}
            <div
              style={{
                position: "absolute",
                left: 80,
                top: 130,
                width: 1080,
                background: C.card,
                borderRadius: 28,
                padding: "44px 48px",
                boxShadow: C.shadowSoft,
                border: `1px solid ${C.cardBorder}`,
                opacity: leftCardP,
                transform: `translateY(${interpolate(leftCardP, [0, 1], [40, 0])}px) scale(${interpolate(
                  leftCardP,
                  [0, 1],
                  [0.96, 1],
                )})`,
                transformOrigin: "50% 50%",
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
                PERSONAL INFORMATION
              </div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 64,
                  lineHeight: 0.95,
                  letterSpacing: "-0.015em",
                  color: C.ink,
                  marginTop: 12,
                  opacity: headlineP,
                  transform: `translateY(${interpolate(headlineP, [0, 1], [12, 0])}px)`,
                }}
              >
                Tell us about you
              </div>

              {/* 2-column form grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 18,
                  marginTop: 32,
                }}
              >
                {/* Legal first name — typed */}
                <FieldWrap p={fieldP(0)}>
                  <TypedInput
                    label="Legal first name"
                    text="Jordan"
                    frame={frame}
                    startFrame={50}
                  />
                </FieldWrap>

                {/* Legal last name — typed */}
                <FieldWrap p={fieldP(1)}>
                  <TypedInput
                    label="Legal last name"
                    text="Mills"
                    frame={frame}
                    startFrame={75}
                  />
                </FieldWrap>

                {/* DOB — typed */}
                <FieldWrap p={fieldP(2)}>
                  <TypedInput
                    label="Date of birth"
                    text="04 / 18 / 1989"
                    frame={frame}
                    startFrame={95}
                    charsPerFrame={0.7}
                  />
                </FieldWrap>

                <FieldWrap p={fieldP(3)}>
                  <Input label="Sex assigned at birth" value="Female" />
                </FieldWrap>

                <FieldWrap p={fieldP(4)}>
                  <Input label="Phone number" value="(415) 555-0142" />
                </FieldWrap>

                <FieldWrap p={fieldP(5)}>
                  <TypedInput
                    label="Email"
                    text="jordan@example.com"
                    frame={frame}
                    startFrame={115}
                    charsPerFrame={0.7}
                  />
                </FieldWrap>
              </div>

              {/* Mailing address full-width */}
              <div style={{ marginTop: 18 }}>
                <FieldWrap p={fieldP(6)}>
                  <Input
                    label="Mailing address"
                    value="221 Larkspur Lane, Boulder CO 80302"
                  />
                </FieldWrap>
              </div>
            </div>

            {/* RIGHT CARD — Payment on file */}
            <div
              style={{
                position: "absolute",
                left: 1180,
                top: 130,
                width: 560,
                background: C.cardSoft,
                borderRadius: 28,
                padding: "40px 36px",
                boxShadow: C.shadowSoft,
                border: `2px solid ${C.lime}`,
                opacity: rightCardP,
                transform: `translateX(${interpolate(rightCardP, [0, 1], [80, 0])}px)`,
              }}
            >
              {/* Label + optional badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 11,
                    color: C.muted,
                    letterSpacing: "0.16em",
                    fontWeight: 500,
                  }}
                >
                  PAYMENT ON FILE
                </span>
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  padding: "3px 10px",
                  background: C.input,
                  borderRadius: 999,
                  fontFamily: FONT_UI,
                  fontSize: 10,
                  color: C.muted,
                  letterSpacing: "0.14em",
                  fontWeight: 500,
                }}
              >
                OPTIONAL
              </div>

              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 42,
                  lineHeight: 1.0,
                  letterSpacing: "-0.01em",
                  color: C.ink,
                  marginTop: 10,
                }}
              >
                Payment method
              </div>
              <div
                style={{
                  fontFamily: FONT_UI,
                  fontSize: 14,
                  color: C.body,
                  marginTop: 10,
                  lineHeight: 1.4,
                  maxWidth: 460,
                }}
              >
                For future labs, medications, or membership renewal. You won't be charged today.
              </div>

              {/* Card brand chips */}
              <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
                <BrandChip label="VISA" bg="#1A1F71" fg="#FFFFFF" />
                <BrandChip label="MC" bg="#EB001B" fg="#FFFFFF" />
                <BrandChip label="AMEX" bg="#2E77BC" fg="#FFFFFF" />
              </div>

              {/* Card number */}
              <div style={{ marginTop: 22 }}>
                <TypedInput
                  label="Card number"
                  text="4242 •••• •••• 9821"
                  frame={frame}
                  startFrame={145}
                  charsPerFrame={0.7}
                />
              </div>

              {/* Expiry / CVC / ZIP row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  marginTop: 14,
                }}
              >
                <Input label="Expiry" value="08 / 27" />
                <Input label="CVC" value="•••" />
                <Input label="ZIP" value="80302" />
              </div>

              {/* Lime info banner */}
              <div
                style={{
                  marginTop: 22,
                  background: C.limeSoft,
                  borderRadius: RADIUS.input,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  opacity: bannerP,
                  transform: `translateY(${interpolate(bannerP, [0, 1], [10, 0])}px)`,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ flexShrink: 0, marginTop: 2 }}
                >
                  <circle cx="12" cy="12" r="10" fill={C.sageDeep} />
                  <path
                    d="M7 12l3.5 3.5L17 9"
                    stroke="#F4EFE2"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 12,
                    color: C.ink,
                    lineHeight: 1.4,
                  }}
                >
                  Securely encrypted with TLS 1.3. We never store your full card number.
                </span>
              </div>
            </div>

            {/* Submit button bottom-right */}
            <div
              style={{
                position: "absolute",
                right: 36,
                bottom: 28,
                transform: `scale(${1 + submitHoverP * 0.04})`,
                boxShadow: submitHoverP > 0.5 ? `0 0 0 4px rgba(200,255,140,0.35)` : "none",
                borderRadius: 999,
                opacity: rightCardP,
              }}
            >
              <PillButton variant="lime" size="md" label="Submit Registration" />
            </div>

            <Cursor frame={frame} waypoints={cursorWaypoints} />
          </>
        );
      }}
    </SceneShell>
  );
};

// --- Helpers ---

const FieldWrap: React.FC<{ p: number; children: React.ReactNode }> = ({ p, children }) => (
  <div
    style={{
      opacity: p,
      transform: `translateY(${interpolate(p, [0, 1], [14, 0])}px)`,
    }}
  >
    {children}
  </div>
);

const TypedInput: React.FC<{
  label: string;
  text: string;
  frame: number;
  startFrame: number;
  charsPerFrame?: number;
}> = ({ label, text, frame, startFrame, charsPerFrame = 0.6 }) => {
  const local = Math.max(0, frame - startFrame);
  const typingActive = local >= 0 && local * charsPerFrame < text.length + 4;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
        <Typewriter text={text} frame={frame} startFrame={startFrame} charsPerFrame={charsPerFrame} />
      </div>
    </div>
  );
};

const BrandChip: React.FC<{ label: string; bg: string; fg: string }> = ({ label, bg, fg }) => (
  <div
    style={{
      width: 50,
      height: 32,
      background: bg,
      color: fg,
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT_UI,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.04em",
    }}
  >
    {label}
  </div>
);
