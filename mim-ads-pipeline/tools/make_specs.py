"""Reference-style b-roll plans for the five Master bodies -> specs/ref_<L>.json (read by place2.py)."""
import json

K = "G:/mim-master-urgency-2026-10/broll-kit/"
W = "C:/Users/yanel/Downloads/mim-ads-working-broll/"
FB = "F:/thomas b-roll/videos/b-roll/"
FC = "F:/thomas b-roll/videos/b-roll/"


def P(src, t, cx=.5, cy=.5, zoom=1.0):
    return {"src": src, "in": t, "cx": cx, "cy": cy, "zoom": zoom}


TOP_SCHOOLS = P(K + "C20250925_1346.mp4", 1.0, .40, .45)        # Thomas + "How to Get into the World's Top Business Schools"
SEATS_CLOSE = P(K + "C20250925_1392.mp4", 0.1, .50)             # Thomas close, "Limited Seats in the Cohort"
SEATS_WIDE = P(K + "C20250925_1385.mp4", 0.3, .62, .45)         # Thomas beside "Limited Seats in the Cohort"
SEATS_30 = P(K + "C20250925_1386.mp4", 2.0, .40, .45)           # "We only take ~30 students per round" slide
TIMING = P(K + "C20250925_1371.mp4", 2.0, .42, .45)             # "Why Timing & Insider Info Matter"
MASTERS = P(K + "C20260319_0005.mp4", 11.0, .38)                # Thomas at "MiM Prep Masters Admissions" screen
TAILORED = P(K + "C20260319_0014.mp4", 7.0, .50)                # "Tailored 1:1 mentorship" slide
MATCH = P(FB + "C20260319_0011.MP4", 4.0, .45)                  # "Match with Your Mentor"
ROOM = P(K + "C20260319_0034.mp4", 2.0, .50)                    # students round the table at laptops
TYPING = P(K + "C20260319_0031.mp4", 0.5, .30)                  # student typing at her laptop
AUDIENCE = P(K + "C20250925_1349.mp4", 0.3, .50)                # seminar audience in suits
CALL_LAPTOP = P(K + "DJI_20260824102252_0006_D.mp4", 5.0, .42)  # video call on a laptop
CALL_THOMAS = P(K + "B roll Thomas having a call .mp4", 9.0, .45, .45)
LAPTOP_BACK = P(K + "C20251227_2078.mp4", 13.0, .34)            # over Thomas's shoulder at his laptop
LAPTOP_FRONT = P(K + "C20251228_0001.mp4", 9.0, .50)            # Thomas working at his laptop
BRIEFING = P(W + "C20260319_0007.mp4", 11.6, .72)               # Thomas briefing a student at the table
MENTOR = P(W + "C20260319_0009.mp4", 0.2, .42)                  # mentor leaning over a student's laptop
STUDENT = P(W + "C20260319_0012.mp4", 3.5, .14)                 # student at his laptop
HANDS = P(W + "C20260319_0036.mp4", 22.0, .52)                  # hands typing
APPLICANT = P(W + "C20250925_1382.mp4", 1.2, .50)               # applicant in glasses at his laptop
LETTER = P(W + "C2_letter_punch.mp4", 0.2, .50, .50)            # recommendation letter on a laptop (vertical)
CHECKLIST = P(W + "C20250925_1377_stab.mp4", 6.4, .56)          # Thomas presenting the application checklist
CV_SLIDE = P(FC + "V4.mp4", 4.0, .50)                           # Thomas presenting "Boost your CV"
LOBBY = P(FC + "fx30 SW20250925_0041.MP4", 2.0, .62)            # young professional in a suit, lobby
TRIO = P(W + "E3_seminar_trio_punch.mp4", 0.0, .50, .45)        # three applicants listening (vertical)
SIDE_BY_SIDE = P(W + "D3_0032_punch.mp4", 0.0, .50)             # students side by side typing (vertical)


def run(anchor, why, *pieces, lead=0.08, back=0):
    return {"anchor": anchor, "back": back, "lead": lead, "why": why,
            "pieces": [{"dur": d, "panels": list(p)} for d, *p in pieces]}


