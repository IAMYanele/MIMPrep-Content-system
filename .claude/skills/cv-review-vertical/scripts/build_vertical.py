# Build the 9:16 split-screen CV-review clip: talking head on top, blurred CV below,
# CV scrolls to follow the speech, captions burned over the video panel.
import json, os, subprocess, sys

import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
from cvpaths import WORK as W
CANVAS_W, CANVAS_H = 1080, 1920
TOP_H = 640                      # talking-head panel (matches the reference edit)
PANEL_H = CANVAS_H - TOP_H       # 1280 CV window
CAP_Y = 556                      # caption baseline inside the video panel
# Talking-head crop, solved from the reference edit: three lamp bars in the
# reference panel map onto the source bars at x=376/506/643 with scale 0.8352.
# Camera is identical across all 13 clips, so one rect fits them all.
SRC_CROP_W, SRC_CROP_H = 1292, 766
SRC_CROP_X, SRC_CROP_Y = 383, 114

def esc(p):   # ffmpeg filter path escaping on Windows
    return p.replace("\\", "/").replace(":", r"\:")

MIN_WORD = 0.16   # seconds a caption line needs to survive the overlap clamp

def widen_degenerate(words):
    """Give zero-length words a real duration by borrowing slack from neighbours.

    Whisper regularly emits words whose start == end. Such a word becomes a
    zero-length caption line, the overlap clamp then pushes its end BEFORE its
    start, and the line is dropped -- the word silently disappears from the
    captions while remaining audible. That is how "quantify" went missing.

    Borrow from whichever neighbour has slack, never shrinking one below
    MIN_WORD, so surrounding timings stay honest.
    """
    w = [list(x) for x in words]
    for i, cur in enumerate(w):
        if cur[1] - cur[0] >= MIN_WORD:
            continue
        need = MIN_WORD - (cur[1] - cur[0])
        nxt = w[i + 1] if i + 1 < len(w) else None
        if nxt:
            slack = max(0.0, (nxt[1] - nxt[0]) - MIN_WORD)
            take = min(need, slack, max(0.0, nxt[1] - cur[1] - MIN_WORD))
            if take > 0:
                cur[1] += take
                nxt[0] = cur[1]
                need -= take
        prv = w[i - 1] if i > 0 else None
        if need > 0 and prv:
            slack = max(0.0, (prv[1] - prv[0]) - MIN_WORD)
            take = min(need, slack)
            if take > 0:
                prv[1] -= take
                cur[0] = prv[1]
    return [tuple(x) for x in w]

def attach_breaks(words, text):
    """Whisper's word list has no punctuation but `text` does. Walk them in parallel and
    flag each word that a sentence ends on, so captions never straddle a sentence."""
    import re as _re
    toks = _re.findall(r"[^\s]+", text or "")
    out, ti = [], 0
    def bare(x): return _re.sub(r"[^\w%']+", "", x).lower()
    for (st, en, w) in words:
        brk = False
        bw = bare(w)
        for k in range(ti, min(ti + 6, len(toks))):
            if bare(toks[k]) == bw and bw:
                brk = bool(_re.search(r"[.!?]+[\"')\]]*$", toks[k]))
                ti = k + 1
                break
        out.append((st, en, w, brk))
    return out


def out_words(clip, windows):
    """Map source-time words onto the output timeline."""
    d = json.load(open(f"{W}/transcripts/clip{clip}.json", encoding="utf-8"))
    res, off = [], 0.0
    for (a, b) in windows:
        for wd in d["words"]:
            s, e = wd["start"], wd["end"]
            if e <= a or s >= b: continue
            s2, e2 = max(s, a), min(e, b)
            res.append((off + (s2 - a), off + (e2 - a), wd["word"]))
        off += b - a
    return res, off

def chunks(words, max_words=2, max_chars=11, max_gap=0.55, max_dur=1.5):
    out, cur = [], []
    for w in words:
        ended = bool(cur) and len(cur[-1]) > 3 and cur[-1][3]   # previous word closed a sentence
        wide = bool(cur) and len(" ".join(x[2] for x in cur)) + 1 + len(w[2]) > max_chars
        if cur and (ended or wide or len(cur) >= max_words
                    or w[0] - cur[-1][1] > max_gap
                    or w[1] - cur[0][0] > max_dur):
            out.append(cur); cur = []
        cur.append(w)
    if cur: out.append(cur)
    # a 1-2 word tail that just closes a sentence reads better joined to the line before it
    merged = []
    for ck in out:
        if (merged and len(ck) <= 1 and len(merged[-1]) + len(ck) <= 2
                and len(" ".join(x[2] for x in merged[-1] + ck)) <= 11
                and ck[0][0] - merged[-1][-1][1] < 0.45
                and ck[-1][1] - merged[-1][0][0] < 2.4
                and not (len(merged[-1][-1]) > 3 and merged[-1][-1][3])):
            merged[-1] = merged[-1] + ck
        else:
            merged.append(ck)
    return merged

