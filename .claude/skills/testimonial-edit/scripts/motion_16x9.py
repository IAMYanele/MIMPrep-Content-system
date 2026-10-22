"""16:9 v2 - the +40ms audio fix plus a slow drift on every segment.

Nine hard cuts between two locked-off angles read as abrupt because nothing moves.
Each segment now drifts 2-3.5% across its whole length, alternating push-in and
pull-out so two consecutive segments never move the same way, with a little
horizontal travel on the wides. At roughly 0.2% per second it is below conscious
notice; it just stops the frame feeling dead, so the cuts land as punctuation.

The two long holds (the permission beat at 0:49 and the PIMCO payoff at 1:16) both
push IN, because that is where the viewer should be leaning closer.
"""
import json, os, subprocess, sys

J = "F:/premiere pro render/clip-jobs/margaux"
WIDE, TIGHT = f"{J}/cut_wide.mp4", f"{J}/cut_tight.mp4"
OUT = "F:/premiere pro render/Margaux - Edit/Margaux - LBS MFA Testimonial (16x9 v2).mp4"
TMP = f"{J}/seg"
FPS = 25

#      start    end     angle  z0     z1     pan(px, + = drifts right)
SEGS = [
    (  0.00,  12.20, WIDE,  1.000, 1.035,  12),   # greeting, settle in
    ( 12.20,  29.60, TIGHT, 1.030, 1.000,   0),   # her background, ease out
    ( 29.60,  37.58, WIDE,  1.000, 1.030, -12),   # networking events
    ( 37.58,  42.18, TIGHT, 1.000, 1.020,   0),   # the decision
    ( 42.18,  49.42, WIDE,  1.030, 1.000,  10),   # arriving in London
    ( 49.42,  65.20, TIGHT, 1.000, 1.035,   0),   # reveal + permission beat: lean IN
    ( 65.20,  76.20, WIDE,  1.030, 1.000, -10),   # the method
    ( 76.20,  92.72, TIGHT, 1.000, 1.030,   0),   # PIMCO payoff: lean IN
    ( 92.72, 103.04, WIDE,  1.025, 1.000,   8),   # settle out
]

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAILED:", " ".join(cmd[:8]), "...\n", r.stderr[-1200:]); sys.exit(1)

parts = []
for i, (a, b, src, z0, z1, pan) in enumerate(SEGS):
    d = b - a
    nf = max(1, round(d * FPS))
    # zoompan drives the drift; x/y keep it centred while pan adds slow travel
    z = f"{z0}+({z1}-{z0})*on/{nf}"
    x = f"iw/2-(iw/zoom/2)+{pan*2}*(on/{nf}-0.5)"
    y = "ih/2-(ih/zoom/2)"
    # zoompan snaps the crop origin to whole pixels, which on a move this slow reads as
    # judder about twice a second. Working at 2x puts that snap below one output pixel and
    # the lanczos downscale smooths what is left: measured spikes 8 -> 3, magnitude halved.
    vf = (f"scale=3840:2160:flags=lanczos,"
          f"zoompan=z='{z}':d=1:x='{x}':y='{y}':s=3840x2160:fps={FPS},"
          f"scale=1920:1080:flags=lanczos")
    p = f"{TMP}{i:02d}.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-t", f"{d:.3f}", "-i", src,
         "-an", "-vf", vf, "-c:v", "libx264", "-crf", "16", "-preset", "medium",
         "-pix_fmt", "yuv420p", p])
    parts.append(p)
    print(f"  seg {i}  {a:6.2f}-{b:6.2f}  {'WIDE ' if src==WIDE else 'TIGHT'}  z {z0:.3f}->{z1:.3f}  pan {pan:+d}")

lst = f"{J}/segs.txt"
open(lst, "w").write("".join(f"file '{os.path.basename(p)}'\n" for p in parts))
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
     "-c", "copy", f"{J}/motion_video.mp4"])

# +40ms: the offset you confirmed at both the start and the end of the cut
run(["ffmpeg", "-v", "error", "-y", "-i", f"{J}/motion_video.mp4",
     "-itsoffset", "0.040", "-i", WIDE,
     "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
     "-movflags", "+faststart", OUT])
for p in parts: os.remove(p)
print("\nwrote", OUT)