# One b-roll on screen at a time (user, 2026-10-26: no 2-up / 3-up stacks). Full 9:16 crops, chained in runs.
F = lambda p, **kw: {**p, **kw}
TOP_SCHOOLS_F = F(TOP_SCHOOLS, cx=.33, cy=.5)
SEATS_WIDE_F = F(SEATS_WIDE, cx=.68, cy=.5)        # the "Limited Seats in the Cohort" slide
SEATS_30_F = F(SEATS_30, cx=.44, cy=.5)            # slide + presenter
TIMING_F = F(TIMING, cx=.40, cy=.5)
MASTERS_F = F(MASTERS, cx=.28, cy=.5)
MATCH_F = F(MATCH, cx=.62, cy=.5)
CV_SLIDE_F = F(CV_SLIDE, cx=.55, cy=.5)
ROOM_F = F(ROOM, cx=.62, cy=.5)
AUDIENCE_F = F(AUDIENCE, cx=.45, cy=.5)
CALL_LAPTOP_F = F(CALL_LAPTOP, cx=.36, cy=.5)
CALL_THOMAS_F = F(CALL_THOMAS, cx=.30, cy=.5)
BRIEFING_F = F(BRIEFING, cx=.70, cy=.5)
MENTOR_F = F(MENTOR, cx=.42, cy=.5)

SPECS = {
    "A": [run("at most top", "top business schools / first round closed", (1.6, TOP_SCHOOLS_F), (1.4, ROOM_F)),
          run("but every round", "every round that passes means fewer seats", (1.6, SEATS_CLOSE), (1.4, TYPING), lead=0.1),
          run("the ones who started", "the ones who started preparing weeks ago", (2.6, LAPTOP_BACK), lead=0.1),
          run("start now", "start now, apply with a full file", (1.4, BRIEFING_F), (1.3, MENTOR_F))],
    "B": [run("schools don't keep", "seats open all year", (1.6, SEATS_WIDE_F), (1.4, ROOM_F)),
          run("the next round you're", "fighting for what's left", (1.3, TYPING), (1.4, STUDENT), lead=0.04),
          run("that's why timing", "timing matters almost as much as your profile", (1.6, TIMING_F), (1.4, LAPTOP_BACK)),
          run("the second best", "the second best is the next round", (2.6, MASTERS_F))],
    "C": [run("you need the", "GMAT, essays, letters, CV, interview", (2.2, CHECKLIST), lead=0.04),
          run("which your referees", "referees send late / a CV rewritten", (1.9, LETTER), (1.6, CV_SLIDE_F), lead=0.5),
          run("together that's", "several weeks of real work", (2.6, LAPTOP_FRONT)),
          run("you'll see that", "the real start date is now", (2.4, MASTERS_F), lead=0.1)],
    "D": [run("we take 30", "30 students per round, 120 a year", (1.6, SEATS_CLOSE), (1.6, SEATS_30_F)),
          run("real attention from", "a mentor who knows their school", (1.5, MATCH_F), (1.5, MENTOR_F), lead=0.1),
          run("students who wait", "the students who wait find the round full", (1.4, TYPING), (1.4, STUDENT), lead=0.3),
          run("the decision isn't", "whether there's still a seat with us", (2.4, SEATS_WIDE_F), lead=0.1)],
    "E": [run("more time", "more time, more experience, a better score", (2.4, APPLICANT), back=2),
          run("better job", "salary at a better job, a year of delay", (2.6, LOBBY), back=2),
          run("competition doesn't", "the competition doesn't wait, new applicants every cycle", (1.6, TRIO), (1.6, AUDIENCE_F), back=2),
          run("not sure you're", "a call will tell you", (1.2, CALL_LAPTOP_F), (1.2, CALL_THOMAS_F), lead=0.1)],
}

for L, runs in SPECS.items():
    assert all(len(pc["panels"]) == 1 for r in runs for pc in r["pieces"]), f"{L}: a stack slipped in"
for L, runs in SPECS.items():
    json.dump({"cta": "book a free call", "runs": runs}, open(f"G:/mim-master-urgency-2026-10/specs/ref_{L}.json", "w"), indent=1)
print("wrote", ", ".join(f"ref_{L}.json" for L in SPECS))
