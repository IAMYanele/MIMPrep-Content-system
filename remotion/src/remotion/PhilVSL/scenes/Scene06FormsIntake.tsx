import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../ui/tokens";
import { SceneShell, innerToAbs } from "../ui/SceneShell";
import { PillButton } from "../ui/PillButton";
import { Cursor, CursorWaypoint } from "../ui/Cursor";
import { TopNav } from "../ui/TopNav";
import { Sidebar } from "../ui/Sidebar";
import { Stepper } from "../ui/Stepper";
import { SLINGSHOT, SNAPPY, EASE_OUT } from "../animation/springs";

type Props = { durationInFrames: number };

export const Scene06FormsIntake: React.FC<Props> = ({ durationInFrames }) => {
  const { fps } = useVideoConfig();

  return (
    <SceneShell
      url="app.portal.health/forms"
      tabTitle="Forms & Consents"
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
        const titleP = interpolate(frame, [22, 50], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        // Listing rows stagger
        const rowP = (i: number) =>
          spring({ frame: frame - (30 + i * 8), fps, config: SNAPPY });

        // "Fill out" button hover/click ~115f
        const fillOutHover = spring({ frame: frame - 100, fps, config: SNAPPY });

        // Form opens at frame ~130 — listing shrinks, right form panel slides in
        const formOpenP = spring({ frame: frame - 130, fps, config: SLINGSHOT });

        // Stepper + heading on right
        const stepperP = spring({ frame: frame - 180, fps, config: SNAPPY });
        const askP = interpolate(frame, [195, 220], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        // Selection card stagger
        const cardP = (i: number) =>
          spring({ frame: frame - (220 + i * 6), fps, config: SNAPPY });

        // Card click frames — fill starts 1 frame BEFORE the click ripple so
        // the box reads as ticked the instant the cursor lands. Completes in
        // 5 frames for a snappy feel.
        const checkAt = (clickFrame: number) =>
          interpolate(frame, [clickFrame - 1, clickFrame + 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        const peptideChecked = checkAt(315);
        const hormoneChecked = checkAt(365);
        const sleepChecked = checkAt(415);
        const sexualChecked = checkAt(465);

        // Selection count pulse — at each click
        const counterPulse = (clickFrame: number) =>
          interpolate(frame, [clickFrame, clickFrame + 4, clickFrame + 10], [1, 1.15, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        const counter =
          (peptideChecked > 0.5 ? 1 : 0) +
          (hormoneChecked > 0.5 ? 1 : 0) +
          (sleepChecked > 0.5 ? 1 : 0) +
          (sexualChecked > 0.5 ? 1 : 0);
        const counterScale = Math.max(
          counterPulse(315),
          counterPulse(365),
          counterPulse(415),
          counterPulse(465),
        );

        // Save & continue hover
        const saveHover = spring({ frame: frame - 600, fps, config: SNAPPY });

        const SIDEBAR_W = 220;

        // Cursor waypoints — coords are in chrome-body space (0..1760 × 0..876).
        // Card centres in the 2×3 grid (Peptide top-left, Cognitive bottom-right):
        //   col 0 ≈ x 1000   col 1 ≈ x 1450
        //   row 1 ≈ y 420    row 2 ≈ y 555   row 3 ≈ y 690
        const cursorWaypoints: CursorWaypoint[] = [
          { ...innerToAbs(120, 820), at: 0 },
          { ...innerToAbs(400, 290), at: 95 }, // hover Fill out
          { ...innerToAbs(400, 290), at: 115, click: true },
          { ...innerToAbs(400, 290), at: 140 },
          { ...innerToAbs(1000, 420), at: 310 }, // → Peptide (col 0, row 1)
          { ...innerToAbs(1000, 420), at: 315, click: true },
          { ...innerToAbs(1450, 420), at: 360 }, // → Hormone (col 1, row 1)
          { ...innerToAbs(1450, 420), at: 365, click: true },
          { ...innerToAbs(1450, 555), at: 410 }, // → Sleep (col 1, row 2)
          { ...innerToAbs(1450, 555), at: 415, click: true },
          { ...innerToAbs(1000, 690), at: 460 }, // → Sexual wellness (col 0, row 3)
          { ...innerToAbs(1000, 690), at: 465, click: true },
          { ...innerToAbs(1000, 690), at: 540 },
          { ...innerToAbs(1600, 800), at: 610 }, // → Save & continue (lime pill, bottom-right)
          { ...innerToAbs(1600, 800), at: 615, click: true },
          { ...innerToAbs(1600, 800), at: 645 },
        ];

        // Listing shifts left as form opens
        const listingShift = interpolate(formOpenP, [0, 1], [0, -40]);
        const listingScale = interpolate(formOpenP, [0, 1], [1, 0.96]);
        const listingOpacity = interpolate(formOpenP, [0, 1], [1, 0.55]);

        // Right form panel slide-in
        const formX = interpolate(formOpenP, [0, 1], [200, 0]);

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
                      { label: "My Forms", active: true },
                      { label: "My Account" },
                    ]}
                  />
                </div>

                {/* Content */}
                <div
                  style={{
                    flex: 1,
                    background: C.page,
                    position: "relative",
                    padding: "30px 32px 30px 32px",
                    overflow: "hidden",
                    display: "flex",
                    gap: 24,
                  }}
                >
                  {/* LEFT COLUMN — listing */}
                  <div
                    style={{
                      width: 460,
                      flexShrink: 0,
                      transform: `translateX(${listingShift}px) scale(${listingScale})`,
                      transformOrigin: "0 0",
                      opacity: listingOpacity,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONT_UI,
                        fontSize: 12,
                        color: C.muted,
                        opacity: titleP,
                      }}
                    >
                      Dashboard / My Forms & Consents
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 56,
                        color: C.ink,
                        marginTop: 4,
                        letterSpacing: "-0.02em",
                        lineHeight: 0.98,
                        opacity: titleP,
                        transform: `translateY(${interpolate(titleP, [0, 1], [10, 0])}px)`,
                      }}
                    >
                      Forms & Consents
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 18,
                        opacity: titleP,
                      }}
                    >
                      <span style={{ fontFamily: FONT_UI, fontSize: 13, color: C.body }}>
                        4 forms · <span style={{ color: C.amber, fontWeight: 500 }}>1 pending</span>
                      </span>
                      <span style={{ fontFamily: FONT_UI, fontSize: 12, color: C.muted }}>
                        Filter ↘
                      </span>
                    </div>

                    {/* Rows */}
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                      <FormRow
                        title="Comprehensive Wellness Intake"
                        status="pending"
                        p={rowP(0)}
                        hover={fillOutHover}
                      />
                      <FormRow title="Informed Consent" status="completed" p={rowP(1)} />
                      <FormRow title="HIPAA Authorization" status="completed" p={rowP(2)} />
                      <FormRow title="Telehealth Acknowledgement" status="completed" p={rowP(3)} />
                    </div>
                  </div>

                  {/* RIGHT COLUMN — form panel (opens at ~130) */}
                  <div
                    style={{
                      flex: 1,
                      background: C.card,
                      borderRadius: 24,
                      padding: "28px 32px 24px 32px",
                      border: `1px solid ${C.cardBorder}`,
                      boxShadow: C.shadowSoft,
                      opacity: formOpenP,
                      transform: `translateX(${formX}px)`,
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0,
                    }}
                  >
                    {/* Top labels */}
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
                        FORM 1 OF 4
                      </span>
                      <span style={{ fontFamily: FONT_UI, fontSize: 12, color: C.muted }}>
                        Section 1 of 6 · 12 min
                      </span>
                    </div>

                    <div
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 44,
                        color: C.ink,
                        marginTop: 6,
                        letterSpacing: "-0.015em",
                        lineHeight: 1.0,
                      }}
                    >
                      Comprehensive Wellness Intake
                    </div>

                    {/* Stepper */}
                    <div
                      style={{
                        marginTop: 18,
                        opacity: stepperP,
                        transform: `translateY(${interpolate(stepperP, [0, 1], [8, 0])}px)`,
                      }}
                    >
                      <Stepper
                        steps={[
                          { label: "Treatment Areas", status: "active" },
                          { label: "Medical History", status: "upcoming" },
                          { label: "Family History", status: "upcoming" },
                          { label: "Medications", status: "upcoming" },
                          { label: "Health Goals", status: "upcoming" },
                          { label: "Interests", status: "upcoming" },
                        ]}
                      />
                    </div>

                    {/* Question heading */}
                    <div
                      style={{
                        marginTop: 22,
                        opacity: askP,
                        transform: `translateY(${interpolate(askP, [0, 1], [8, 0])}px)`,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 32,
                          color: C.ink,
                          letterSpacing: "-0.01em",
                          lineHeight: 1.05,
                        }}
                      >
                        Which areas can we help you with?
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 14,
                          color: C.muted,
                          marginTop: 6,
                        }}
                      >
                        Select all that apply. You can add more later.
                      </div>
                    </div>

                    {/* 2x3 grid of selection cards */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 14,
                        marginTop: 20,
                      }}
                    >
                      <SelectCard
                        title="Peptide therapy"
                        subtitle="BPC-157, GLP-1, GHK-Cu"
                        checked={peptideChecked}
                        p={cardP(0)}
                      />
                      <SelectCard
                        title="Hormone optimization"
                        subtitle="Testosterone, estrogen, thyroid"
                        checked={hormoneChecked}
                        p={cardP(1)}
                      />
                      <SelectCard
                        title="Weight management"
                        subtitle="Metabolic + GLP-1 programs"
                        checked={0}
                        p={cardP(2)}
                      />
                      <SelectCard
                        title="Sleep & recovery"
                        subtitle="Resilience and circadian support"
                        checked={sleepChecked}
                        p={cardP(3)}
                      />
                      <SelectCard
                        title="Sexual wellness"
                        subtitle="Performance and libido"
                        checked={sexualChecked}
                        p={cardP(4)}
                      />
                      <SelectCard
                        title="Cognitive performance"
                        subtitle="Nootropics"
                        checked={0}
                        p={cardP(5)}
                      />
                    </div>

                    {/* Bottom row */}
                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: 18,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 13,
                          color: C.muted,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            transform: `scale(${counterScale})`,
                            color: C.ink,
                            fontWeight: 500,
                            transformOrigin: "center",
                          }}
                        >
                          {counter} of 6 selected
                        </span>
                        · Auto-saving
                      </span>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <PillButton variant="white" size="md" label="Save for later" showArrow={false} />
                        <div
                          style={{
                            transform: `scale(${1 + saveHover * 0.05})`,
                            boxShadow:
                              saveHover > 0.5 ? `0 0 0 4px rgba(200,255,140,0.35)` : "none",
                            borderRadius: 999,
                          }}
                        >
                          <PillButton variant="lime" size="md" label="Save & continue" />
                        </div>
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

