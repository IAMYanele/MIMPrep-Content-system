import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {Video} from "@remotion/media";

const FPS = 25;
const DURATION = 2848;
// The edited 16:9 source contains the original vertical camera image between
// these two boundaries. The generated side extensions begin outside them, so
// the branded rails deliberately sit on top of those joins (including the
// visible edge on Phil's right arm).
const LEFT_EDGE = 612;
const RIGHT_EDGE = 1294;
const LEFT_W = LEFT_EDGE;
const RIGHT_W = 1920 - RIGHT_EDGE;

const C = {
  white: "#FFFFFF",
  ink: "#0B171D",
  navy: "#11175F",
  teal: "#34ACA4",
  sky: "#58B8E0",
  slate: "#3C5C60",
  muted: "#6E7C7A",
  surface: "#F3F6F5",
  border: "#D8E1E0",
};

const FONT = "Arial, Helvetica, sans-serif";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const entrance = (frame: number, start: number, fps: number, delay = 0) => {
  return spring({
    frame: frame - start - delay,
    fps,
    config: {stiffness: 220, damping: 18, mass: 0.8},
  });
};

const cueStyle = (
  frame: number,
  start: number,
  end: number,
  fps: number,
  delay = 0,
): React.CSSProperties => {
  const p = entrance(frame, start, fps, delay);
  const out = interpolate(frame, [end - 5, end], [1, 0], clamp);
  return {
    opacity: p * out,
    transform: `translateY(${(1 - p) * 18}px) scale(${0.96 + 0.04 * p})`,
    transformOrigin: "center",
  };
};

const textStyle = (
  frame: number,
  start: number,
  end: number,
  delay = 0,
): React.CSSProperties => {
  const t = interpolate(frame, [start + delay, start + delay + 6], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const out = interpolate(frame, [end - 5, end], [1, 0], clamp);
  return {
    opacity: t * out,
    filter: `blur(${(1 - t) * 4}px)`,
    transform: `translateY(${(1 - t) * 8}px)`,
  };
};

const VitaBellaMark: React.FC<{size?: number}> = ({size = 104}) => (
  <svg width={size} height={size * 0.78} viewBox="0 0 128 100" fill="none">
    <path d="M2 28 30 2h31L34 28l27 26H30L2 28Z" fill={C.ink} />
    <path d="m126 28-28-26H67l27 26-27 26h31l28-26Z" fill={C.ink} />
    <path d="m64 46 27 26-27 26-27-26 27-26Z" fill={C.ink} />
  </svg>
);

const Check: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = C.teal,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" fill={color} />
    <path
      d="m9 16.2 4.4 4.3L23 11"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EmptyCheck: React.FC<{size?: number}> = ({size = 28}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      border: `2px solid ${C.border}`,
      background: C.white,
      boxSizing: "border-box",
    }}
  />
);

const Bookmark: React.FC<{active: boolean}> = ({active}) => (
  <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
    <path
      d="M4 3h20v27l-10-6-10 6V3Z"
      fill={active ? C.teal : "none"}
      stroke={active ? C.teal : C.sky}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

const MailIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <rect x="3" y="6" width="26" height="20" rx="3" stroke={C.teal} strokeWidth="2.4" />
    <path d="m5 9 11 9L27 9" stroke={C.teal} strokeWidth="2.4" strokeLinejoin="round" />
  </svg>
);

const PlayIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <rect x="3" y="5" width="26" height="22" rx="4" stroke={C.sky} strokeWidth="2.4" />
    <path d="m13 11 8 5-8 5V11Z" fill={C.sky} />
  </svg>
);

const LinkIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <path d="M13 19 9 23a5 5 0 0 1-7-7l5-5a5 5 0 0 1 7 0" stroke={C.teal} strokeWidth="2.4" strokeLinecap="round" />
    <path d="m19 13 4-4a5 5 0 0 1 7 7l-5 5a5 5 0 0 1-7 0" stroke={C.teal} strokeWidth="2.4" strokeLinecap="round" />
    <path d="m11 21 10-10" stroke={C.teal} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const Dash: React.FC<{width?: number}> = ({width = 38}) => (
  <div style={{width, height: 4, borderRadius: 2, background: C.teal}} />
);

const PortalCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({children, style}) => (
  <div
    style={{
      background: C.white,
      border: `1.5px solid ${C.border}`,
      borderRadius: 8,
      boxShadow: "0 12px 28px rgba(11,23,29,0.08)",
      padding: "28px 30px",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

const Panel: React.FC<{
  side: "left" | "right";
  children?: React.ReactNode;
}> = ({side, children}) => {
  const isLeft = side === "left";
  const frame = useCurrentFrame();
  const railY = 80 + ((frame * 2.6 + (isLeft ? 0 : 430)) % 920);
  return (
    <div
      style={{
        position: "absolute",
        left: isLeft ? 0 : RIGHT_EDGE,
        top: 0,
        width: isLeft ? LEFT_W : RIGHT_W,
        height: 1080,
        background: C.white,
        borderRight: isLeft ? `2px solid ${C.border}` : undefined,
        borderLeft: !isLeft ? `2px solid ${C.border}` : undefined,
        boxShadow: isLeft
          ? "12px 0 30px rgba(11,23,29,0.09)"
          : "-12px 0 30px rgba(11,23,29,0.09)",
        zIndex: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${isLeft ? "112deg" : "248deg"}, rgba(88,184,224,0.09), rgba(255,255,255,0) 38%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 70,
          bottom: 70,
          [isLeft ? "right" : "left"]: 34,
          width: 3,
          borderRadius: 3,
          background: `linear-gradient(180deg, ${C.teal}, ${C.sky})`,
          opacity: 0.75,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: railY,
          [isLeft ? "right" : "left"]: 27,
          width: 17,
          height: 17,
          borderRadius: 9,
          background: C.white,
          border: `4px solid ${C.teal}`,
          boxSizing: "border-box",
          boxShadow: "0 0 0 5px rgba(52,172,164,0.10)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: isLeft ? "0 46px 0 92px" : "0 92px 0 46px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Opening: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const start = 2;
  const end = 56;
  return (
    <div style={{...cueStyle(frame, start, end, fps), width: "100%", textAlign: "center"}}>
      <div style={{display: "flex", justifyContent: "center", marginBottom: 28}}>
        <VitaBellaMark size={118} />
      </div>
      <div style={{...textStyle(frame, start, end, 5)}}>
        <div style={{fontFamily: FONT, fontSize: 22, fontWeight: 700, letterSpacing: "0.22em", color: C.teal, marginBottom: 14}}>
          WELCOME TO
        </div>
        <div style={{fontFamily: FONT, fontSize: 44, fontWeight: 800, letterSpacing: "0.025em", color: C.navy, lineHeight: 1.04}}>
          VITA BELLA
        </div>
        <div style={{display: "flex", justifyContent: "center", marginTop: 24}}><Dash /></div>
      </div>
    </div>
  );
};

const Identity: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const start = 56;
  const end = 120;
  return (
    <div style={{...cueStyle(frame, start, end, fps), width: "100%"}}>
      <div style={{fontFamily: FONT, fontSize: 18, fontWeight: 700, letterSpacing: "0.2em", color: C.teal, marginBottom: 18}}>MEET YOUR HOST</div>
      <div style={{fontFamily: FONT, fontSize: 50, fontWeight: 800, letterSpacing: "0.015em", color: C.navy, lineHeight: 1}}>PHIL VELA</div>
      <div style={{margin: "22px 0 18px"}}><Dash /></div>
      <div style={{fontFamily: FONT, fontSize: 24, fontWeight: 700, letterSpacing: "0.09em", color: C.teal}}>FOUNDER &amp; CEO</div>
    </div>
  );
};

const StatusCard: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const start = 228;
  const end = 349;
  const checked = frame >= 302;
  return (
    <PortalCard style={{...cueStyle(frame, start, end, fps), width: "100%"}}>
      <div style={{fontFamily: FONT, fontSize: 15, fontWeight: 700, letterSpacing: "0.16em", color: C.teal}}>ONBOARDING STATUS</div>
      <div style={{display: "flex", alignItems: "center", gap: 16, margin: "24px 0 22px"}}>
        <div style={{transform: `scale(${checked ? 1 : 0.85})`, transition: "none"}}>{checked ? <Check size={42} /> : <EmptyCheck size={42} />}</div>
        <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 800, color: C.navy, lineHeight: 1.05}}>GETTING<br />STARTED</div>
      </div>
      <div style={{height: 1, background: C.border, marginBottom: 18}} />
      <div style={{fontFamily: FONT, fontSize: 18, fontWeight: 700, letterSpacing: "0.08em", color: checked ? C.teal : C.muted}}>
        {checked ? "FIRST STEP COMPLETE" : "IN PROGRESS"}
      </div>
    </PortalCard>
  );
};

const EmailCard: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const start = 349;
  const end = 582;
  const active = frame >= 405;
  return (
    <PortalCard style={{...cueStyle(frame, start, end, fps), width: "100%", padding: 0, overflow: "hidden"}}>
      <div style={{height: 8, background: C.teal}} />
      <div style={{padding: "26px 28px 18px"}}>
        <div style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18}}>
          <div>
            <div style={{fontFamily: FONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.15em", color: C.teal, marginBottom: 8}}>VITA BELLA</div>
            <div style={{fontFamily: FONT, fontSize: 28, fontWeight: 800, color: C.navy, lineHeight: 1.12}}>WELCOME TO<br />VITA BELLA</div>
          </div>
          <div style={{transform: `scale(${active ? 1.08 : 1})`}}><Bookmark active={active} /></div>
        </div>
      </div>
      <div style={{height: 1, background: C.border}} />
      <div style={{padding: "12px 28px 24px"}}>
        <div style={{...textStyle(frame, 420, end, 0), display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: `1px solid ${C.border}`}}>
          <LinkIcon />
          <span style={{fontFamily: FONT, fontSize: 18, fontWeight: 700, color: C.navy, letterSpacing: "0.04em"}}>HELPFUL LINKS</span>
        </div>
        <div style={{...textStyle(frame, 500, end, 0), display: "flex", alignItems: "center", gap: 14, padding: "14px 0 0"}}>
          <PlayIcon />
          <span style={{fontFamily: FONT, fontSize: 18, fontWeight: 700, color: C.navy, letterSpacing: "0.04em"}}>THIS VIDEO</span>
        </div>
      </div>
    </PortalCard>
  );
};

type Step = {num: string; title: string; note: string};
const STEPS: Step[] = [
  {num: "1", title: "REGISTER", note: "Set up your portal"},
  {num: "2", title: "INTAKE", note: "Complete your forms"},
  {num: "3", title: "LABS", note: "Follow your instructions"},
  {num: "4", title: "CONSULTATION", note: "Meet your provider"},
];

const StepRow: React.FC<{
  step: Step;
  checked: boolean;
  style?: React.CSSProperties;
}> = ({step, checked, style}) => (
  <div style={{display: "flex", gap: 16, alignItems: "center", padding: "17px 0", borderBottom: `1px solid ${C.border}`, ...style}}>
    {checked ? <Check size={32} /> : <EmptyCheck size={32} />}
    <div>
      <div style={{fontFamily: FONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em", color: C.teal}}>STEP {step.num}</div>
      <div style={{fontFamily: FONT, fontSize: 24, fontWeight: 800, color: C.navy, letterSpacing: "0.02em", marginTop: 3}}>{step.title}</div>
      <div style={{fontFamily: FONT, fontSize: 15, color: C.teal, marginTop: 4}}>{step.note}</div>
    </div>
  </div>
);

const RoadmapPanel: React.FC<{
  frame: number;
  fps: number;
  side: "left" | "right";
  complete?: boolean;
}> = ({frame, fps, side, complete = false}) => {
  const start = complete ? 2251 : 582;
  const end = complete ? 2293 : 659;
  const indexes = side === "left" ? [0, 1] : [2, 3];
  return (
    <div style={{...cueStyle(frame, start, end, fps), width: "100%"}}>
      <div style={{fontFamily: FONT, fontSize: 16, fontWeight: 700, letterSpacing: "0.17em", color: C.teal, marginBottom: 12}}>
        {complete ? "YOUR NEXT STEPS" : "WHAT HAPPENS NEXT"}
      </div>
      <div style={{fontFamily: FONT, fontSize: 30, lineHeight: 1.08, fontWeight: 800, color: C.navy, marginBottom: 18}}>
        {complete ? "ONBOARDING COMPLETE" : side === "left" ? "YOUR ONBOARDING" : "CONTINUED"}
      </div>
      <Dash />
      <div style={{marginTop: 18}}>
        {indexes.map((i, j) => {
          const checked = complete && frame >= start + 5 + i * 7;
          return (
            <StepRow
              key={STEPS[i].num}
              step={STEPS[i]}
              checked={checked}
              style={cueStyle(frame, start, end, fps, 3 + j * 5)}
            />
          );
        })}
      </div>
    </div>
  );
};

const BenefitCard: React.FC<{
  frame: number;
  start: number;
  end: number;
  title: string;
  note: string;
  delay: number;
}> = ({frame, start, end, title, note, delay}) => (
  <PortalCard style={{...cueStyle(frame, start, end, FPS, delay), width: "100%", textAlign: "center"}}>
    <div style={{display: "flex", justifyContent: "center", marginBottom: 20}}><Check size={48} /></div>
    <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 800, letterSpacing: "0.025em", color: C.navy}}>{title}</div>
    <div style={{display: "flex", justifyContent: "center", margin: "18px 0"}}><Dash /></div>
    <div style={{fontFamily: FONT, fontSize: 18, lineHeight: 1.35, color: C.teal}}>{note}</div>
  </PortalCard>
);

const SecureMessageCard: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const start = 2419;
  const end = 2544;
  const pulse = 1 + 0.035 * Math.sin(Math.max(0, frame - start - 35) * 0.28);
  const highlightOpacity = interpolate(
    frame,
    [start + 8, start + 14, start + 36, start + 42],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <div style={{...cueStyle(frame, start, end, fps), width: "100%"}}>
      <div style={{fontFamily: FONT, fontSize: 15, fontWeight: 700, letterSpacing: "0.16em", color: C.teal, marginBottom: 12}}>NEED HELP?</div>
      <div style={{fontFamily: FONT, fontSize: 29, fontWeight: 800, color: C.navy, lineHeight: 1.1, marginBottom: 18}}>SEND A SECURE MESSAGE</div>
      <div style={{position: "relative", width: 330, height: 540, margin: "0 auto", borderRadius: 8, overflow: "hidden", border: `2px solid ${C.border}`, boxShadow: "0 12px 28px rgba(11,23,29,0.10)", background: C.white}}>
        <Img
          src={staticFile("secure-message-button.png")}
          style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "center"}}
        />
        <div style={{position: "absolute", left: 28, right: 28, top: 258, height: 38, opacity: highlightOpacity, border: `3px solid ${C.teal}`, borderRadius: 4, transform: `scale(${pulse})`, boxShadow: "0 0 0 5px rgba(52,172,164,0.16)"}} />
      </div>
    </div>
  );
};

