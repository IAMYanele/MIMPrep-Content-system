"""List the cuts in a finished edit and flag cuts that land too close together. Usage:
   python cutscan.py <video.mp4> [min_gap_s=1.0]
Change = mean frame-to-frame difference (gray, 108x192); a talking-head frame sits around 3-4.
A frame change over 35 is a cut: a b-roll edge or a camera switch (they measure 50-160; fast
camera motion peaks around 25-31). A cut into a white flash (a frame that jumps to near-white)
takes the flash's fade frames with it, so the hand-off counts once. Two cuts closer than min_gap read as a flash of the shot between
them. A cutaway ending 0.1 s before a camera switch shows as a pair like 5.52 / 5.60.
The second list holds jumps to check by eye. A trim jump on his face and a handheld jolt inside
a cutaway both measure about 12-16, so the numbers can't tell them apart."""
import subprocess, sys
import numpy as np
f = sys.argv[1]
gap = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
rate = subprocess.run(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=r_frame_rate",
                       "-of","csv=p=0",f],capture_output=True,text=True).stdout.strip()
if not rate:
    sys.exit(f"can't read {f}")
num, den = (rate.split(",")[0].split("/") + ["1"])[:2]; fps = float(num) / float(den)
w, h = 108, 192
raw = subprocess.run(["ffmpeg","-nostdin","-v","error","-i",f,"-vf",f"scale={w}:{h},format=gray",
                      "-f","rawvideo","-"],capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
m = fr.mean(axis=(1, 2))
t_of = lambda i: (i + 1) / fps                # d[i] is the change into frame i + 1
white = lambda i: m[i + 1] > 215 and m[i + 1] - m[i] > 25

cuts, motion, flash_until = [], [], -1.0      # cuts: [first, last, peak, into a flash]
for i in np.flatnonzero(d > 25):
    if t_of(i) <= flash_until:                # a fade frame of the flash just cut into
        cuts[-1][1] = i; cuts[-1][2] = max(cuts[-1][2], float(d[i])); continue
    if d[i] > 35:
        cuts.append([i, i, float(d[i]), white(i)])
        if white(i):
            flash_until = t_of(i) + 0.2
    elif motion and t_of(i) - t_of(motion[-1][1]) <= 0.2:
        motion[-1][1] = i; motion[-1][2] = max(motion[-1][2], float(d[i]))
    else:
        motion.append([i, i, float(d[i])])
eye = [(t_of(e[0]), e[2], "fast motion") for e in motion]
near_cut = lambda i: any(abs(t_of(i) - t_of(c[0])) <= 0.25 or abs(t_of(i) - t_of(c[1])) <= 0.25 for c in cuts)
for i in np.flatnonzero((d > 12) & (d <= 25)):
    nb = np.r_[d[max(0, i - 3):i], d[i + 1:i + 4]]
    if d[i] > 2.5 * (np.median(nb) + 1) and not near_cut(i):
        eye.append((t_of(i), float(d[i]), "isolated jump"))

print(f"{len(fr)} frames at {fps:g} fps, median change {np.median(d):.1f}")
print(f"cuts ({len(cuts)}):")
bad = 0
for k, (a, b, peak, fl) in enumerate(cuts):
    nxt = t_of(cuts[k + 1][0]) - t_of(b) if k + 1 < len(cuts) else None
    flag = f"   <-- {nxt:.2f}s to the next cut" if nxt is not None and nxt < gap else ""
    bad += bool(flag)
    kind = "  (white flash)" if fl else ""
    print(f"  {t_of(a):6.2f}s  peak {peak:5.1f}{kind}{flag}")
if eye:
    print("check by eye - the frames either side (trim jump on his face, or camera motion):")
    for t, x, why in sorted(eye):
        print(f"  {t:6.2f}s  change {x:5.1f}  {why}")
print(f"OK: no two cuts closer than {gap:g}s" if not bad else f"FLASH: {bad} pair(s) of cuts closer than {gap:g}s")