const FormRow: React.FC<{
  title: string;
  status: "pending" | "completed";
  p: number;
  hover?: number;
}> = ({ title, status, p, hover = 0 }) => {
  const pending = status === "pending";
  const bg = pending ? C.limeSoft : C.card;
  const border = pending ? `1.5px solid ${C.lime}` : `1px solid ${C.cardBorder}`;
  return (
    <div
      style={{
        background: bg,
        borderRadius: 18,
        padding: "16px 18px",
        border,
        boxShadow: C.shadowSoft,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [16, 0])}px)`,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: pending ? "rgba(200,255,140,0.5)" : C.cardSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {pending ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect
              x="4"
              y="3"
              width="16"
              height="18"
              rx="2"
              stroke={C.ink}
              strokeWidth="1.6"
            />
            <path
              d="M8 8h8M8 12h8M8 16h5"
              stroke={C.ink}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill={C.sage} />
            <path
              d="M7 12l3.5 3.5L17 9"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_UI, fontSize: 14, color: C.ink, fontWeight: 500 }}>
          {title}
        </div>
        <div style={{ marginTop: 4 }}>
          {pending ? (
            <span
              style={{
                background: C.amberSoft,
                color: C.amber,
                fontFamily: FONT_UI,
                fontSize: 11,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              Not started
            </span>
          ) : (
            <span
              style={{
                background: "rgba(122,139,94,0.16)",
                color: C.sageDeep,
                fontFamily: FONT_UI,
                fontSize: 11,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              ✓ Completed
            </span>
          )}
        </div>
      </div>

      {pending ? (
        <div
          style={{
            transform: `scale(${1 + hover * 0.05})`,
            boxShadow: hover > 0.5 ? `0 0 0 4px rgba(200,255,140,0.35)` : "none",
            borderRadius: 999,
          }}
        >
          <PillButton variant="lime" size="sm" label="Fill out" />
        </div>
      ) : (
        <span style={{ fontFamily: FONT_UI, fontSize: 12, color: C.muted }}>View →</span>
      )}
    </div>
  );
};

const SelectCard: React.FC<{
  title: string;
  subtitle: string;
  checked: number; // 0..1
  p: number;
}> = ({ title, subtitle, checked, p }) => {
  const isOn = checked > 0.5;
  return (
    <div
      style={{
        background: isOn ? "rgba(200,255,140,0.16)" : C.cardSoft,
        border: isOn ? `2px solid ${C.sage}` : `1px solid ${C.cardBorder}`,
        borderRadius: 18,
        padding: "16px 18px",
        minHeight: 100,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [22, 0])}px) scale(${interpolate(
          checked,
          [0, 1],
          [1, 1.02],
        )})`,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: isOn ? C.sage : "transparent",
          border: isOn ? `1.5px solid ${C.sage}` : `1.5px solid ${C.muted}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {isOn && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12l5 5 9-11"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="30"
              strokeDashoffset={interpolate(checked, [0.5, 1], [30, 0])}
            />
          </svg>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_UI, fontSize: 15, color: C.ink, fontWeight: 500 }}>
          {title}
        </div>
        <div
          style={{
            fontFamily: FONT_UI,
            fontSize: 12,
            color: C.muted,
            marginTop: 4,
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};
