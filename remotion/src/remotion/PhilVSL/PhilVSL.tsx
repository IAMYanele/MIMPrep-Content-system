import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { Scene01CheckoutRedirect } from "./scenes/Scene01CheckoutRedirect";
import { Scene02RegistrationForm } from "./scenes/Scene02RegistrationForm";
import { Scene03EmailVerification } from "./scenes/Scene03EmailVerification";
import { Scene04Dashboard } from "./scenes/Scene04Dashboard";
import { Scene05MyAccount } from "./scenes/Scene05MyAccount";
import { Scene06FormsIntake } from "./scenes/Scene06FormsIntake";
import { Scene07SecureMessages } from "./scenes/Scene07SecureMessages";
import { Scene08NewMessageModal } from "./scenes/Scene08NewMessageModal";
import { Scene09LabTimeline } from "./scenes/Scene09LabTimeline";
import { Scene10MyDocuments } from "./scenes/Scene10MyDocuments";
import { Scene11AppointmentBooking } from "./scenes/Scene11AppointmentBooking";
import { Scene12TelehealthLobby } from "./scenes/Scene12TelehealthLobby";

export type SceneEntry = {
  id: string;
  startSec: number;
  endSec: number;
  Component: React.FC<{ durationInFrames: number }>;
};

const SCENE_COMPONENTS = [
  Scene01CheckoutRedirect,
  Scene02RegistrationForm,
  Scene03EmailVerification,
  Scene04Dashboard,
  Scene05MyAccount,
  Scene06FormsIntake,
  Scene07SecureMessages,
  Scene08NewMessageModal,
  Scene09LabTimeline,
  Scene10MyDocuments,
  Scene11AppointmentBooking,
  Scene12TelehealthLobby,
] as const;

// V1 — original VSL.
export const SCENES_V1: SceneEntry[] = [
  { id: "01", startSec: 5.9, endSec: 16.1, Component: SCENE_COMPONENTS[0] },
  { id: "02", startSec: 16.1, endSec: 26.0, Component: SCENE_COMPONENTS[1] },
  { id: "03", startSec: 26.0, endSec: 36.7, Component: SCENE_COMPONENTS[2] },
  { id: "04", startSec: 36.7, endSec: 42.6, Component: SCENE_COMPONENTS[3] },
  { id: "05", startSec: 42.6, endSec: 55.4, Component: SCENE_COMPONENTS[4] },
  { id: "06", startSec: 55.4, endSec: 81.4, Component: SCENE_COMPONENTS[5] },
  { id: "07", startSec: 102.4, endSec: 118.7, Component: SCENE_COMPONENTS[6] },
  { id: "08", startSec: 118.7, endSec: 127.4, Component: SCENE_COMPONENTS[7] },
  { id: "09", startSec: 127.4, endSec: 145.8, Component: SCENE_COMPONENTS[8] },
  { id: "10", startSec: 145.8, endSec: 171.6, Component: SCENE_COMPONENTS[9] },
  { id: "11", startSec: 171.6, endSec: 198.7, Component: SCENE_COMPONENTS[10] },
  { id: "12", startSec: 198.7, endSec: 216.2, Component: SCENE_COMPONENTS[11] },
];

// V2 — alternate background take of the same script. Timestamps from Whisper
// transcript of public/phil-vsl/source-v2.mp4 (duration 207.24s, faster cadence).
// Scene 09 (lab results timeline) is intentionally omitted — narration flows
// straight from the new-message modal into the documents upload step.
// Scenes 11 and 12 end early (02:49 and 03:15) per editorial direction.
export const SCENES_V2: SceneEntry[] = [
  { id: "01", startSec: 4.5, endSec: 14.2, Component: SCENE_COMPONENTS[0] },
  { id: "02", startSec: 14.2, endSec: 23.0, Component: SCENE_COMPONENTS[1] },
  { id: "03", startSec: 23.0, endSec: 32.1, Component: SCENE_COMPONENTS[2] },
  { id: "04", startSec: 32.1, endSec: 36.4, Component: SCENE_COMPONENTS[3] },
  { id: "05", startSec: 36.4, endSec: 47.5, Component: SCENE_COMPONENTS[4] },
  { id: "06", startSec: 47.5, endSec: 75.9, Component: SCENE_COMPONENTS[5] },
  { id: "07", startSec: 95.4, endSec: 105.8, Component: SCENE_COMPONENTS[6] },
  { id: "08", startSec: 105.8, endSec: 121.0, Component: SCENE_COMPONENTS[7] },
  { id: "10", startSec: 140.6, endSec: 160.8, Component: SCENE_COMPONENTS[9] },
  { id: "11", startSec: 160.8, endSec: 169.0, Component: SCENE_COMPONENTS[10] },
  { id: "12", startSec: 186.6, endSec: 195.0, Component: SCENE_COMPONENTS[11] },
];

type Props = {
  videoSrc: string;
  scenes: SceneEntry[];
};

const PhilVSLInner: React.FC<Props> = ({ videoSrc, scenes }) => {
  const { fps } = useVideoConfig();
  const premountFrames = Math.round(0.5 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Base layer: VSL with original speaker audio */}
      <Video
        src={staticFile(videoSrc)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Animated SaaS scenes gated to their script moments */}
      {scenes.map(({ id, startSec, endSec, Component }) => {
        const from = Math.round(startSec * fps);
        const duration = Math.max(1, Math.round((endSec - startSec) * fps));
        return (
          <Sequence
            key={id}
            from={from}
            durationInFrames={duration}
            premountFor={premountFrames}
            name={`Scene ${id}`}
          >
            <Component durationInFrames={duration} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Composition components — one per video variant.
export const PhilVSL: React.FC = () => (
  <PhilVSLInner videoSrc="phil-vsl/source.mp4" scenes={SCENES_V1} />
);

export const PhilVSL2: React.FC = () => (
  <PhilVSLInner videoSrc="phil-vsl/source-v2.mp4" scenes={SCENES_V2} />
);
