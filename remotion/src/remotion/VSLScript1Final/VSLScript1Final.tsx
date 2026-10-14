import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {Video} from "@remotion/media";

const FPS = 25;
const DURATION = 2831;

const C = {
  white: "#FFFFFF",
  paper: "#F3F6F5",
  ink: "#0B171D",
  navy: "#11175F",
  teal: "#34ACA4",
  sky: "#58B8E0",
  border: "#D8E1E0",
  muted: "#6E7C7A",
};

const FONT = "Arial, Helvetica, sans-serif";
const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

const rangeOpacity = (frame: number, start: number, end: number, fade = 8) =>
  interpolate(frame, [start, start + fade, end - fade, end], [0, 1, 1, 0], clamp);

const BrandMark: React.FC<{size?: number; color?: string}> = ({size = 74, color = C.navy}) => (
  <svg width={size} height={size * 0.78} viewBox="0 0 128 100" fill="none">
    <path d="M2 28 30 2h31L34 28l27 26H30L2 28Z" fill={color} />
    <path d="m126 28-28-26H67l27 26-27 26h31l28-26Z" fill={color} />
    <path d="m64 46 27 26-27 26-27-26 27-26Z" fill={color} />
  </svg>
);

const CheckIcon: React.FC<{size?: number}> = ({size = 34}) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="17" fill={C.teal} />
    <path d="m10 18 5 5 11-12" stroke="white" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MailIcon: React.FC<{size?: number}> = ({size = 42}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="5" y="10" width="38" height="28" rx="4" stroke={C.teal} strokeWidth="3" />
    <path d="m8 14 16 13 16-13" stroke={C.teal} strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

const IntroCard: React.FC<{frame: number}> = ({frame}) => {
  const welcome = rangeOpacity(frame, 0, 58, 7);
  const host = rangeOpacity(frame, 58, 110, 7);
  const progress = interpolate(frame, [0, 108], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: 1255,
        top: 718,
        width: 595,
        height: 346,
        borderRadius: 14,
        background: `linear-gradient(130deg, ${C.navy}, ${C.ink})`,
        boxShadow: "0 20px 50px rgba(5,12,20,0.28)",
        overflow: "hidden",
        zIndex: 5,
      }}
    >
      <div style={{position: "absolute", left: 0, top: 0, width: `${progress * 100}%`, height: 8, background: C.teal}} />
      <div style={{position: "absolute", right: -50, top: -60, width: 230, height: 230, borderRadius: 115, background: "rgba(88,184,224,0.12)"}} />
      <div style={{position: "absolute", inset: 0, padding: "54px 58px", boxSizing: "border-box"}}>
        <div style={{position: "absolute", opacity: welcome, transform: `translateY(${(1 - welcome) * 16}px)`}}>
          <BrandMark size={76} color={C.white} />
          <div style={{fontFamily: FONT, color: C.teal, fontSize: 18, fontWeight: 800, letterSpacing: "0.19em", marginTop: 20}}>WELCOME TO</div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 45, lineHeight: 1, fontWeight: 800, marginTop: 10}}>VITA BELLA</div>
        </div>
        <div style={{position: "absolute", opacity: host, transform: `translateY(${(1 - host) * 16}px)`}}>
          <div style={{fontFamily: FONT, color: C.teal, fontSize: 18, fontWeight: 800, letterSpacing: "0.19em"}}>YOUR HOST</div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 47, lineHeight: 1, fontWeight: 800, marginTop: 18}}>PHIL VELA</div>
          <div style={{width: 68, height: 5, background: C.sky, margin: "24px 0 18px"}} />
          <div style={{fontFamily: FONT, color: "rgba(255,255,255,0.78)", fontSize: 22, fontWeight: 700, letterSpacing: "0.06em"}}>FOUNDER &amp; CEO</div>
        </div>
      </div>
    </div>
  );
};

