import re, subprocess, sys
mp3, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])


if __name__ == "__main__":
    mind = float(sys.argv[4]) if len(sys.argv) > 4 else 0.25
    out = subprocess.run(["ffmpeg","-v","info","-i",mp3,"-af",
                          f"silencedetect=noise=-33dB:d={mind}","-f","null","-"],
                         capture_output=True, text=True).stderr
    cur, res = None, []
    for m in re.finditer(r"silence_(start|end): ([\d.]+)", out):
        k, v = m.group(1), float(m.group(2))
        if k == "start": cur = v
        elif cur is not None: res.append((cur, v)); cur = None
    print(f"pauses >= {mind}s in [{a},{b}]  (safe cut = midpoint)")
    for s, e in res:
        if e >= a and s <= b:
            print(f"  pause {s:7.2f} -> {e:7.2f}  ({e-s:.2f}s)  cut@{(s+e)/2:.2f}")
