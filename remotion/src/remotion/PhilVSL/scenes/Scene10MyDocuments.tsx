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

export const Scene10MyDocuments: React.FC<Props> = ({ durationInFrames }) => {
  const { fps } = useVideoConfig();

  return (
    <SceneShell
      url="app.portal.health/documents"
      tabTitle="My Documents"
      durationInFrames={durationInFrames}
    >
      {(frame) => {
        // Beat: shell already at 0-14 via SceneShell
        const topNavP = interpolate(frame, [14, 35], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const sidebarP = spring({ frame: frame - 18, fps, config: SNAPPY });
        const headingP = spring({ frame: frame - 22, fps, config: SOFT });
        const uploadPillP = spring({ frame: frame - 28, fps, config: SNAPPY });

        // Background rows stagger
        const row0P = spring({ frame: frame - 32, fps, config: SNAPPY });
        const row1P = spring({ frame: frame - 40, fps, config: SNAPPY });
        const row2P = spring({ frame: frame - 48, fps, config: SNAPPY });

        // Cursor hovers upload button at ~80, click ~85
        const uploadHoverP = spring({ frame: frame - 75, fps, config: SNAPPY });

        // Scrim fades in from 90 onward
        const scrimP = interpolate(frame, [90, 120], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        // Modal slings up from 95-130
        const modalP = spring({ frame: frame - 95, fps, config: SLINGSHOT });
        const modalHeadingP = interpolate(frame, [130, 168], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });

        // Dropzone bounces in 165-210
        const dropzoneP = spring({ frame: frame - 165, fps, config: SLINGSHOT });

        // Subtle pulse for dropzone background
        const pulsePhase = Math.max(0, frame - 200);
        const pulse = (Math.sin(pulsePhase / 12) + 1) / 2;

        // Dashed stroke shimmer — animate dashoffset
        const dashOffset = -((frame * 0.6) % 32);

        // File drop animation 220-280
        // File falls from -200 (above zone) to landing position 0
        const fileDropP = interpolate(frame, [220, 260], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const fileBounceP = spring({ frame: frame - 258, fps, config: SLINGSHOT });
        const fileY = interpolate(fileDropP, [0, 1], [-200, 0]);
        const fileBounce = interpolate(fileBounceP, [0, 1], [0, 1]);
        // Icon scale pulse when file lands
        const iconPulseP = spring({ frame: frame - 270, fps, config: SLINGSHOT });
        const iconScale = 1 + interpolate(iconPulseP, [0, 0.5, 1], [0, 0.15, 0]) * 1;

        // Success flash 280-340 — bg interpolates sage→lime→sage
        const flashT = interpolate(frame, [280, 305, 340], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // File chip appears 340-380
        const fileChipP = spring({ frame: frame - 340, fps, config: SNAPPY });

        // Info card slides in 380-430
        const infoCardP = spring({ frame: frame - 380, fps, config: SNAPPY });

        // Cursor click on Upload button ~485
        const uploadBtnHoverP = spring({ frame: frame - 475, fps, config: SNAPPY });
        // Upload button confirm bounce 500-550
        const confirmBounceP = spring({ frame: frame - 500, fps, config: SLINGSHOT });
        const confirmScale = 1 + interpolate(confirmBounceP, [0, 0.4, 1], [0, 0.08, 0]) * 1;

        // ---- Constants
        const SIDEBAR_W = 220;
        const innerW = 1760;
        const innerH = 876;

        // Modal dims
        const modalW = 700;
        const modalH = 600;
        const modalLeft = (innerW - modalW) / 2; // ≈ 530
        const modalTop = (innerH - modalH) / 2 - 30; // a bit above center

        // Upload pill in top-right of background ≈ (1620, 110)
        // Dropzone center ≈ inner: chromeX modalLeft + 30 + 320, chromeY modalTop + 180 + 140
        // Upload button bottom-right of modal ≈ inner: (modalLeft + modalW - 110, modalTop + modalH - 60)

        const cursorWaypoints: CursorWaypoint[] = [
          { ...innerToAbs(-60, 960), at: 0 },
          { ...innerToAbs(1620, 110), at: 80 },
          { ...innerToAbs(1620, 110), at: 85, click: true },
          { ...innerToAbs(1620, 110), at: 95 },
          { ...innerToAbs(modalLeft + 350, modalTop + 280), at: 250 }, // drift to dropzone
          { ...innerToAbs(modalLeft + 350, modalTop + 280), at: 430 },
          { ...innerToAbs(modalLeft + modalW - 110, modalTop + modalH - 60), at: 475 },
          { ...innerToAbs(modalLeft + modalW - 110, modalTop + modalH - 60), at: 485, click: true },
          { ...innerToAbs(modalLeft + modalW - 110, modalTop + modalH - 60), at: 600 },
        ];

        // Dropzone bg color — base sage soft, blends to lime soft on success flash, plus subtle pulse
        const dropzoneBaseR = 223; // #DFF3B8 lime soft
        const dropzoneBaseG = 243;
        const dropzoneBaseB = 184;
        // Slightly lighter base sage to start
        const dropzoneR = Math.round(245 - flashT * (245 - dropzoneBaseR));
        const dropzoneG = Math.round(248 - flashT * (248 - dropzoneBaseG));
        const dropzoneB = Math.round(220 - flashT * (220 - dropzoneBaseB));
        const dropzoneBg = `rgba(${dropzoneR}, ${dropzoneG}, ${dropzoneB}, ${0.85 + pulse * 0.08})`;

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
                      { label: "My Appointments" },
                      { label: "My Messages", badge: 1 },
                      { label: "My Documents", active: true },
                      { label: "My Forms" },
                      { label: "My Account" },
                    ]}
                  />
                </div>

                {/* Content area — BACKGROUND view (gets dimmed) */}
                <div
                  style={{
                    flex: 1,
                    background: C.page,
                    position: "relative",
                    padding: "32px 40px 40px 40px",
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
                    Dashboard <span style={{ margin: "0 6px" }}>›</span>{" "}
                    <span style={{ color: C.ink }}>My Documents</span>
                  </div>

                  {/* Heading row + Upload pill */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 14,
                      opacity: headingP,
                      transform: `translateY(${interpolate(headingP, [0, 1], [10, 0])}px)`,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 72,
                        color: C.ink,
                        lineHeight: 0.95,
                        letterSpacing: "-0.015em",
                      }}
                    >
                      My Documents
                    </div>
                    <div
                      style={{
                        opacity: uploadPillP,
                        transform: `scale(${interpolate(uploadPillP, [0, 1], [0.85, 1 + uploadHoverP * 0.04])})`,
                        boxShadow:
                          uploadHoverP > 0.5
                            ? `0 0 0 4px rgba(200,255,140,0.35)`
                            : "none",
                        borderRadius: 999,
                        display: "inline-block",
                      }}
                    >
                      <PillButton variant="lime" size="md" label="Upload new document" />
                    </div>
                  </div>

                  {/* Doc list header */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 1fr 200px 160px",
                      alignItems: "center",
                      padding: "16px 22px",
                      marginTop: 28,
                      borderBottom: `1px solid ${C.divider}`,
                      fontFamily: FONT_UI,
                      fontSize: 11,
                      color: C.muted,
                      letterSpacing: "0.14em",
                      fontWeight: 500,
                      opacity: headingP,
                    }}
                  >
                    <span></span>
                    <span>NAME</span>
                    <span>UPLOADED</span>
                    <span>STATUS</span>
                  </div>

                  {/* Rows */}
                  <DocRow
                    name="Driver's License.jpg"
                    uploaded="Oct 12, 2025"
                    statusLabel="Approved"
                    statusColor={C.sage}
                    statusBg="rgba(122,139,94,0.16)"
                    icon="image"
                    progress={row0P}
                  />
                  <DocRow
                    name="Insurance Card.pdf"
                    uploaded="Oct 12, 2025"
                    statusLabel="Under review"
                    statusColor={C.amber}
                    statusBg={C.amberSoft}
                    icon="pdf"
                    progress={row1P}
                    statusIcon="clock"
                  />
                  <DocRow
                    name="Prior Bloodwork - Aug 2025.pdf"
                    uploaded="Oct 12, 2025"
                    statusLabel="Approved"
                    statusColor={C.sage}
                    statusBg="rgba(122,139,94,0.16)"
                    icon="pdf"
                    progress={row2P}
                  />
                </div>
              </div>
            </div>

            {/* SCRIM — dim background */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `rgba(30, 41, 30, ${scrimP * 0.55})`,
                pointerEvents: "none",
              }}
            />

            {/* MODAL */}
            <div
              style={{
                position: "absolute",
                left: innerToAbs(modalLeft, modalTop).x,
                top: innerToAbs(modalLeft, modalTop).y,
                width: modalW,
                height: modalH,
                background: C.card,
                borderRadius: 28,
                boxShadow: C.shadow,
                border: `1px solid ${C.cardBorder}`,
                opacity: modalP,
                transform: `translateY(${interpolate(modalP, [0, 1], [220, 0])}px)`,
                padding: "30px 36px",
                pointerEvents: "none",
              }}
            >
              {/* Top row — label + close */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: modalHeadingP,
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
                  ADD TO CHART
                </div>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: C.cardSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.muted,
                    fontSize: 16,
                  }}
                >
                  ×
                </div>
              </div>

              {/* Modal heading */}
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 38,
                  color: C.ink,
                  marginTop: 12,
                  lineHeight: 1.0,
                  letterSpacing: "-0.01em",
                  opacity: modalHeadingP,
                  transform: `translateY(${interpolate(modalHeadingP, [0, 1], [8, 0])}px)`,
                }}
              >
                Upload lab results
              </div>

              {/* Dropzone */}
              <div
                style={{
                  marginTop: 24,
                  height: 280,
                  width: "100%",
                  borderRadius: 24,
                  background: dropzoneBg,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: dropzoneP,
                  transform: `scale(${interpolate(dropzoneP, [0, 1], [0.9, 1])})`,
                  overflow: "hidden",
                }}
              >
                {/* Animated dashed border via SVG so we can offset stroke */}
                <svg
                  width="100%"
                  height="100%"
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                  }}
                >
                  <rect
                    x="2"
                    y="2"
                    width="calc(100% - 4)"
                    height="calc(100% - 4)"
                    rx="22"
                    ry="22"
                    fill="none"
                    stroke={C.sage}
                    strokeWidth="2"
                    strokeDasharray="14 10"
                    strokeDashoffset={dashOffset}
                  />
                </svg>

                {/* Falling file (only visible during drop) */}
                {frame >= 220 && frame <= 340 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: 72,
                      height: 88,
                      marginLeft: -36,
                      marginTop: -90 - 8,
                      borderRadius: 8,
                      background: C.card,
                      border: `1.5px solid ${C.sage}`,
                      transform: `translateY(${fileY + fileBounce * -6}px) rotate(${interpolate(fileDropP, [0, 1], [-8, 0])}deg)`,
                      opacity: interpolate(frame, [340, 360], [1, 0], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                      display: "flex",
                      flexDirection: "column",
                      padding: 8,
                      boxShadow: "0 6px 14px -6px rgba(30,41,30,0.25)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONT_UI,
                        fontSize: 8,
                        color: C.sage,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                      }}
                    >
                      PDF
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        height: 2,
                        background: C.divider,
                        borderRadius: 1,
                      }}
                    />
                    <div
                      style={{
                        marginTop: 4,
                        height: 2,
                        background: C.divider,
                        borderRadius: 1,
                        width: "70%",
                      }}
                    />
                    <div
                      style={{
                        marginTop: 4,
                        height: 2,
                        background: C.divider,
                        borderRadius: 1,
                      }}
                    />
                  </div>
                )}

                {/* Upload icon circle */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 999,
                    background: C.sageDeep,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${iconScale})`,
                    transition: "none",
                    boxShadow: "0 6px 16px -8px rgba(30,41,30,0.35)",
                  }}
                >
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 16V4M12 4L7 9M12 4L17 9"
                      stroke="#F4EFE2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 19h14"
                      stroke="#F4EFE2"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 18,
                    fontWeight: 600,
                    color: C.ink,
                    marginTop: 14,
                  }}
                >
                  Drag & drop your file here
                </div>
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 14,
                    color: C.sageDeep,
                    marginTop: 4,
                    textDecoration: "underline",
                  }}
                >
                  or click to browse
                </div>
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 12,
                    color: C.muted,
                    marginTop: 10,
                  }}
                >
                  Supported · PDF, JPG, PNG · up to 25 MB
                </div>

                {/* File chip — appears after drop */}
                {frame >= 340 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 14,
                      left: "50%",
                      transform: `translateX(-50%) scale(${interpolate(fileChipP, [0, 1], [0.8, 1])})`,
                      opacity: fileChipP,
                      background: C.card,
                      borderRadius: 999,
                      padding: "6px 14px",
                      border: `1px solid ${C.cardBorder}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: FONT_UI,
                      fontSize: 12,
                      color: C.ink,
                      boxShadow: C.shadowSoft,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 3h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
                        stroke={C.sage}
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>lab_results_oct18.pdf</span>
                    <span style={{ color: C.muted }}>·</span>
                    <span style={{ color: C.muted }}>2.4 MB</span>
                    <span style={{ color: C.sageDeep, fontWeight: 600 }}>✓</span>
                  </div>
                )}
              </div>

              {/* Info card */}
              <div
                style={{
                  marginTop: 18,
                  padding: "14px 16px 14px 18px",
                  background: "rgba(122,139,94,0.08)",
                  borderRadius: 14,
                  borderLeft: `3px solid ${C.sage}`,
                  display: "flex",
                  gap: 12,
                  opacity: infoCardP,
                  transform: `translateY(${interpolate(infoCardP, [0, 1], [12, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: C.sage,
                    color: C.card,
                    fontFamily: FONT_UI,
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  i
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.ink,
                    }}
                  >
                    Requirements for prior bloodwork
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 12,
                      color: C.body,
                      marginTop: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    Bloodwork must be within the last 6 months and include the required biomarkers
                    for your therapy. Your care team will let you know if a re-draw is needed.
                  </div>
                </div>
              </div>

              {/* Bottom row — Cancel + Upload */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 22,
                  opacity: infoCardP,
                }}
              >
                <PillButton variant="white" size="md" label="Cancel" showArrow={false} />
                <div
                  style={{
                    transform: `scale(${confirmScale * (1 + uploadBtnHoverP * 0.03)})`,
                    boxShadow:
                      uploadBtnHoverP > 0.5
                        ? `0 0 0 4px rgba(200,255,140,0.35)`
                        : "none",
                    borderRadius: 999,
                    display: "inline-block",
                  }}
                >
                  <PillButton variant="lime" size="md" label="Upload" />
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

const DocRow: React.FC<{
  name: string;
  uploaded: string;
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  icon: "pdf" | "image";
  progress: number;
  statusIcon?: "check" | "clock";
}> = ({ name, uploaded, statusLabel, statusColor, statusBg, icon, progress, statusIcon = "check" }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr 200px 160px",
        alignItems: "center",
        padding: "18px 22px",
        borderBottom: `1px solid ${C.divider}`,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [10, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: C.cardSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          {icon === "pdf" ? (
            <>
              <path
                d="M6 3h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
                stroke={C.sage}
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M15 3v6h6" stroke={C.sage} strokeWidth="1.6" strokeLinejoin="round" />
            </>
          ) : (
            <>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke={C.sage} strokeWidth="1.6" />
              <circle cx="9" cy="11" r="1.5" fill={C.sage} />
              <path d="M3 17l5-4 4 3 5-5 4 4" stroke={C.sage} strokeWidth="1.6" strokeLinejoin="round" />
            </>
          )}
        </svg>
      </div>
      <div style={{ fontFamily: FONT_UI, fontSize: 14, color: C.ink, fontWeight: 500 }}>{name}</div>
      <div style={{ fontFamily: FONT_UI, fontSize: 13, color: C.muted }}>{uploaded}</div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px",
          background: statusBg,
          color: statusColor,
          borderRadius: 999,
          fontFamily: FONT_UI,
          fontSize: 12,
          fontWeight: 500,
          width: "fit-content",
        }}
      >
        {statusIcon === "check" ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12l5 5 9-11"
              stroke={statusColor}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={statusColor} strokeWidth="2" />
            <path
              d="M12 7v5l3 2"
              stroke={statusColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {statusLabel}
      </div>
    </div>
  );
};