const StepStrip: React.FC<{frame: number}> = ({frame}) => {
  const second = frame >= 230;
  const localStart = second ? 230 : 110;
  const inProgress = spring({frame: frame - localStart, fps: FPS, config: {stiffness: 180, damping: 20}});
  const number = second ? "02" : "01";
  const title = second ? "GETTING STARTED" : "TRUST YOUR HEALTH";
  const detail = second ? "The hardest step is already behind you." : "Thank you for choosing Vita Bella.";

  return (
    <div
      style={{
        position: "absolute",
        left: 246,
        top: 780,
        width: 1442,
        height: 278,
        borderRadius: 12,
        background: `linear-gradient(100deg, ${C.ink}, ${C.navy})`,
        boxShadow: "0 18px 46px rgba(5,12,20,0.27)",
        zIndex: 5,
        overflow: "hidden",
      }}
    >
      <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: C.teal}} />
      <div style={{position: "absolute", left: 64, top: 39, fontFamily: FONT, fontSize: 128, fontWeight: 800, lineHeight: 1, color: "rgba(88,184,224,0.22)", transform: `scale(${0.92 + inProgress * 0.08})`}}>{number}</div>
      <div style={{position: "absolute", left: 270, top: 56, opacity: inProgress, transform: `translateX(${(1 - inProgress) * 28}px)`}}>
        <div style={{fontFamily: FONT, fontSize: 18, fontWeight: 800, letterSpacing: "0.18em", color: C.teal}}>YOUR FIRST STEPS</div>
        <div style={{fontFamily: FONT, fontSize: 47, fontWeight: 800, lineHeight: 1.02, color: C.white, marginTop: 13}}>{title}</div>
        <div style={{fontFamily: FONT, fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.74)", marginTop: 14}}>{detail}</div>
      </div>
      <div style={{position: "absolute", right: 70, top: 62, width: 410}}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          {["TRUST", "START", "PORTAL", "CARE"].map((label, index) => {
            const active = index <= (second ? 1 : 0);
            return (
              <div key={label} style={{width: 88, textAlign: "center"}}>
                <div style={{width: 24, height: 24, borderRadius: 12, margin: "0 auto 12px", background: active ? C.teal : "transparent", border: `3px solid ${active ? C.teal : "rgba(255,255,255,0.28)"}`, boxSizing: "border-box"}} />
                <div style={{fontFamily: FONT, fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", color: active ? C.white : "rgba(255,255,255,0.42)"}}>{label}</div>
              </div>
            );
          })}
        </div>
        <div style={{position: "absolute", left: 45, right: 45, top: 10, height: 3, background: "rgba(255,255,255,0.16)", zIndex: -1}} />
      </div>
    </div>
  );
};

const EmailOverview: React.FC<{frame: number}> = ({frame}) => {
  const overview = frame >= 584;
  const contentOpacity = overview ? 0 : rangeOpacity(frame, 350, 584, 10);
  const overviewOpacity = overview ? rangeOpacity(frame, 584, 660, 8) : 0;
  const cardIn = spring({frame: frame - 350, fps: FPS, config: {stiffness: 150, damping: 20}});
  const checks = [430, 486, 540];

  return (
    <AbsoluteFill style={{background: C.paper, zIndex: 6, overflow: "hidden"}}>
      <div style={{position: "absolute", left: -180, top: -230, width: 680, height: 680, borderRadius: 340, background: "rgba(52,172,164,0.10)"}} />
      <div style={{position: "absolute", right: -110, bottom: -190, width: 560, height: 560, borderRadius: 280, border: `70px solid rgba(88,184,224,0.10)`}} />
      <div style={{position: "absolute", top: 58, left: 76, display: "flex", alignItems: "center", gap: 22}}>
        <BrandMark size={72} />
        <div>
          <div style={{fontFamily: FONT, fontSize: 14, fontWeight: 800, color: C.teal, letterSpacing: "0.19em"}}>VITA BELLA</div>
          <div style={{fontFamily: FONT, fontSize: 21, fontWeight: 800, color: C.navy, marginTop: 5}}>ONBOARDING</div>
        </div>
      </div>

      <div style={{position: "absolute", inset: 0, opacity: contentOpacity}}>
        <div style={{position: "absolute", left: 170, top: 250, width: 690}}>
          <div style={{fontFamily: FONT, fontSize: 18, fontWeight: 800, letterSpacing: "0.18em", color: C.teal}}>KEEP THIS CLOSE</div>
          <div style={{fontFamily: FONT, fontSize: 74, fontWeight: 800, lineHeight: 0.98, color: C.navy, marginTop: 18}}>SAVE THIS<br />EMAIL</div>
          <div style={{width: 86, height: 6, background: C.teal, margin: "30px 0"}} />
          <div style={{fontFamily: FONT, fontSize: 25, lineHeight: 1.45, color: C.muted, maxWidth: 590}}>Everything you need for your Vita Bella onboarding, all in one place.</div>
        </div>
        <div style={{position: "absolute", right: 160, top: 205, width: 650, height: 650, borderRadius: 18, background: C.white, border: `2px solid ${C.border}`, boxShadow: "0 30px 70px rgba(11,23,29,0.14)", transform: `translateY(${(1 - cardIn) * 38}px) scale(${0.96 + cardIn * 0.04})`, padding: "52px 58px", boxSizing: "border-box"}}>
          <div style={{height: 9, background: C.teal, position: "absolute", left: 0, right: 0, top: 0, borderRadius: "16px 16px 0 0"}} />
          <div style={{display: "flex", alignItems: "center", gap: 22, marginBottom: 38}}>
            <MailIcon size={56} />
            <div>
              <div style={{fontFamily: FONT, fontSize: 15, fontWeight: 800, color: C.teal, letterSpacing: "0.16em"}}>WELCOME TO VITA BELLA</div>
              <div style={{fontFamily: FONT, fontSize: 30, fontWeight: 800, color: C.navy, marginTop: 7}}>Your quick-start guide</div>
            </div>
          </div>
          {[
            ["EVERYTHING YOU NEED", "Your onboarding details"],
            ["HELPFUL LINKS", "Direct access to your portal"],
            ["THIS VIDEO", "Come back and watch anytime"],
          ].map(([title, note], index) => {
            const p = spring({frame: frame - checks[index], fps: FPS, config: {stiffness: 180, damping: 18}});
            return (
              <div key={title} style={{display: "flex", alignItems: "center", gap: 22, padding: "24px 0", borderTop: `1px solid ${C.border}`, opacity: p, transform: `translateX(${(1 - p) * 20}px)`}}>
                <CheckIcon size={39} />
                <div>
                  <div style={{fontFamily: FONT, fontSize: 21, fontWeight: 800, color: C.navy, letterSpacing: "0.04em"}}>{title}</div>
                  <div style={{fontFamily: FONT, fontSize: 17, color: C.teal, marginTop: 5}}>{note}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{position: "absolute", inset: 0, opacity: overviewOpacity, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
        <div style={{fontFamily: FONT, fontSize: 18, fontWeight: 800, letterSpacing: "0.2em", color: C.teal}}>A QUICK OVERVIEW</div>
        <div style={{fontFamily: FONT, fontSize: 67, fontWeight: 800, color: C.navy, marginTop: 14}}>WHAT HAPPENS NEXT</div>
        <div style={{display: "flex", gap: 24, marginTop: 62}}>
          {[
            ["01", "REGISTER"],
            ["02", "PORTAL"],
            ["03", "INTAKE"],
            ["04", "CONSULT"],
          ].map(([number, label], index) => {
            const p = spring({frame: frame - (590 + index * 6), fps: FPS, config: {stiffness: 175, damping: 18}});
            return (
              <div key={number} style={{width: 300, height: 190, borderRadius: 14, background: index === 0 ? C.navy : C.white, border: `2px solid ${index === 0 ? C.navy : C.border}`, boxShadow: "0 16px 36px rgba(11,23,29,0.09)", padding: "30px", boxSizing: "border-box", opacity: p, transform: `translateY(${(1 - p) * 22}px)`}}>
                <div style={{fontFamily: FONT, fontSize: 50, fontWeight: 800, color: index === 0 ? C.teal : C.sky}}>{number}</div>
                <div style={{fontFamily: FONT, fontSize: 21, fontWeight: 800, letterSpacing: "0.08em", color: index === 0 ? C.white : C.navy, marginTop: 16}}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FinalCopy: React.FC<{localFrame: number}> = ({localFrame}) => {
  const phases = [
    {start: 0, end: 164, eyebrow: "YOUR ONBOARDING", title: "SIMPLE. STRESS-FREE.", note: "That’s really all there is to it."},
    {start: 164, end: 338, eyebrow: "NEED HELP?", title: "SEND A SECURE MESSAGE", note: localFrame >= 288 ? "Our team is always happy to help." : "Through your patient portal."},
    {start: 338, end: 494, eyebrow: "THANK YOU FOR CHOOSING VITA BELLA", title: "YOUR HEALTH JOURNEY", note: "We’re honored to be part of it."},
    {start: 494, end: 576, eyebrow: "VITA BELLA", title: "THE HEALTHIEST VERSION OF YOU", note: localFrame >= 532 ? "Welcome to Vita Bella." : "Your journey continues."},
  ];
  const phase = phases.find((item) => localFrame >= item.start && localFrame < item.end) ?? phases[phases.length - 1];
  const opacity = phase.end === 576
    ? interpolate(localFrame, [phase.start, phase.start + 7], [0, 1], clamp)
    : rangeOpacity(localFrame, phase.start, phase.end, 7);
  const p = spring({frame: localFrame - phase.start, fps: FPS, config: {stiffness: 150, damping: 20}});

  return (
    <div style={{position: "absolute", left: 246, top: 780, width: 1442, height: 278, borderRadius: 12, background: `linear-gradient(100deg, ${C.ink}, ${C.navy})`, boxShadow: "0 18px 46px rgba(5,12,20,0.27)", overflow: "hidden", zIndex: 5}}>
      <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: C.teal}} />
      <div style={{position: "absolute", left: 69, top: 69, width: 126, height: 126, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "2px solid rgba(52,172,164,0.35)", background: "rgba(52,172,164,0.08)", opacity, transform: `scale(${0.92 + p * 0.08})`}}>
        {phase === phases[1] ? <MailIcon size={74} /> : phase === phases[0] ? <CheckIcon size={68} /> : <BrandMark size={83} color={C.teal} />}
      </div>
      <div style={{position: "absolute", left: 270, top: 56, right: 60, opacity, transform: `translateX(${(1 - p) * 28}px)`}}>
        <div style={{fontFamily: FONT, fontSize: 18, fontWeight: 800, letterSpacing: "0.18em", color: C.teal}}>{phase.eyebrow}</div>
        <div style={{fontFamily: FONT, fontSize: phase === phases[3] ? 43 : 47, whiteSpace: "nowrap", lineHeight: 1.02, fontWeight: 800, color: C.white, marginTop: 13}}>{phase.title}</div>
        <div style={{fontFamily: FONT, fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.74)", marginTop: 14}}>{phase.note}</div>
      </div>
      <div style={{position: "absolute", bottom: 0, left: 12, width: `${interpolate(localFrame, [0, 575], [0, 100], clamp)}%`, height: 4, background: C.teal, opacity: 0.6}} />
    </div>
  );
};

const Finale: React.FC = () => {
  const localFrame = useCurrentFrame();

  return (
    <AbsoluteFill style={{background: C.ink, overflow: "hidden"}}>
      <Video
        src={staticFile("phil-vsl-raw.mp4")}
        trimBefore={2255}
        muted
        objectFit="contain"
        style={{position: "absolute", inset: 0, width: "100%", height: "100%"}}
      />
      <FinalCopy localFrame={localFrame} />
    </AbsoluteFill>
  );
};

export const VSLScript1Final: React.FC = () => {
  const frame = useCurrentFrame();
  const showPhone = frame >= 660 && frame < 2255;

  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Video src={staticFile("vsl-script-1-template.mp4")} objectFit="contain" style={{width: "100%", height: "100%"}} />

      {frame < 110 ? <IntroCard frame={frame} /> : null}
      {frame >= 110 && frame < 350 ? <StepStrip frame={frame} /> : null}
      {frame >= 350 && frame < 660 ? <EmailOverview frame={frame} /> : null}

      <Video
        src={staticFile("phil-vsl-phone-edit.mp4")}
        muted
        objectFit="cover"
        style={{position: "absolute", inset: 0, width: "100%", height: "100%", opacity: showPhone ? 1 : 0, zIndex: 6}}
      />

      <Sequence from={2255} durationInFrames={576} premountFor={30}>
        <Finale />
      </Sequence>
    </AbsoluteFill>
  );
};

export const VSLScript1Root: React.FC = () => (
  <Composition
    id="VSLScript1Final"
    component={VSLScript1Final}
    durationInFrames={DURATION}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
