import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY, FONT_UI } from "../ui/tokens";
import { SceneShell, innerToAbs } from "../ui/SceneShell";
import { PillButton } from "../ui/PillButton";
import { Cursor, CursorWaypoint } from "../ui/Cursor";
import { TopNav } from "../ui/TopNav";
import { Sidebar } from "../ui/Sidebar";
import { Stepper } from "../ui/Stepper";
import { SLINGSHOT, SNAPPY, SOFT, EASE_OUT } from "../animation/springs";

type Props = { durationInFrames: number };

export const Scene11AppointmentBooking: React.FC<Props> = ({ durationInFrames }) => {
  const { fps } = useVideoConfig();

  return (
    <SceneShell
      url="app.portal.health/appointments/new"
      tabTitle="Book Appointment"
      durationInFrames={durationInFrames}
    >
      {(frame) => {
        // Reveal beats
        const topNavP = interpolate(frame, [14, 35], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const sidebarP = spring({ frame: frame - 18, fps, config: SNAPPY });
        const headingP = spring({ frame: frame - 25, fps, config: SOFT });
        const stepperBaseP = spring({ frame: frame - 38, fps, config: SOFT });

        // Provider cards stagger from left starting frame 50
        const card1P = spring({ frame: frame - 50, fps, config: SLINGSHOT });
        const card2P = spring({ frame: frame - 62, fps, config: SLINGSHOT });
        const card3P = spring({ frame: frame - 74, fps, config: SLINGSHOT });

        // Card 1 selection: cursor hovers ~150, click ~160 → border + badge animate after 160
        const card1HoverP = spring({ frame: frame - 145, fps, config: SNAPPY });
        const card1SelectedP = interpolate(frame, [160, 195], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const selectedBadgeP = spring({ frame: frame - 165, fps, config: SLINGSHOT });

        // Stepper advance: 1→completed, 2→active at frame ~190
        const step1AdvanceP = interpolate(frame, [185, 220], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        // Right column - Appointment type card slings in from right
        const apptTypeCardP = spring({ frame: frame - 230, fps, config: SLINGSHOT });

        // Click Initial Consultation ~320 → lime fill animates
        const initialConsultP = interpolate(frame, [320, 350], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const apptHoverP = spring({ frame: frame - 305, fps, config: SNAPPY });

        // Stepper advance again: 2→completed, 3→active at frame ~340
        const step2AdvanceP = interpolate(frame, [340, 380], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        // Date & time calendar card slings in
        const calendarCardP = spring({ frame: frame - 400, fps, config: SLINGSHOT });

        // Click date 17 ~510 → date scales up
        const date17HoverP = spring({ frame: frame - 495, fps, config: SNAPPY });
        const date17SelectedP = interpolate(frame, [510, 540], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        // Click 10:00 AM ~580 → pill fills lime
        const timeHoverP = spring({ frame: frame - 565, fps, config: SNAPPY });
        const timeSelectedP = interpolate(frame, [580, 605], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        // Final Confirm button scale-bounces in
        const confirmP = spring({ frame: frame - 605, fps, config: SLINGSHOT });

        const SIDEBAR_W = 220;

        const cursorWaypoints: CursorWaypoint[] = [
          { ...innerToAbs(200, 1000), at: 0 },
          { ...innerToAbs(500, 280), at: 150 }, // hover Dr. Sarah Mitchell card
          { ...innerToAbs(500, 280), at: 160, click: true },
          { ...innerToAbs(500, 280), at: 175 },
          { ...innerToAbs(1200, 290), at: 320 }, // Click Initial Consultation
          { ...innerToAbs(1200, 290), at: 325, click: true },
          { ...innerToAbs(1200, 290), at: 340 },
          { ...innerToAbs(1320, 660), at: 510 }, // click date 17
          { ...innerToAbs(1320, 660), at: 515, click: true },
          { ...innerToAbs(1320, 660), at: 525 },
          { ...innerToAbs(1250, 780), at: 580 }, // click 10:00 AM
          { ...innerToAbs(1250, 780), at: 585, click: true },
          { ...innerToAbs(1250, 780), at: 660 },
        ];

        // Stepper state — derive from beats
        const stepperSteps: Array<{ label: string; status: "completed" | "active" | "upcoming" }> = [
          {
            label: "Select Provider",
            status: step1AdvanceP > 0.5 ? "completed" : "active",
          },
          {
            label: "Appointment Type",
            status:
              step2AdvanceP > 0.5
                ? "completed"
                : step1AdvanceP > 0.5
                  ? "active"
                  : "upcoming",
          },
          {
            label: "Date & Time",
            status: step2AdvanceP > 0.5 ? "active" : "upcoming",
          },
        ];

        return (
          <>
            {/* Portal shell */}
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
                      { label: "My Appointments", active: true },
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
                    padding: "32px 36px 36px 40px",
                  }}
                >
                  {/* Top row: label + Meet providers link */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      opacity: headingP,
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
                      NEW BOOKING
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_UI,
                        fontSize: 12,
                        color: C.sageDeep,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Meet our providers
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 17L17 7M17 7H8M17 7V16"
                          stroke={C.sageDeep}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Heading */}
                  <div
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 78,
                      color: C.ink,
                      lineHeight: 0.95,
                      letterSpacing: "-0.015em",
                      marginTop: 8,
                      opacity: headingP,
                      transform: `translateY(${interpolate(headingP, [0, 1], [10, 0])}px)`,
                    }}
                  >
                    Book a visit.
                  </div>

                  {/* Stepper */}
                  <div
                    style={{
                      marginTop: 24,
                      opacity: stepperBaseP,
                      transform: `translateY(${interpolate(stepperBaseP, [0, 1], [8, 0])}px)`,
                    }}
                  >
                    <Stepper steps={stepperSteps} />
                  </div>

                  {/* Two column layout */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 440px",
                      gap: 24,
                      marginTop: 28,
                      alignItems: "flex-start",
                    }}
                  >
                    {/* LEFT — provider cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <ProviderCard
                        initials="DS"
                        name="Dr. Sarah Mitchell, NP"
                        role="Nurse Practitioner · 8 yrs"
                        licenses="Licensed · CA · CO · NY · TX · +18"
                        progress={card1P}
                        selectedT={card1SelectedP}
                        hoverT={card1HoverP}
                        selectedBadgeT={selectedBadgeP}
                      />
                      <ProviderCard
                        initials="DM"
                        name="Dr. Marcus Okafor, MD"
                        role="Internal Medicine · 12 yrs"
                        licenses="Licensed · CA · NV · OR · WA · +14"
                        progress={card2P}
                        selectedT={0}
                        hoverT={0}
                        selectedBadgeT={0}
                      />
                      <ProviderCard
                        initials="DL"
                        name="Dr. Lin Reyes, NP"
                        role="Functional Medicine · 4 yrs"
                        licenses="Licensed · CO · FL · NY · TX · +10"
                        progress={card3P}
                        selectedT={0}
                        hoverT={0}
                        selectedBadgeT={0}
                      />
                    </div>

                    {/* RIGHT — preview cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {/* Appointment type */}
                      <div
                        style={{
                          background: C.card,
                          borderRadius: 24,
                          padding: "20px 22px",
                          border: `1px solid ${C.cardBorder}`,
                          boxShadow: C.shadowSoft,
                          opacity: apptTypeCardP,
                          transform: `translateX(${interpolate(apptTypeCardP, [0, 1], [40, 0])}px)`,
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
                          STEP 2 · COMING UP
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
                          Appointment type
                        </div>

                        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
                          <ApptTypeRow
                            label="Initial Consultation"
                            duration="45 min"
                            selectedT={initialConsultP}
                            hoverT={apptHoverP}
                          />
                          <ApptTypeRow label="Follow-up" duration="25 min" selectedT={0} hoverT={0} />
                          <ApptTypeRow label="Lab review" duration="20 min" selectedT={0} hoverT={0} />
                          <ApptTypeRow label="Urgent" duration="10 min" selectedT={0} hoverT={0} />
                        </div>
                      </div>

                      {/* Date & time */}
                      <div
                        style={{
                          background: C.card,
                          borderRadius: 24,
                          padding: "20px 22px",
                          border: `1px solid ${C.cardBorder}`,
                          boxShadow: C.shadowSoft,
                          opacity: calendarCardP,
                          transform: `translateX(${interpolate(calendarCardP, [0, 1], [40, 0])}px)`,
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
                          STEP 3 · COMING UP
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
                          Date &amp; time
                        </div>

                        {/* Calendar grid */}
                        <CalendarGrid
                          selectedT={date17SelectedP}
                          hoverT={date17HoverP}
                        />

                        {/* Time pills */}
                        <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <TimePill label="9:00 AM" selectedT={0} hoverT={0} />
                          <TimePill
                            label="10:00 AM"
                            selectedT={timeSelectedP}
                            hoverT={timeHoverP}
                          />
                          <TimePill label="11:30 AM" selectedT={0} hoverT={0} />
                          <TimePill label="2:00 PM" selectedT={0} hoverT={0} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer row */}
                  <div
                    style={{
                      marginTop: 24,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      opacity: headingP,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONT_UI,
                        fontSize: 12,
                        color: C.muted,
                      }}
                    >
                      {card1SelectedP > 0.5 ? "1 provider selected" : "0 providers selected"} · Step{" "}
                      {step2AdvanceP > 0.5 ? "3" : step1AdvanceP > 0.5 ? "2" : "1"} of 3
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 12,
                          color: C.sageDeep,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        Meet Our Providers
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M7 17L17 7M17 7H8M17 7V16"
                            stroke={C.sageDeep}
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      {/* Confirm pill */}
                      <div
                        style={{
                          opacity: confirmP,
                          transform: `scale(${interpolate(confirmP, [0, 1], [0.7, 1])})`,
                        }}
                      >
                        <PillButton variant="lime" size="md" label="Confirm" />
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

const ProviderCard: React.FC<{
  initials: string;
  name: string;
  role: string;
  licenses: string;
  progress: number;
  selectedT: number;
  hoverT: number;
  selectedBadgeT: number;
}> = ({ initials, name, role, licenses, progress, selectedT, hoverT, selectedBadgeT }) => {
  // Border interpolates from divider→lime
  const borderWidth = 1 + selectedT * 1;

  return (
    <div
      style={{
        background: C.card,
        borderRadius: 24,
        padding: "20px 24px",
        border: `${borderWidth}px solid ${selectedT > 0 ? C.lime : C.cardBorder}`,
        boxShadow:
          hoverT > 0.5 && selectedT < 0.5
            ? `0 0 0 3px rgba(200,255,140,0.25)`
            : C.shadowSoft,
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [-50, 0])}px) scale(${1 + hoverT * 0.01})`,
        display: "flex",
        gap: 18,
        position: "relative",
      }}
    >
      {/* Avatar with diagonal stripe pattern */}
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 20,
          background: `repeating-linear-gradient(45deg, ${C.sage}, ${C.sage} 6px, rgba(122,139,94,0.55) 6px, rgba(122,139,94,0.55) 12px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.invertedInk,
          fontFamily: FONT_UI,
          fontSize: 22,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: C.cardSoft,
            color: C.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT_UI,
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          {initials}
        </div>
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
          {name}
        </div>
        <div
          style={{
            fontFamily: FONT_UI,
            fontSize: 13,
            color: C.muted,
            marginTop: 2,
          }}
        >
          {role}
        </div>
        <div
          style={{
            fontFamily: FONT_UI,
            fontSize: 12,
            color: C.muted,
            marginTop: 6,
          }}
        >
          {licenses}
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <span
            style={{
              padding: "4px 10px",
              background: "rgba(122,139,94,0.16)",
              color: C.sageDeep,
              borderRadius: 999,
              fontFamily: FONT_UI,
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            Accepting new patients
          </span>
          <span
            style={{
              padding: "4px 10px",
              background: "rgba(122,139,94,0.16)",
              color: C.sageDeep,
              borderRadius: 999,
              fontFamily: FONT_UI,
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            Next available · Tue
          </span>
        </div>
      </div>

      {/* Right — "Select" pill OR "Selected" lime badge */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {selectedT > 0 ? (
          <div
            style={{
              opacity: selectedBadgeT,
              transform: `scale(${interpolate(selectedBadgeT, [0, 1], [0.5, 1])})`,
              padding: "8px 14px",
              background: C.lime,
              color: C.ink,
              borderRadius: 999,
              fontFamily: FONT_UI,
              fontSize: 13,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12l5 5 9-11"
                stroke={C.ink}
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Selected
          </div>
        ) : (
          <PillButton variant="white" size="sm" label="Select" showArrow={false} />
        )}
      </div>

      {/* SELECTED corner tag */}
      {selectedT > 0 && (
        <div
          style={{
            position: "absolute",
            top: -10,
            right: 24,
            background: C.lime,
            color: C.ink,
            fontFamily: FONT_UI,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            padding: "3px 10px",
            borderRadius: 999,
            opacity: selectedBadgeT,
            transform: `scale(${interpolate(selectedBadgeT, [0, 1], [0.5, 1])})`,
          }}
        >
          SELECTED
        </div>
      )}
    </div>
  );
};

const ApptTypeRow: React.FC<{
  label: string;
  duration: string;
  selectedT: number;
  hoverT: number;
}> = ({ label, duration, selectedT, hoverT }) => {
  const bg = selectedT > 0 ? `rgba(200,255,140,${0.55 * selectedT})` : "transparent";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        borderRadius: 12,
        background: bg,
        border: selectedT > 0.5 ? `1.5px solid ${C.lime}` : "1.5px solid transparent",
        transform: `scale(${1 + hoverT * 0.01})`,
      }}
    >
      <span
        style={{
          fontFamily: FONT_UI,
          fontSize: 14,
          color: C.ink,
          fontWeight: selectedT > 0.5 ? 600 : 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: FONT_UI,
          fontSize: 12,
          color: C.muted,
        }}
      >
        {duration}
      </span>
    </div>
  );
};

const CalendarGrid: React.FC<{ selectedT: number; hoverT: number }> = ({ selectedT, hoverT }) => {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  // 35-day grid starting Sunday — we'll show typical Oct layout
  // Padding: 4 empty cells for Oct 1 = Wed
  const cells: Array<{ day: number | null; highlighted?: boolean; selected?: boolean }> = [];
  for (let i = 0; i < 3; i++) cells.push({ day: null });
  for (let d = 1; d <= 31; d++) {
    const highlighted = [10, 17, 20, 24].includes(d);
    cells.push({ day: d, highlighted, selected: d === 17 });
  }
  while (cells.length < 35) cells.push({ day: null });

  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          marginBottom: 6,
        }}
      >
        {days.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontFamily: FONT_UI,
              fontSize: 10,
              color: C.muted,
              fontWeight: 500,
              letterSpacing: "0.08em",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}
      >
        {cells.map((c, i) => {
          if (c.day === null) {
            return <div key={i} style={{ height: 28 }} />;
          }
          const isSelected = c.selected;
          const selectScale = isSelected ? 1 + selectedT * 0.05 : 1;
          const hoverScale = isSelected ? 1 + hoverT * 0.02 : 1;
          const bg = isSelected
            ? `rgba(200,255,140,${selectedT})`
            : c.highlighted
              ? "rgba(200,255,140,0.4)"
              : "transparent";
          const color = isSelected && selectedT > 0.5 ? C.ink : c.highlighted ? C.ink : C.body;
          const fontWeight = c.highlighted || isSelected ? 600 : 400;
          const border =
            isSelected && selectedT > 0.5
              ? `1.5px solid ${C.lime}`
              : "1.5px solid transparent";
          return (
            <div
              key={i}
              style={{
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: bg,
                color,
                fontFamily: FONT_UI,
                fontSize: 12,
                fontWeight,
                borderRadius: 8,
                border,
                transform: `scale(${selectScale * hoverScale})`,
              }}
            >
              {c.day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TimePill: React.FC<{ label: string; selectedT: number; hoverT: number }> = ({
  label,
  selectedT,
  hoverT,
}) => {
  const bg = selectedT > 0 ? `rgba(200,255,140,${selectedT})` : C.card;
  const border = selectedT > 0.5 ? `1.5px solid ${C.lime}` : `1px solid ${C.divider}`;
  return (
    <div
      style={{
        padding: "8px 14px",
        background: bg,
        border,
        borderRadius: 999,
        fontFamily: FONT_UI,
        fontSize: 12,
        color: C.ink,
        fontWeight: selectedT > 0.5 ? 600 : 500,
        transform: `scale(${1 + hoverT * 0.02})`,
      }}
    >
      {label}
    </div>
  );
};
