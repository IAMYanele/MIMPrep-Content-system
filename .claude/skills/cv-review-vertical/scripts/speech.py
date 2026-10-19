import re, subprocess, sys
mp3, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])


if __name__ == "__main__":
    out = subprocess.run(["ffmpeg","-v","info","-i",mp3,"-af",
                          "silencedetect=noise=-32dB:d=0.12","-f","null","-"],
                         capture_output=True, text=True).stderr
    sil = []
    cur = None
    for m in re.finditer(r"silence_(start|end): ([\d.]+)", out):
        k, v = m.group(1), float(m.group(2))
        if k == "start": cur = v
        elif cur is not None: sil.append((cur, v)); cur = None
    # invert into speech bursts
    speech, t = [], 0.0
    for s, e in sil:
        if s > t: speech.append((t, s))
        t = e
    speech.append((t, 1e9))
    print(f"speech bursts in [{a},{b}]:")
    for s, e in speech:
        if e >= a and s <= b:
            print(f"  {max(s,a):7.2f} - {min(e,b):7.2f}  ({min(e,b)-max(s,a):.2f}s)")