const Journey: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const start = 2659;
  const end = 2805;
  const progress = interpolate(frame, [start + 18, start + 94], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{...cueStyle(frame, start, end, fps), width: "100%"}}>
      <div style={{fontFamily: FONT, fontSize: 16, fontWeight: 700, letterSpacing: "0.16em", color: C.teal}}>YOUR HEALTH JOURNEY</div>
      <div style={{fontFamily: FONT, fontSize: 35, fontWeight: 800, lineHeight: 1.08, color: C.navy, margin: "18px 0 20px"}}>THE HEALTHIEST<br />VERSION OF<br />YOURSELF</div>
      <Dash />
      <div style={{position: "relative", height: 56, marginTop: 36}}>
        <div style={{position: "absolute", left: 10, right: 10, top: 18, height: 4, borderRadius: 2, background: C.border}} />
        <div style={{position: "absolute", left: 10, top: 18, width: `${progress * 94}%`, height: 4, borderRadius: 2, background: C.teal}} />
        {[0, 1, 2, 3].map((i) => {
          const on = progress >= i / 3 - 0.03;
          return <div key={i} style={{position: "absolute", left: `${4 + i * 30.5}%`, top: 7, width: 26, height: 26, borderRadius: 13, border: `3px solid ${on ? C.teal : C.border}`, background: on ? C.teal : C.white, boxSizing: "border-box"}} />;
        })}
      </div>
    </div>
  );
};

