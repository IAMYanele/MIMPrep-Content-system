"""9:16 short v3 - four-beat arc, subject-centred b-roll, slow motion, +40ms sync.

  0.00 - 5.40   HER     who she is
  5.40 - 9.40   B-ROLL  a school talk, under "a few LBS networking events in Paris"
  9.40 - 27.30  HER     the decision, then the whole advice beat - her face carries this
 27.30 - 29.60  B-ROLL  students, under "I talked to a lot of current students"
 29.60 - 31.60  B-ROLL  someone working, under "to get a feel of the culture"
 31.60 - 40.40  HER     the payoff

B-roll crops are centred on the SUBJECT, not the frame. The old centre crop (x=1312)
clipped the sofa shot's subject clean off at the right edge - they sit at x~2575.
"""
import json, os, subprocess, sys

J = "F:/premiere pro render/clip-jobs/margaux"
BR = "F:/thomas b-roll"
CUT = f"{J}/short3_cut.mp4"
OUT = "F:/premiere pro render/Margaux - Edit/Margaux - LBS MFA (9x16 v3).mp4"
FPS, CX = 25, 528

def run(c):
    r = subprocess.run(c, capture_output=True, text=True)
    if r.returncode: print("FAILED:", " ".join(c[:9]), "\n", r.stderr[-900:]); sys.exit(1)

def seg(src, ss, dur, z0, z1, out, crop):
    nf = max(1, round(dur * FPS))
    vf = (f"fps={FPS},crop={crop},scale=2160:3840:flags=lanczos,"
          f"zoompan=z='{z0}+({z1}-{z0})*on/{nf}':d=1:"
          f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=2160x3840:fps={FPS},"
          f"scale=1080:1920:flags=lanczos")
    run(["ffmpeg","-v","error","-y","-ss",f"{ss:.3f}","-t",f"{dur:.3f}","-i",src,"-an",
         "-vf",vf,"-c:v","libx264","-crf","16","-preset","medium","-pix_fmt","yuv420p",out])

HER = f"608:1080:{CX}:0"
print("segments...")
seg(CUT,  0.00,  5.40, 1.000, 1.015, f"{J}/t_a.mp4", HER);                        print("  her   0.00-5.40")
seg(f"{BR}/C20250925_1357.MP4", 0.4, 4.00, 1.000, 1.030, f"{J}/t_b.mp4", "1215:2160:1270:0"); print("  broll talk     (x1270)")
seg(CUT,  9.40, 17.90, 1.000, 1.015, f"{J}/t_c.mp4", HER);                        print("  her   9.40-27.30")
seg(f"{BR}/C20250925_1373.MP4", 2.4, 2.30, 1.000, 1.025, f"{J}/t_d.mp4", "1215:2160:1400:0"); print("  broll students (x1400)")
seg(f"{BR}/C20260313_1666.MP4", 5.0, 2.00, 1.025, 1.000, f"{J}/t_e.mp4", "1215:2160:1968:0"); print("  broll culture  (x1968)")
seg(CUT, 31.60,  8.80, 1.000, 1.015, f"{J}/t_f.mp4", HER);                        print("  her  31.60-40.40")

open(f"{J}/tlist.txt","w").write("".join(f"file 't_{k}.mp4'\n" for k in "abcdef"))
run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",f"{J}/tlist.txt","-c","copy",f"{J}/v3_video.mp4"])
run(["ffmpeg","-v","error","-y","-i",f"{J}/v3_video.mp4","-itsoffset","0.040","-i",CUT,
     "-map","0:v","-map","1:a","-c:v","copy","-c:a","aac","-b:a","192k","-movflags","+faststart",f"{J}/v3_av.mp4"])

# ---- captions ----
ws = json.load(open(f"{J}/short3_cut.heard.json", encoding="utf-8"))
for i,t in {4:"Margaux.", 30:"school", 45:"finance"}.items(): ws[i]["w"] = t
DROP = {10, 46}                      # 10 = the "Okay," artefact at the block-1 join; 46 = "arts" (merged into "finance")
ws = [w for i,w in enumerate(ws) if i not in DROP]

lines, cur = [], []
for i,x in enumerate(ws):
    cur.append(x); nxt = ws[i+1] if i+1 < len(ws) else None
    txt = " ".join(c["w"] for c in cur)
    if (x["w"].rstrip()[-1:] in ".!?," or len(cur) >= 5 or len(txt) >= 24
            or (nxt and nxt["s"] - x["e"] > 0.35) or nxt is None):
        lines.append((cur[0]["s"]+0.040, x["e"]+0.040, txt.strip())); cur = []
fixed = []
for k,(a,b,t) in enumerate(lines):
    if k+1 < len(lines): b = min(b, lines[k+1][0]-0.01)
    if b > a: fixed.append((a,b,t))
def ts(v): return f"{int(v//3600)}:{int(v%3600//60):02d}:{v%60:05.2f}"
head = ("[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\n"
 "ScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,"
 "SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,"
 "Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\n"
 "Style: Cap,Helvetica Now Text Medium,88,&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,0,0,0,0,"
 "100,100,0,0,1,0,3,5,60,60,60,1\n\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,"
 "MarginV,Effect,Text\n")
open(f"{J}/short3.ass","w",encoding="utf-8").write(
    head + "".join(f"Dialogue: 0,{ts(a)},{ts(b)},Cap,,0,0,0,,{{\\pos(540,1380)}}{t}\n" for a,b,t in fixed))
print(f"\n{len(fixed)} caption lines")

os.chdir(J)
run(["ffmpeg","-v","error","-y","-i","v3_av.mp4","-vf","subtitles=short3.ass",
     "-c:v","libx264","-crf","18","-preset","fast","-pix_fmt","yuv420p",
     "-c:a","copy","-movflags","+faststart",OUT])
for k in "abcdef": os.remove(f"{J}/t_{k}.mp4")
print("wrote", OUT)
