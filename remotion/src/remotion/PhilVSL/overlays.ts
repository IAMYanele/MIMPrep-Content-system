// Motion graphic overlay timings for Phil VSL.
// Each entry maps a numbered frame (01-12) to the script moment it illustrates.
// Times are seconds from the start of the source video and were derived from
// the Whisper transcript of "phil vsl.mp4".

export type Overlay = {
  id: string;
  file: string;
  startSec: number;
  endSec: number;
};

export const OVERLAYS: Overlay[] = [
  {
    id: "01-checkout-redirect",
    file: "phil-vsl/01 _ Checkout _ Registration redirect.png",
    startSec: 5.9,
    endSec: 16.1,
  },
  {
    id: "02-registration-form",
    file: "phil-vsl/02 _ Registration form.png",
    startSec: 16.1,
    endSec: 26.0,
  },
  {
    id: "03-email-verification",
    file: "phil-vsl/03 _ Email verification.png",
    startSec: 26.0,
    endSec: 36.7,
  },
  {
    id: "04-portal-dashboard",
    file: "phil-vsl/04 _ Patient portal dashboard.png",
    startSec: 36.7,
    endSec: 42.6,
  },
  {
    id: "05-account-info",
    file: "phil-vsl/05 _ My Account Information.png",
    startSec: 42.6,
    endSec: 55.4,
  },
  {
    id: "06-forms-intake",
    file: "phil-vsl/06 _ My Forms _ intake.png",
    startSec: 55.4,
    endSec: 81.4,
  },
  {
    id: "07-secure-messages-quest",
    file: "phil-vsl/07 _ Secure messages _Quest_.png",
    startSec: 102.4,
    endSec: 118.7,
  },
  {
    id: "08-new-message-modal",
    file: "phil-vsl/08 _ New message modal.png",
    startSec: 118.7,
    endSec: 127.4,
  },
  {
    id: "09-lab-results-timeline",
    file: "phil-vsl/09 _ Lab results timeline.png",
    startSec: 127.4,
    endSec: 145.8,
  },
  {
    id: "10-my-documents-upload",
    file: "phil-vsl/10 _ My Documents _ upload.png",
    startSec: 145.8,
    endSec: 171.6,
  },
  {
    id: "11-appointment-booking",
    file: "phil-vsl/11 _ Appointment booking.png",
    startSec: 171.6,
    endSec: 198.7,
  },
  {
    id: "12-telehealth-lobby",
    file: "phil-vsl/12 _ Telehealth join _ lobby.png",
    startSec: 198.7,
    endSec: 216.2,
  },
];

// Fade in/out duration in seconds — shared across all overlays for consistency.
export const FADE_IN_SEC = 0.35;
export const FADE_OUT_SEC = 0.35;
