"""The MiM Prep title card: a big serif title in a white rounded box with the tutor's credential
pill under it, shown for the first 9.7s of a 9:16 session reel.

Matched pixel for pixel to the reel Thomas approved (2026-10-20, "How to structure your GMAT
prep"; measurements in references/style.md), then moved up so the seam caption sits right on
the card (the user's correction the same day).

  box    white, corner r=25, top y=TOP (1016), 254px tall, centred on x=540, 54px side padding
  title  2 lines, bold condensed serif, #111111, cap height 65px, baselines TOP+112 and TOP+211
  pill   the tutor's credential pill (assets/pills/<tutor>.png, 708x79, r=15) 20px under the box;
         with no pill for that tutor, --pill-text renders one in the same serif (cap 30px)
  timing on from frame 0, fades out over 0.1s at 9.70s

The example's typeface isn't installed anywhere we know of. Georgia Pro Condensed SemiBold
narrowed to 91% is the closest match (ranked over all 668 installed fonts on Yanele's PC, then
checked side by side). With any other serif, the narrowing is recalibrated so "How to structure"
is 622px wide, as in the example.

usage:
  python title_card.py --line "How to use your" --line "GMAT mock exams" --tutor <tutor> --out card.png
  python title_card.py ... --apply "<reel 9x16.mp4>" "<reel 9x16 - TITLE.mp4>"
"""
import argparse, os, subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent.parent
W, H, SS = 1080, 1920, 4
TOP = 1016
BOX_H, BOX_R, PAD = 254, 25, 54
CAP, BASE1, BASE2 = 65, 112, 211          # baselines relative to the box top
PILL_GAP, PILL_H, PILL_R, PILL_CAP, PILL_BASE, PILL_PAD = 20, 79, 15, 30, 54, 26
INK = (17, 17, 17)
SHOW, FADE = 9.70, 0.10
REF_LINE, REF_WIDTH = "How to structure", 622  # the example's first line and its ink width

FONT_DIRS = ["C:/Windows/Fonts", os.path.expanduser("~/AppData/Local/Microsoft/Windows/Fonts"),
             "/Library/Fonts", os.path.expanduser("~/Library/Fonts"), "/System/Library/Fonts/Supplemental",
             "/usr/share/fonts/truetype"]
FONTS = ["GeorgiaPro-CondSemiBold.ttf", "GeorgiaPro-CondBold.ttf", "georgiab.ttf", "Georgia Bold.ttf", "timesbd.ttf",
         "Times New Roman Bold.ttf"]


def find_font():
    for name in FONTS:
        for d in FONT_DIRS:
            p = Path(d) / name
            if p.exists():
                return str(p)
    raise SystemExit("no serif title font found: install Georgia Pro (Windows optional fonts) or Georgia")


def sized(path, cap):
    size = 100
    for _ in range(4):
        b = ImageFont.truetype(path, size).getbbox("H", anchor="ls")
        size = max(8, int(round(size * cap / (b[3] - b[1]))))
    return ImageFont.truetype(path, size)


