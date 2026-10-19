import json, os, sys
import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
from cvpaths import WORK as W
sys.path.insert(0, W)
from build_vertical import build, PANEL_H
from PIL import Image

# Per batch: copy this file into the job folder and fill in the map there (never in the
# shared skill, since the output names carry the students' first names).
# clip number: (16:9 cut in IN, vertical output name in OUT)
SRC = {
 1: ("CV Review 01 - <school> CV <score>-10.mp4", "CV Review 01 - <first name> - vertical.mp4"),
}
IN  = "F:/cv review dubao/CLIPPED"
TRIMMED = set()        # clips whose source is $CVWORK/trimmed/clip<N>.mp4 (trim.py)
PREBUILT_ASS = set()   # clips captioned from an existing re-timed ASS (fallback when transcription is down)
SCROLL_END = {}        # e.g. {7: 36.0} when the client asks the CV to stop scrolling at 0:36
OUT = "F:/cv review dubao/VERTICAL"
os.makedirs(OUT, exist_ok=True)


if __name__ == "__main__":
    only = [int(a) for a in sys.argv[1:]] or list(SRC)
    for clip in only:
        src, dst = SRC[clip]
        src_path = f"{W}/trimmed/clip{clip}.mp4" if clip in TRIMMED else f"{IN}/{src}"
        fj  = f"{W}/captions/clip{clip}_final.json"
        png = f"{W}/render/clip{clip}_cv_blur.png"
        if clip in TRIMMED:
            import subprocess as _sp
            dur = float(_sp.run(["ffprobe","-v","error","-show_entries","format=duration",
                                 "-of","csv=p=0",src_path],capture_output=True,text=True).stdout.strip())
        else:
            dur = float(json.load(open(fj, encoding="utf-8")).get("duration") or 0)
        maxs = max(0, Image.open(png).height - PANEL_H)
        # reviewers read a CV top-to-bottom: hold at top, scroll through, hold at the end
        end = SCROLL_END.get(clip, 0.72 * dur)
        keys = [(0, 0), (min(0.20 * dur, end * 0.25), 0), (end, maxs), (dur + 5, maxs)]
        print(f"\n===== clip{clip} -> {dst}  (dur {dur:.1f}s, scroll 0..{maxs}) =====", flush=True)
        ap = f"{W}/render/clip{clip}_trim.ass" if clip in PREBUILT_ASS else None
        build(clip, None, keys, src_path, png, f"{OUT}/{dst}", final_json=fj, ass_path=ap)