def ass_time(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

def write_ass(path, cks, total):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {CANVAS_W}
PlayResY: {CANVAS_H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
Style: Cap,HelveticaNowText Medium,88,&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,0,0,0,0,100,100,0,0,1,0,3,5,40,40,40,1

[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
"""
    lines = []
    for i, ck in enumerate(cks):
        st, en = ck[0][0], ck[-1][1] + 0.12
        nxt = cks[i + 1][0][0] if i + 1 < len(cks) else total
        en = min(max(en, st + 0.40), total, nxt - 0.01)
        if en <= st: continue
        txt = " ".join(w[2].strip() for w in ck).replace("\n", " ").strip()
        if not txt: continue
        lines.append(f"Dialogue: 0,{ass_time(st)},{ass_time(en)},Cap,,0,0,0,,"
                     rf"{{\pos({CANVAS_W//2},{CAP_Y})}}{txt}")
    open(path, "w", encoding="utf-8").write(head + "\n".join(lines) + "\n")
    return len(lines)

def scroll_expr(keys, maxs):
    """Piecewise-linear scroll as a nested ffmpeg if() expression."""
    e = f"{keys[-1][1]:.1f}"
    for i in range(len(keys) - 2, -1, -1):
        t0, v0 = keys[i]; t1, v1 = keys[i + 1]
        seg = (f"{v0:.1f}" if abs(v1 - v0) < 0.01
               else f"({v0:.1f}+({v1 - v0:.1f})*(t-{t0:.2f})/{max(0.01, t1 - t0):.2f})")
        e = f"if(lt(t,{t1:.2f}),{seg},{e})"
    return f"max(0,min({maxs},{e}))"

def build(clip, windows, keys, src_video, cv_png, out_path, final_json=None, ass_path=None):
    if ass_path and os.path.exists(ass_path):
        # captions already prepared (re-timed around a removed span): just need the length
        total = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                                      "-of","csv=p=0", src_video],
                                     capture_output=True, text=True).stdout.strip())
        words, src = [], "re-timed caption file"
    elif final_json and os.path.exists(final_json):
        # caption timings taken from the FINISHED audio -> already in output time
        fj = json.load(open(final_json, encoding="utf-8"))
        words = [(w["start"], w["end"], w["word"]) for w in fj.get("words", [])]
        words = attach_breaks(words, fj.get("text", ""))
        import capfix
        words = capfix.fix_words(clip, words)
        words = widen_degenerate(words)
        total = float(fj.get("duration") or 0) or (words[-1][1] if words else 0)
        src = "final-audio transcript"
    else:
        words, total = out_words(clip, windows)
        src = "mapped from source transcript"
    cks = chunks(words) if words else []
    if ass_path and os.path.exists(ass_path):
        ass, n, src = ass_path, "prebuilt", "re-timed caption file"
    else:
        ass = f"{W}/render/clip{clip}.ass"
        n = write_ass(ass, cks, total)

    from PIL import Image
    cvh = Image.open(cv_png).height
    maxs = max(0, cvh - PANEL_H)
    sx = scroll_expr(keys, maxs)

    vf = (
        f"[0:v]crop={SRC_CROP_W}:{SRC_CROP_H}:{SRC_CROP_X}:{SRC_CROP_Y},"
        f"scale={CANVAS_W}:{TOP_H},setsar=1[top];"
        f"[1:v]crop={CANVAS_W}:{PANEL_H}:0:'{sx}',setsar=1[cvwin];"
        f"color=white:s={CANVAS_W}x{CANVAS_H}:r=30[bg];"
        f"[bg][top]overlay=0:0:shortest=1[a];"
        f"[a][cvwin]overlay=0:{TOP_H}[b];"
        f"[b]subtitles='{esc(ass)}'[v]"
    )
    cmd = ["ffmpeg", "-v", "error", "-stats", "-y",
           "-i", src_video, "-loop", "1", "-i", cv_png,
           "-filter_complex", vf, "-map", "[v]", "-map", "0:a",
           "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
           "-c:v", "libx264", "-preset", "medium", "-crf", "20",
           "-pix_fmt", "yuv420p", "-r", "30", "-fps_mode", "cfr",
           "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
           "-t", f"{total:.3f}", out_path]
    print(f"clip{clip}: {len(words)} words ({src}) -> {n} caption lines, CV {cvh}px, max scroll {maxs}")
    r = subprocess.run(cmd)
    print("exit", r.returncode)
