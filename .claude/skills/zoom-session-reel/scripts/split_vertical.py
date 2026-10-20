"""9:16 split-screen of a Zoom session cut: the MiM Prep tutor on top, the (hidden) student below,
captions on the seam in the MiM Prep caption style.

  panels    1080x960 each, cropped per layout.json (measure_layout.py), lanczos + light unsharp
            (a 360px-wide Zoom crop is scaled 3x, so it's soft; that's the source)
  captions  Helvetica Now Text Medium 88, white, no outline, soft shadow, centred on y=960,
            max 2 words / 11 characters a line, never across a sentence end
  words     spelling from the KEPT words (keeps.py's <plan>.expected.json, with caption fixes),
            timing from a transcription of the finished cut (assemble.py's <clip>.heard.json),
            aligned with difflib; unmatched words are spread evenly between their neighbours.
            Mapping source-transcript times through the cut windows instead put words on the
            wrong side of joins, and a fresh transcription alone mishears accented speech.

usage:
  python split_vertical.py "<hidden cut.mp4>" "<out 9x16.mp4>" --layout <job>/layout.json \\
      --expected <job>/plan_X.expected.json --heard "<cut>.heard.json" [--fix "quants=>quant"]
Without --heard the cut is transcribed here (slower). Without --expected the captions are the
transcription as heard.
"""
import argparse, difflib, json, os, re, subprocess, tempfile
from pathlib import Path

W, H, PANEL, CAP_Y = 1080, 1920, 960, 960
FIXES = {"gmat": "GMAT"}


def norm(t):
    return re.sub(r"[^a-z0-9']", "", t.lower())


def transcribe(clip, prompt=""):
    from faster_whisper import WhisperModel
    m = None
    for name in ("small.en", "small", "base.en"):
        try:
            m = WhisperModel(name, device="cpu", compute_type="int8", local_files_only=True); break
        except Exception:
            continue
    wav = os.path.join(tempfile.gettempdir(), f"sv_{os.getpid()}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", clip, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    segs, _ = m.transcribe(wav, language="en", beam_size=5, word_timestamps=True, vad_filter=False, initial_prompt=prompt[:600])
    out = [{"w": w.word.strip(), "s": w.start, "e": w.end} for sg in segs for w in sg.words if w.word.strip()]
    os.remove(wav)
    return out


def align(expected, heard):
    hw = [(x["s"], x["e"], norm(x["w"])) for x in heard if norm(x["w"])]
    exp = [norm(x) for x in expected]
    t = [None] * len(expected)
    blocks = difflib.SequenceMatcher(None, exp, [h[2] for h in hw], autojunk=False).get_matching_blocks()
    for a, b, n in blocks:
        for k in range(n):
            t[a + k] = [hw[b + k][0], hw[b + k][1]]
    i = 0
    while i < len(t):
        if t[i] is None:
            j = i
            while j < len(t) and t[j] is None:
                j += 1
            lo = t[i - 1][1] if i else 0.0
            hi = t[j][0] if j < len(t) else (hw[-1][1] if hw else lo + 0.3 * (j - i))
            step = max(0.0, hi - lo) / (j - i)
            for k in range(i, j):
                t[k] = [lo + step * (k - i), lo + step * (k - i + 1)]
            i = j
        i += 1
    print(f"caption timing: {len(expected)} words, {len(expected) - sum(n for *_, n in blocks)} interpolated")
    return [[a, b, w] for (a, b), w in zip(t, expected)]


def clean(t):
    t = re.sub(r"[^\w'%?-]+$", "", t.strip()).replace("?", "")
    return FIXES.get(t.lower(), t)


def chunks(words, max_words=2, max_chars=11, max_gap=0.55, max_dur=1.5):
    out, cur = [], []
    for w in words:
        ended = bool(cur) and bool(re.search(r"[.!?]$", cur[-1][2]))
        wide = bool(cur) and len(" ".join(clean(x[2]) for x in cur)) + 1 + len(clean(w[2])) > max_chars
        if cur and (ended or wide or len(cur) >= max_words or w[0] - cur[-1][1] > max_gap or w[1] - cur[0][0] > max_dur):
            out.append(cur); cur = []
        cur.append(w)
    return out + ([cur] if cur else [])


def ass_time(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def write_ass(path, cks, total):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
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
        en = min(max(en, st + 0.40), total, nxt - 0.01)        # never two lines on screen at once
        txt = " ".join(clean(w[2]) for w in ck).strip()
        if en > st and txt:
            lines.append(f"Dialogue: 0,{ass_time(st)},{ass_time(en)},Cap,,0,0,0,,{{\\pos({W // 2},{CAP_Y})}}{txt}")
    open(path, "w", encoding="utf-8").write(head + "\n".join(lines) + "\n")
    return lines


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clip"); ap.add_argument("out"); ap.add_argument("--layout", required=True)
    ap.add_argument("--expected"); ap.add_argument("--heard")
    ap.add_argument("--fix", action="append", default=[], help='caption word fix "heard=>right"')
    a = ap.parse_args()
    for f in a.fix:
        k, v = f.split("=>"); FIXES[k.lower()] = v
    lay = json.load(open(a.layout))
    total = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.clip],
                                 capture_output=True, text=True).stdout.strip())
    expected = json.load(open(a.expected, encoding="utf-8")) if a.expected else None
    heard = json.load(open(a.heard, encoding="utf-8")) if a.heard else transcribe(a.clip, " ".join(expected or []))
    words = align(expected, heard) if expected else [[x["s"], x["e"], x["w"]] for x in heard]
    for w in words:                                    # a zero-length word would vanish from the captions
        if w[1] - w[0] < 0.16:
            w[1] = w[0] + 0.16
    ass = str(Path(a.out).with_suffix(".ass"))
    lines = write_ass(ass, chunks(words), total)
    esc = ass.replace("\\", "/").replace(":", r"\:")
    (tx, ty, tw, th), (sx, sy, sw, sh) = lay["tutor_crop"], lay["student_crop"]
    fc = (f"[0:v]split=2[a][b];"
          f"[a]crop={tw}:{th}:{tx}:{ty},scale={W}:{PANEL}:flags=lanczos,unsharp=5:5:0.5[t];"
          f"[b]crop={sw}:{sh}:{sx}:{sy},scale={W}:{PANEL}:flags=lanczos,unsharp=5:5:0.5[s];"
          f"[t][s]vstack=inputs=2,setsar=1,subtitles='{esc}'[v]")
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", a.clip, "-filter_complex", fc, "-map", "[v]", "-map", "0:a",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-c:a", "copy",
                    "-movflags", "+faststart", a.out], check=True)
    print(f"{a.out}: {len(lines)} caption lines over {total:.1f}s")
    print(" ".join(clean(w[2]) for w in words))


if __name__ == "__main__":
    main()