def rounded(x0, y0, x1, y1, r):
    m = Image.new("L", (W * SS, H * SS), 0)
    ImageDraw.Draw(m).rounded_rectangle((x0 * SS, y0 * SS, (x1 + 1) * SS - 1, (y1 + 1) * SS - 1), r * SS, fill=255)
    return np.asarray(m.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255


def text_layer(ft, condense, lines_at):
    """Lines drawn at SS scale, narrowed by `condense`, centred on x=540 at the given baselines."""
    ink = np.zeros((H, W), np.float32)
    for t, base in lines_at:
        lw = int(ft.getlength(t)) + 8 * SS
        line = Image.new("L", (lw, 160 * SS), 0)
        ImageDraw.Draw(line).text((lw // 2, 120 * SS), t, font=ft, fill=255, anchor="ms")
        nw = int(round(lw * condense / SS))
        m = np.asarray(line.resize((nw, 160), Image.LANCZOS)).astype(np.float32) / 255
        lx, ly = 540 - nw // 2, base - 120
        ink[ly:ly + 160, lx:lx + nw] = np.maximum(ink[ly:ly + 160, lx:lx + nw], m)
    return ink[..., None]


def card(lines, tutor=None, pill_text=None, top=TOP):
    path = find_font()
    ft = sized(path, CAP * SS)
    condense = REF_WIDTH / (ft.getlength(REF_LINE) / SS)
    rgba = np.zeros((H, W, 4), np.float32)
    widths = [ft.getlength(t) * condense / SS for t in lines]
    bw = max(widths) + 2 * PAD
    x0, x1 = int(round(540 - bw / 2)), int(round(540 + bw / 2))
    a = rounded(x0, top, x1, top + BOX_H, BOX_R)
    rgba[..., :3] = 255; rgba[..., 3] = a
    ink = text_layer(ft, condense, zip(lines, (top + BASE1, top + BASE2)))
    rgba[..., :3] = rgba[..., :3] * (1 - ink) + np.array(INK) * ink

    py = top + BOX_H + PILL_GAP
    pill = HERE / "assets" / "pills" / f"{(tutor or '').lower()}.png"
    if tutor and pill.exists():
        p = np.asarray(Image.open(pill).convert("RGBA")).astype(np.float32)
        ph, pw = p.shape[:2]; px = 540 - pw // 2
        al = p[..., 3:] / 255
        rgba[py:py + ph, px:px + pw, :3] = rgba[py:py + ph, px:px + pw, :3] * (1 - al) + p[..., :3] * al
        rgba[py:py + ph, px:px + pw, 3] = np.maximum(rgba[py:py + ph, px:px + pw, 3], al[..., 0])
    elif pill_text:
        pft = sized(path, PILL_CAP * SS)
        tw = pft.getlength(pill_text) * condense / SS
        px0, px1 = int(540 - tw / 2 - PILL_PAD), int(540 + tw / 2 + PILL_PAD)
        pa = rounded(px0, py, px1, py + PILL_H - 1, PILL_R)
        rgba[..., 3] = np.maximum(rgba[..., 3], pa)
        pink = text_layer(pft, condense, [(pill_text, py + PILL_BASE)])
        rgba[..., :3] = rgba[..., :3] * (1 - pink) + np.array(INK) * pink
    elif tutor:
        raise SystemExit(f"no pill for tutor '{tutor}' in assets/pills/: pass --pill-text \"Name · School · Score\"")
    print(f"title box x {x0}-{x1} (width {x1 - x0}), font {Path(path).name} at {ft.size // SS}px narrowed to {condense:.2f}")
    out = rgba.copy(); out[..., 3] *= 255
    return np.clip(out, 0, 255).astype(np.uint8)


def apply(card_png, reel, out):
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", reel, "-loop", "1", "-i", card_png,
                    "-filter_complex", f"[1:v]format=rgba,fade=t=out:st={SHOW}:d={FADE}:alpha=1[c];"
                                       f"[0:v][c]overlay=0:0:shortest=1:enable='lte(t,{SHOW + FADE + 0.05})'[v]",
                    "-map", "[v]", "-map", "0:a", "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p",
                    "-c:a", "copy", "-movflags", "+faststart", out], check=True)
    err = subprocess.run(["ffmpeg", "-v", "error", "-i", out, "-f", "null", "-"], capture_output=True, text=True).stderr
    if err.strip():
        raise SystemExit(f"{out} does not decode cleanly (re-run it; an F: read hiccup once truncated one): {err[:200]}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--line", action="append", required=True, help="title line (give 2)")
    ap.add_argument("--tutor", help="pill from assets/pills/<tutor>.png")
    ap.add_argument("--pill-text", help='credential pill text when the tutor has no pill PNG, e.g. "Name · School · Score"')
    ap.add_argument("--top", type=int, default=TOP)
    ap.add_argument("--out", required=True)
    ap.add_argument("--apply", nargs=2, metavar=("REEL", "OUT"), action="append", default=[],
                    help="burn the card into a reel (repeat for the mosaic and blur variants)")
    a = ap.parse_args()
    Image.fromarray(card(a.line, a.tutor, a.pill_text, a.top), "RGBA").save(a.out)
    for reel, out in a.apply:
        apply(a.out, reel, out)
        print("wrote", out)
