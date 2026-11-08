"""Find where a word really starts and ends, and where it is safe to cut.

Whisper's word timings are not cut points. In a long take many words come back with
an identical start and end, and even the good ones are rounded. Cutting on them
shaves the end off words.

The part that matters: measure on a **high band as well as broadband**. A trailing
fricative (s, f, th, sh) carries almost no broadband energy - it sits about 20 dB
under the vowel - but it is loud above 4 kHz. Measured over a session's worth of
words, a broadband-only edge ended words a median 28 ms early and as much as 97 ms
early, which is audible as a clipped "s".

So: hold the word open while *either* band is above its floor.

Usage:
    python wordedge.py take.wav 12.40 12.90      # refine one word's edges
    python wordedge.py take.wav 10 40 --pauses   # list safe cut points in a window
"""
import subprocess
import sys

import numpy as np

SR = 48000
STEP_MS = 1.0


def read(path, sr=SR):
    o = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "1", "-ar", str(sr),
         "-f", "f32le", "-"], capture_output=True)
    return np.frombuffer(o.stdout, np.float32)


def _bands(x, sr=SR, step_ms=STEP_MS):
    """Per-step RMS of the full band and of everything above 4 kHz."""
    step = max(1, int(sr * step_ms / 1000.0))
    n = len(x) // step * step
    frames = x[:n].reshape(-1, step)
    broad = np.sqrt((frames * frames).mean(1) + 1e-12)
    # one-pole high pass at ~4 kHz, cheap and good enough to expose fricatives
    a = np.exp(-2 * np.pi * 4000.0 / sr)
    hp = np.empty_like(x[:n])
    prev_x = 0.0
    prev_y = 0.0
    xs = x[:n]
    # vectorised single-pole difference is not exact; the loop is fast enough here
    for i in range(len(xs)):
        y = a * (prev_y + xs[i] - prev_x)
        hp[i] = y
        prev_x = xs[i]
        prev_y = y
    hf = np.sqrt((hp.reshape(-1, step) ** 2).mean(1) + 1e-12)
    return broad, hf, step


def _floor(v, pct=12.0):
    return float(np.percentile(v, pct))


def edges(x, t0, t1, sr=SR, pad_ms=120.0, step_ms=STEP_MS, k=3.0):
    """Refine (t0, t1) for one word by walking out while either band is live."""
    pad = pad_ms / 1000.0
    a = max(0.0, t0 - pad)
    b = min(len(x) / sr, t1 + pad)
    seg = x[int(a * sr):int(b * sr)]
    if len(seg) < 4:
        return t0, t1
    broad, hf, step = _bands(seg, sr, step_ms)
    bf, hff = _floor(broad) * k, _floor(hf) * k
    live = (broad > bf) | (hf > hff)
    if not live.any():
        return t0, t1
    i0 = int((t0 - a) * sr / step)
    i1 = int((t1 - a) * sr / step)
    i0 = min(max(i0, 0), len(live) - 1)
    i1 = min(max(i1, 0), len(live) - 1)
    while i0 > 0 and live[i0 - 1]:
        i0 -= 1
    while i1 < len(live) - 1 and live[i1 + 1]:
        i1 += 1
    return a + i0 * step / sr, a + (i1 + 1) * step / sr


def pauses(x, a, b, sr=SR, min_ms=140.0, step_ms=STEP_MS, k=2.5):
    """Silent spans inside [a, b]. Cut in the middle of one of these, never on a word."""
    seg = x[int(a * sr):int(b * sr)]
    if len(seg) < 4:
        return []
    broad, hf, step = _bands(seg, sr, step_ms)
    bf, hff = _floor(broad) * k, _floor(hf) * k
    quiet = (broad <= bf) & (hf <= hff)
    out, run = [], None
    for i, q in enumerate(quiet):
        if q and run is None:
            run = i
        elif not q and run is not None:
            if (i - run) * step_ms >= min_ms:
                out.append((a + run * step / sr, a + i * step / sr))
            run = None
    if run is not None and (len(quiet) - run) * step_ms >= min_ms:
        out.append((a + run * step / sr, a + len(quiet) * step / sr))
    return out


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(2)
    x = read(sys.argv[1])
    t0, t1 = float(sys.argv[2]), float(sys.argv[3])
    if "--pauses" in sys.argv:
        for p0, p1 in pauses(x, t0, t1):
            print("  %7.3f - %7.3f  (%.0f ms)  cut at %.3f"
                  % (p0, p1, (p1 - p0) * 1000, (p0 + p1) / 2))
    else:
        s, e = edges(x, t0, t1)
        print("given  %.3f - %.3f" % (t0, t1))
        print("meas   %.3f - %.3f   (start %+.0f ms, end %+.0f ms)"
              % (s, e, (s - t0) * 1000, (e - t1) * 1000))
