"""Shared audio helpers: a 10ms loudness track, energy dips, and voiced runs.

Used by fillers.py and assemble.py to cut where there is NO pause. Between two words that
run together there is still a dip in loudness (the gap between syllables). Cutting at the
quietest 10ms there, with a short fade, removes a tight "um" or a stumble without clipping
the next word, which is how an editor cuts it by hand.
"""
import subprocess
import numpy as np

FRAME = 0.01


def seek(src, start, dur=None):
    """ffmpeg input args for [start, start+dur] that are fast AND exact.
    A plain fast seek (-ss before -i) with -t returned 0.29s instead of 1.2s on stream-copied
    files (Fathom HLS downloads), which corrupted loudness tracks and dip cuts. Fast-seek to 3s
    before, then seek exactly from there."""
    pre = max(0.0, start - 3.0)
    a = ["-ss", f"{pre:.3f}", "-i", src, "-ss", f"{start - pre:.3f}"]
    return a + (["-t", f"{dur:.3f}"] if dur else [])


class Track:
    def __init__(self, src, start=0.0, end=None):
        start = max(0.0, start)
        cmd = ["ffmpeg", "-v", "error"] + seek(src, start, (end - start) if end else None)
        cmd += ["-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"]
        x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.int16).astype(np.float32) / 32768
        n = len(x) // 160
        self.t0 = start
        self.db = 20 * np.log10(np.sqrt((x[:n * 160].reshape(n, 160) ** 2).mean(1)) + 1e-9)
        self.peak = float(np.percentile(self.db, 90)) if n else -30.0

    def idx(self, t):
        return int(np.clip(round((t - self.t0) / FRAME), 0, len(self.db) - 1))

    def at(self, t):
        return float(self.db[self.idx(t)])

    def valley(self, t, radius=0.12):
        """Quietest 10ms within ±radius of t. Returns (time, dB below the speech peak)."""
        a, b = self.idx(t - radius), self.idx(t + radius)
        if b <= a:
            return t, 0.0
        k = a + int(np.argmin(self.db[a:b + 1]))
        return self.t0 + k * FRAME, self.peak - float(self.db[k])

    def voiced_runs(self, a, b, below_peak=12, min_len=0.12):
        """Stretches between a and b loud enough to be speech (not breath or room tone)."""
        i, j = self.idx(a), self.idx(b)
        on = self.db[i:j] > self.peak - below_peak
        runs, s = [], None
        for k, v in enumerate(on):
            if v and s is None:
                s = k
            if (not v or k == len(on) - 1) and s is not None:
                e = k if not v else k + 1
                if (e - s) * FRAME >= min_len:
                    runs.append((self.t0 + (i + s) * FRAME, self.t0 + (i + e) * FRAME))
                s = None
        return runs
