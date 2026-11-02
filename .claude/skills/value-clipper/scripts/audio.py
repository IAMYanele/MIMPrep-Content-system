"""Shared audio helpers: a 1ms loudness track, energy dips, voiced runs, and word edges.

Used by fillers.py, keeps.py and assemble.py to cut where there is NO pause. Between two
words that run together there is still a dip in loudness (the gap between syllables).
Cutting at the quietest millisecond there, with a short crossfade, removes a tight "um" or a
stumble without clipping the next word, which is how an editor cuts it by hand.

Resolution: the envelope STEPS every 1ms but MEASURES over 20ms. A true 1ms RMS is not a
loudness measure at all -- a 100Hz voice does not complete one cycle in 1ms, so the value
swings with the waveform and the "quietest millisecond" lands on a zero crossing in the
middle of a vowel. The 20ms window is the loudness; the 1ms step is the resolution.
"""
import subprocess
import numpy as np

SR = 16000
HOP, WIN = 16, 320                   # 1ms step, 20ms window
FRAME = HOP / SR                     # 0.001s -- the grid every time this module returns lands on


def seek(src, start, dur=None):
    """ffmpeg input args for [start, start+dur] that are fast AND exact.
    A plain fast seek (-ss before -i) with -t returned 0.29s instead of 1.2s on stream-copied
    files (Fathom HLS downloads), which corrupted loudness tracks and dip cuts. Fast-seek to 3s
    before, then seek exactly from there."""
    pre = max(0.0, start - 3.0)
    a = ["-ss", f"{pre:.6f}", "-i", src, "-ss", f"{start - pre:.6f}"]
    return a + (["-t", f"{dur:.6f}"] if dur else [])


def _env(x, n):
    """dB envelope: RMS over WIN samples, centred on each 1ms frame time.
    Cumulative sum of squares, so the 20ms window costs the same as a 1ms one."""
    if n <= 0:
        return np.zeros(0, np.float32)
    c = np.concatenate(([0.0], np.cumsum(np.square(x, dtype=np.float64))))
    i = np.arange(n) * HOP
    a = np.clip(i - WIN // 2, 0, len(x))
    b = np.clip(i + WIN // 2, 0, len(x))
    return (20 * np.log10(np.sqrt((c[b] - c[a]) / np.maximum(b - a, 1)) + 1e-9)).astype(np.float32)


class Track:
    def __init__(self, src, start=0.0, end=None):
        start = max(0.0, start)
        cmd = ["ffmpeg", "-v", "error"] + seek(src, start, (end - start) if end else None)
        cmd += ["-vn", "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"]
        x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.int16).astype(np.float32) / 32768
        n = len(x) // HOP
        self.t0 = start
        self.db = _env(x, n)
        # +6dB/oct tilt. A trailing "s" or "f" is ~20dB down broadband but loud above 4kHz, so
        # broadband alone calls the word finished too early and shaves the fricative.
        self.hdb = _env(np.diff(x, prepend=x[:1]) if n else x, n)
        self.peak = float(np.percentile(self.db, 90)) if n else -30.0
        self.hpeak = float(np.percentile(self.hdb, 90)) if n else -30.0

    def idx(self, t):
        return int(np.clip(round((t - self.t0) / FRAME), 0, len(self.db) - 1))

    def at(self, t):
        return float(self.db[self.idx(t)])

    def valley(self, t, radius=0.12):
        """Quietest millisecond within +-radius of t. Returns (time, dB below the speech peak)."""
        a, b = self.idx(t - radius), self.idx(t + radius)
        if b <= a:
            return t, 0.0
        k = a + int(np.argmin(self.db[a:b + 1]))
        return self.t0 + k * FRAME, self.peak - float(self.db[k])

    def _live(self, drop):
        """Per-frame "sound is still happening", broadband OR high band."""
        return (self.db > self.peak - drop) | (self.hdb > self.hpeak - drop)

    def word_end(self, t, drop=26, hold=0.06, pad=0.002, limit=1.0):
        """The millisecond the word actually stops speaking, plus pad.

        Scans forward from t for the LAST 1ms frame still carrying sound, where the word
        counts as over once nothing has carried for `hold`. Whisper's own word end is only
        a 10-20ms estimate and drifts +-100ms, so t is a starting point, not the answer.
        Returns (time, found): found=False means it ran to `limit` without ever going quiet,
        so the caller should fall back rather than trust the number."""
        live = self._live(drop)
        i, j = self.idx(t), self.idx(t + limit)
        last, quiet, need = i, 0, max(1, int(round(hold / FRAME)))
        for k in range(i, min(j, len(live) - 1) + 1):
            if live[k]:
                last, quiet = k, 0
            else:
                quiet += 1
                if quiet >= need:
                    return self.t0 + last * FRAME + pad, True
        return self.t0 + last * FRAME + pad, False

    def word_start(self, t, drop=26, hold=0.06, pad=0.002, limit=1.0):
        """Mirror of word_end: the millisecond speech actually begins, minus pad."""
        live = self._live(drop)
        i, j = self.idx(t), self.idx(t - limit)
        first, quiet, need = i, 0, max(1, int(round(hold / FRAME)))
        for k in range(i, max(j, 0) - 1, -1):
            if live[k]:
                first, quiet = k, 0
            else:
                quiet += 1
                if quiet >= need:
                    return self.t0 + first * FRAME - pad, True
        return self.t0 + first * FRAME - pad, False

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