const Closing: React.FC<{frame: number; fps: number; side: "left" | "right"}> = ({frame, fps, side}) => {
  const start = 2805;
  const end = 2848;
  return (
    <div style={{...cueStyle(frame, start, end + 5, fps), width: "100%", textAlign: "center"}}>
      {side === "left" ? (
        <>
          <div style={{display: "flex", justifyContent: "center", marginBottom: 24}}><VitaBellaMark size={124} /></div>
          <div style={{fontFamily: FONT, fontSize: 18, fontWeight: 700, letterSpacing: "0.18em", color: C.teal}}>WELCOME TO THE</div>
        </>
      ) : (
        <>
          <div style={{fontFamily: FONT, fontSize: 39, fontWeight: 800, lineHeight: 1.08, color: C.navy}}>VITA BELLA<br />FAMILY</div>
          <div style={{display: "flex", justifyContent: "center", marginTop: 24}}><Dash /></div>
        </>
      )}
    </div>
  );
};

const LowerThird: React.FC<{
  frame: number;
  start: number;
  end: number;
  eyebrow: string;
  title: string;
  detail?: string;
}> = ({frame, start, end, eyebrow, title, detail}) => {
  const enter = interpolate(frame, [start, start + 10], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const leave = interpolate(frame, [end - 8, end], [1, 0], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const reveal = Math.min(enter, leave);
  const accent = interpolate(frame, [start + 5, start + 20], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        right: 72,
        bottom: 62,
        width: 760,
        minHeight: detail ? 164 : 132,
        padding: detail ? "26px 36px 25px 42px" : "27px 36px 26px 42px",
        boxSizing: "border-box",
        borderLeft: `9px solid ${C.teal}`,
        background: "linear-gradient(105deg, rgba(17,23,95,0.97), rgba(11,23,29,0.91))",
        boxShadow: "0 18px 46px rgba(5,12,20,0.30)",
        clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0 round 7px)`,
        transform: `translateX(${(1 - reveal) * 34}px)`,
        opacity: reveal,
        zIndex: 7,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 42,
          top: 0,
          width: `${accent * 190}px`,
          height: 4,
          background: C.sky,
        }}
      />
      <div style={{fontFamily: FONT, fontSize: 16, fontWeight: 800, letterSpacing: "0.18em", color: C.teal, marginBottom: 9}}>
        {eyebrow}
      </div>
      <div style={{fontFamily: FONT, fontSize: 39, lineHeight: 1.04, fontWeight: 800, letterSpacing: "0.015em", color: C.white}}>
        {title}
      </div>
      {detail ? (
        <div style={{fontFamily: FONT, fontSize: 20, lineHeight: 1.28, fontWeight: 600, color: "rgba(255,255,255,0.78)", marginTop: 10}}>
          {detail}
        </div>
      ) : null}
    </div>
  );
};

const SeamSoftener: React.FC<{frame: number}> = ({frame}) => {
  const talkingHead = frame < 659 || frame >= 2251;
  if (!talkingHead) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 1265,
        top: 300,
        width: 66,
        height: 750,
        background: "rgba(255,255,255,0.012)",
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter: "blur(7px)",
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 32%, black 68%, transparent 100%)",
        maskImage: "linear-gradient(90deg, transparent 0%, black 32%, black 68%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 3,
      }}
    />
  );
};

const BrandPanels: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <SeamSoftener frame={frame} />
      {frame < 72 ? <LowerThird frame={frame} start={2} end={72} eyebrow="WELCOME TO" title="VITA BELLA" /> : null}
      {frame >= 72 && frame < 176 ? <LowerThird frame={frame} start={72} end={176} eyebrow="MEET YOUR HOST" title="PHIL VELA" detail="Founder & CEO" /> : null}
      {frame >= 228 && frame < 349 ? <LowerThird frame={frame} start={228} end={349} eyebrow="ONBOARDING STATUS" title="GETTING STARTED" detail="Your first step is already in progress." /> : null}
      {frame >= 349 && frame < 505 ? <LowerThird frame={frame} start={349} end={505} eyebrow="KEEP THIS EMAIL" title="YOUR QUICK-START GUIDE" detail="Save the helpful links and this video for easy access." /> : null}
      {frame >= 505 && frame < 659 ? <LowerThird frame={frame} start={505} end={659} eyebrow="WHAT HAPPENS NEXT" title="REGISTER • INTAKE • LABS" detail="Then meet your provider for your consultation." /> : null}
      {frame >= 2251 && frame < 2340 ? <LowerThird frame={frame} start={2251} end={2340} eyebrow="YOUR NEXT STEPS" title="ONBOARDING COMPLETE" /> : null}
      {frame >= 2340 && frame < 2419 ? <LowerThird frame={frame} start={2340} end={2419} eyebrow="DESIGNED FOR YOU" title="SIMPLE. STRESS-FREE." /> : null}
      {frame >= 2419 && frame < 2544 ? <LowerThird frame={frame} start={2419} end={2544} eyebrow="NEED HELP?" title="SEND A SECURE MESSAGE" detail="Use your patient portal whenever you need support." /> : null}
      {frame >= 2659 && frame < 2805 ? <LowerThird frame={frame} start={2659} end={2805} eyebrow="YOUR HEALTH JOURNEY" title="THE HEALTHIEST VERSION OF YOU" /> : null}
      {frame >= 2805 ? <LowerThird frame={frame} start={2805} end={2848} eyebrow="WELCOME TO THE" title="VITA BELLA FAMILY" /> : null}
    </>
  );
};

export const PhilVSLBrandEdit: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.white}}>
      <Video
        src={staticFile("Phil vsl sitting - edited.mp4")}
        style={{width: "100%", height: "100%", objectFit: "contain"}}
      />
      <BrandPanels />
    </AbsoluteFill>
  );
};

export const PhilVSLBrandRoot: React.FC = () => (
  <Composition
    id="PhilVSLBrandEdit"
    component={PhilVSLBrandEdit}
    durationInFrames={DURATION}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
