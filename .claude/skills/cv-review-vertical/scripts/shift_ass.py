# Re-time an existing caption file around a removed span (no re-transcription needed).
import re, sys
import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
from cvpaths import WORK as W
def t2s(t):
    h, m, s = t.split(":"); return int(h)*3600 + int(m)*60 + float(s)

def s2t(x):
    x = max(0.0, x); h = int(x//3600); m = int(x%3600//60); s = x % 60
    return f"{h}:{m:02d}:{s:05.2f}"

def shift(src, dst, a, b):
    d = b - a
    out, kept, dropped = [], 0, 0
    for ln in open(src, encoding="utf-8").read().splitlines():
        if not ln.startswith("Dialogue:"):
            out.append(ln); continue
        head, rest = ln.split(":", 1)
        f = rest.split(",", 9)
        st, en = t2s(f[1].strip()), t2s(f[2].strip())
        if en <= a + 0.02:                       # before the cut
            pass
        elif st >= b - 0.02:                     # after the cut -> pull earlier
            st, en = st - d, en - d
        else:                                    # inside the removed span
            dropped += 1; continue
        f[1], f[2] = s2t(st), s2t(en)
        out.append("Dialogue:" + ",".join(f)); kept += 1
    open(dst, "w", encoding="utf-8").write("\n".join(out) + "\n")
    print(f"  {src.split('/')[-1]}: kept {kept}, dropped {dropped} (removed {d:.2f}s)")

if __name__ == "__main__":
    for clip, a, b in ((5, 62.55, 71.09), (12, 23.93, 28.66), (13, 62.37, 64.40)):
        shift(f"{W}/render/clip{clip}.ass", f"{W}/render/clip{clip}_trim.ass", a, b)
