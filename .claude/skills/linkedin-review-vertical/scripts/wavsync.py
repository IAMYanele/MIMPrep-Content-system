"""Align a camera take to a separate audio recording, and measure the drift between them.

Two devices recording the same room do not run at the same speed. A clapper gives
one offset; over an hour the clocks pull apart by tens of milliseconds, which is
enough to see on the lips. So this measures the offset at several points and fits a
straight line through them: the slope is the drift, the intercept is the offset.

Two things here were each worth a wasted render:

* A cross-correlation must only score lags where the probe sits **entirely inside**
  the search window. Score a partial overlap and fewer samples are summed, so a
  wrong lag can win on a loud fragment. `lag()` returns None rather than guess.
* The resample ratio is ``k = 1 - b``, not ``1 / (1 - b)``. Inverting it doubles the
  drift instead of removing it, and the result looks "almost right", which is worse
  than obviously wrong.

Usage:
    python wavsync.py camera.wav recorder.wav          # offset, drift, residuals
"""
import subprocess
import sys

import numpy as np

SR = 48000


def read(path, sr=SR):
    """Mono float32 PCM via ffmpeg, so any container works."""
    o = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "1", "-ar", str(sr),
         "-f", "f32le", "-"], capture_output=True)
    return np.frombuffer(o.stdout, np.float32)


def envelope(x, sr=SR, hop=200):
    """Coarse energy envelope - correlating this is far cheaper than raw samples
    and is what survives different mic positions and room tone."""
    n = len(x) // hop * hop
    e = np.abs(x[:n]).reshape(-1, hop).mean(1)
    return e - e.mean()


def lag(probe, hay, max_lag=None):
    """Offset in samples of `probe` inside `hay`, or None if it cannot be placed.

    Only full overlaps are scored. A partial overlap sums fewer samples, so it can
    out-score the true position on a loud fragment.
    """
    if len(probe) > len(hay):
        return None
    span = len(hay) - len(probe)
    if span < 0:
        return None
    if max_lag is not None:
        span = min(span, max_lag)
    p = probe - probe.mean()
    pn = np.sqrt((p * p).sum())
    if pn == 0:
        return None
    best, best_score = None, -np.inf
    for k in range(span + 1):
        w = hay[k:k + len(probe)]
        w = w - w.mean()
        wn = np.sqrt((w * w).sum())
        if wn == 0:
            continue
        s = float((p * w).sum() / (pn * wn))
        if s > best_score:
            best, best_score = k, s
    return best, best_score


def probe_offsets(a, b, sr=SR, hop=200, n_probes=6, probe_sec=8.0, search_sec=4.0):
    """Measure the a->b offset at several points spread across the recording.

    Returns [(centre_seconds_in_a, offset_seconds), ...].
    """
    ea, eb = envelope(a, sr, hop), envelope(b, sr, hop)
    per = sr / hop
    plen = int(probe_sec * per)
    slack = int(search_sec * per)
    out = []
    usable = min(len(ea), len(eb)) - plen
    if usable <= 0:
        return out
    for i in range(n_probes):
        start = int(usable * (i + 0.5) / n_probes)
        probe = ea[start:start + plen]
        lo = max(0, start - slack)
        hi = min(len(eb), start + plen + slack)
        got = lag(probe, eb[lo:hi])
        if got is None:
            continue
        k, score = got
        if score < 0.5:                      # too weak to trust
            continue
        out.append(((start + plen / 2) / per, ((lo + k) - start) / per, score))
    return out


def fit_drift(points):
    """Least-squares line through (t, offset). Returns (offset_at_zero, slope, k).

    `k` is the factor to resample the second file by so it runs at the first's rate.
    """
    if len(points) < 2:
        return None
    t = np.array([p[0] for p in points], float)
    d = np.array([p[1] for p in points], float)
    b, a = np.polyfit(t, d, 1)
    return a, b, 1.0 - b


def main(path_a, path_b):
    a, b = read(path_a), read(path_b)
    pts = probe_offsets(a, b)
    if not pts:
        print("no usable probes - check the two files really are the same room")
        return 1
    for t, d, s in pts:
        print("  t=%7.1fs  offset %+8.1f ms  (score %.2f)" % (t, d * 1000, s))
    fit = fit_drift(pts)
    if fit is None:
        print("need at least two probes to fit drift")
        return 1
    a0, slope, k = fit
    resid = [(d - (a0 + slope * t)) * 1000 for t, d, _ in pts]
    print("\noffset at t=0 : %+.1f ms" % (a0 * 1000))
    print("drift         : %+.2f ms per minute" % (slope * 60 * 1000))
    print("resample ratio: %.9f   (k = 1 - slope, NOT 1/(1-slope))" % k)
    print("residual      : max %+.1f ms" % max(resid, key=abs))
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1], sys.argv[2]))
