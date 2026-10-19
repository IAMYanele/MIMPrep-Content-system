"""Build the plate + text layout for a Thomas (@thomas_d_c) reel cover.

Takes a real photo or a video frame, crops it to 9:16 around Thomas, grades it, and
lays out the headline in Helvetica Now Text Medium (ALL CAPS): a small tracked kicker
over one or two big lines. Writes everything add_text.py / shift_composite.py need:

  <name>-base.png       graded 1080x1920 plate (the photo itself is never redrawn)
  <name>-subject.png    soft mask of Thomas (rembg)
  <name>-textmask.png   where every letter goes
  <name>-masthead.png   the big lines only (hair stays in front of these)
  <name>-guide.png      the layout as an image for Nano Banana (text on flat grey)
  <name>-preview.png    plain-PIL preview of the finished cover (no API call)
  <name>-prompt.txt     the Nano Banana prompt, filled in with these exact words

usage:
  python cover_layout.py --src photo.heic --name a --kicker "THE LONDON" --big "LOOPHOLE" --out build
  python cover_layout.py --src raw.mp4 --t 130.0 --name b --kicker "NEVER MAKE YOUR CV" --big "TOO DENSE" \
      --mode dark --placement top --out build

--big takes one or two lines separated by "/". --mode: dark (studio/indoor, default),
street (busy outdoor scene: one global grade, no cut-out halo), light (bright photo,
near-black ink). --placement: top (big word tucked behind the top of his hair) or
bottom (low over a dark fade, for when his head is near the top of the frame).
"""
import argparse, os, subprocess, sys, tempfile
from pathlib import Path
import numpy as np, cv2
from PIL import Image, ImageOps, ImageDraw, ImageFont

W, H = 1080, 1920
GRID_SAFE = (240, 1680)          # Instagram's profile grid shows the centre 3:4 of a 9:16 cover
CREAM, INK = (242, 236, 226), (24, 24, 26)
FONT_CANDIDATES = [
    os.environ.get("COVER_FONT", ""),
    os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Windows\Fonts\HelveticaNowText-Medium.ttf"),
    r"C:\Windows\Fonts\HelveticaNowText-Medium.ttf",
    str(Path.home() / "Library/Fonts/HelveticaNowText-Medium.ttf"),
    str(Path(__file__).resolve().parents[1] / "fonts" / "HelveticaNowText-Medium.ttf"),
]


def font_path():
    for p in FONT_CANDIDATES:
        if p and Path(p).exists():
            return p
    sys.exit("Helvetica Now Text Medium not found. Install HelveticaNowText-Medium.ttf or set COVER_FONT.")


def load_source(src, t):
    """Photo (jpg/png/heic) or a video frame at t seconds, full resolution."""
    if src.lower().endswith((".mp4", ".mov", ".mkv", ".m4v")):
        if t is None:
            sys.exit("--t is required for a video source")
        tmp = Path(tempfile.gettempdir()) / f"cover_frame_{os.getpid()}.png"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", str(tmp)],
                       check=True)
        im = Image.open(tmp).convert("RGB")
        return im
    try:
        import pillow_heif
        pillow_heif.register_heif_opener()
    except ImportError:
        pass
    return ImageOps.exif_transpose(Image.open(src)).convert("RGB")


def biggest_face(rgb):
    fc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    s = 900 / max(g.shape)
    small = cv2.resize(g, None, fx=s, fy=s) if s < 1 else g
    fs = fc.detectMultiScale(small, 1.1, 5, minSize=(40, 40))
    if not len(fs):
        return None
    x, y, w, h = max(fs, key=lambda r: r[2] * r[3])
    k = 1 / s if s < 1 else 1
    return int(x * k), int(y * k), int(w * k), int(h * k)


def crop_916(im, cx_frac, head_box):
    """Crop to 9:16 around Thomas and scale to 1080x1920. Returns plate + upscale factor."""
    rgb = np.asarray(im)
    ih, iw = rgb.shape[:2]
    if head_box:
        fx = head_box[0] + head_box[2] / 2
    elif cx_frac is not None:
        fx = cx_frac * iw
    else:
        f = biggest_face(rgb)
        fx = (f[0] + f[2] / 2) if f else iw / 2
    if iw / ih > 9 / 16:                       # too wide: keep full height
        cw, ch = round(ih * 9 / 16), ih
        left, top = int(min(max(0, fx - cw / 2), iw - cw)), 0
    else:                                      # too tall: keep full width, favour the top
        cw, ch = iw, round(iw * 16 / 9)
        left, top = 0, 0
    crop = im.crop((left, top, left + cw, top + ch))
    return crop.resize((W, H), Image.LANCZOS), W / cw


def subject_mask(rgb, sigma):
    from rembg import remove, new_session
    m = np.asarray(remove(Image.fromarray(rgb).resize((540, 960)), session=new_session("u2net"), only_mask=True))
    return cv2.GaussianBlur(cv2.resize(m, (W, H)).astype(np.float32) / 255, (0, 0), sigma)


def grade(rgb, mask, mode, face, placement):
    a = rgb.astype(np.float32) / 255
    lum = (a * [0.299, 0.587, 0.114]).sum(2, keepdims=True)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    if mode == "light":                        # bright and airy: richer contrast, whisper of warmth, fine grain
        a = np.clip((a - 0.5) * 1.05 + 0.5, 0, 1) * np.array([1.01, 1.0, 0.985])
        a += np.random.default_rng(4).normal(0, 0.006, (H, W, 1))
        return np.clip(a, 0, 1)
    if mode == "street":                       # one grade everywhere, so no glow around his outline
        a = np.clip((lum + (a - lum) * 0.75 - 0.5) * 1.08 + 0.5, 0, 1) * 0.80
        a *= 1 - np.clip(1 - yy / 900, 0, 1)[..., None] ** 1.5 * 0.45      # deeper top so cream text reads
    else:                                      # dark editorial: room muted and pulled down, Thomas keeps colour
        bg = (lum + (a - lum) * 0.5) * 0.50 * np.array([0.98, 1.0, 1.03])
        subj = np.clip((lum + (a - lum) * 0.92 - 0.5) * 1.08 + 0.5, 0, 1) * 0.92
        m3 = cv2.GaussianBlur(mask, (0, 0), 28)[..., None] * 0.85            # wide falloff reads as light, not a cut-out
        a = subj * m3 + bg * (1 - m3)
    a = a / (1 + 0.18 * a) * 1.18
    x, y, w, h = face
    vig = np.clip(((xx - (x + w / 2)) / (W * 0.7)) ** 2 + ((yy - (y + h / 2)) / (H * 0.62)) ** 2, 0, 1)
    a *= (1 - 0.55 * vig ** 1.4)[..., None]
    low = placement == "bottom"
    fade = np.clip((yy - (1020 if low else 1500)) / (520 if low else 380), 0, 1)
    a *= (1 - (0.86 if low else 0.7) * fade * fade * (3 - 2 * fade))[..., None]
    a += np.random.default_rng(5).normal(0, 0.012, (H, W, 1))
    return np.clip(a, 0, 1)


def _width(d, text, font, track):
    return sum(d.textlength(c, font=font) + track for c in text) - track


def _tracked(d, xy, text, font, track, stroke=0):
    x, y = xy
    for c in text:
        d.text((x, y), c, font=font, fill=255, stroke_width=stroke, stroke_fill=255)
        x += d.textlength(c, font=font) + track


def layout_text(kicker, lines, head_top, placement, kicker_size=50, font=None):
    """Masks for the kicker and the big lines. Shared with mock_options.py so mocks match."""
    font = font or font_path()
    mt = Image.new("L", (W, H), 0); dm = ImageDraw.Draw(mt)
    kl = Image.new("L", (W, H), 0); dk = ImageDraw.Draw(kl)
    size = 320
    while True:
        fm = ImageFont.truetype(font, size); tr = -size * 0.02
        if max(_width(dm, t, fm, tr) for t in lines) <= W - 80 or size <= 60:
            break
        size -= 4
    cap = dm.textbbox((0, 0), "H", font=fm); ch = cap[3] - cap[1]
    gap = round(ch * 1.22)
    last = (1640 - ch) if placement == "bottom" else (head_top + 45 - ch)    # bottom line tucks into his hair
    ys = [last - gap * (len(lines) - 1 - i) for i in range(len(lines))]
    for t, yt in zip(lines, ys):
        _tracked(dm, ((W - _width(dm, t, fm, tr)) / 2, yt - cap[1]), t, fm, tr, stroke=round(size * 0.008))
    if kicker:
        fk = ImageFont.truetype(font, kicker_size)
        _tracked(dk, ((W - _width(dk, kicker, fk, 7)) / 2, ys[0] - round(kicker_size * 1.7)), kicker, fk, 7, stroke=1)
    both = Image.fromarray(np.maximum(np.asarray(mt), np.asarray(kl)))
    return both, mt, kl, size


PROMPT = """Image 1 is a real photo (a 9:16 editorial magazine-cover portrait). Image 2 is the exact text layout for this cover, {ink_name} text on a plain {bg_name} background, at exactly the same size as Image 1.

Put the text from Image 2 onto Image 1:
- EXACTLY the same words, spelling, punctuation, capitalisation and line breaks as Image 2. Copy every character; do not add or drop anything.
- EXACTLY the same position, size, alignment, letter spacing and line spacing as Image 2 (Image 2 is a 1:1 overlay map).
- EXACTLY the same typeface as Image 2: Helvetica Now Text Medium, a clean neutral sans in a single medium weight, all capitals. No other fonts.
- Colour: solid {ink_desc}, flat printed ink like a premium print magazine cover. No gradients, no glow, no outline, no drop shadow, no other colours.
- CRITICAL: {critical}
- Do not change anything else in the photo: not the man, not the room, not the colours or lighting.
"""


def write_prompt(path, kicker, lines, mode, placement):
    big = " / ".join(lines)
    where = ("with the bottom of the big text just touching the top of the man's hair"
             if placement == "top" else "in the lower part of the image over the dark area")
    if kicker:
        critical = (f"there are {1 + len(lines)} text lines and all must appear: the small tracked line "
                    f"'{kicker}' directly ABOVE the big text '{big}'. Do not move any line up or down; their "
                    f"vertical position must match Image 2 exactly, {where}.")
    else:
        critical = f"the big text '{big}' must sit exactly where Image 2 puts it, {where}."
    light = mode == "light"
    Path(path).write_text(PROMPT.format(
        ink_name="near-black" if light else "warm cream",
        bg_name="light" if light else "grey",
        ink_desc="near-black #18181A" if light else "warm cream #F2ECE2",
        critical=critical), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True); ap.add_argument("--t", type=float)
    ap.add_argument("--name", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--kicker", default=""); ap.add_argument("--big", required=True)
    ap.add_argument("--mode", choices=["dark", "street", "light"], default="dark")
    ap.add_argument("--placement", choices=["top", "bottom"], default="top")
    ap.add_argument("--cx", type=float, help="horizontal centre of the crop, 0-1 (default: his face)")
    ap.add_argument("--head-box", help="x,y,w,h of his head in the SOURCE image, when the face is in profile")
    ap.add_argument("--kicker-size", type=int, default=50)
    a = ap.parse_args()

    kicker = a.kicker.upper().strip()
    lines = [l.strip().upper() for l in a.big.split("/") if l.strip()]
    for t in [kicker] + lines:
        if any(ch in t for ch in "\u2014\u2013"):
            sys.exit("No em or en dashes on covers.")
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)

    im = load_source(a.src, a.t)
    hb = tuple(map(int, a.head_box.split(","))) if a.head_box else None
    plate, up = crop_916(im, a.cx, hb)
    rgb = np.asarray(plate)
    if up > 1.25:
        print(f"WARNING: source is upscaled {up:.2f}x to fill the cover. It will look soft, not Forbes quality. "
              f"Use a higher-resolution photo or the 4K raw instead.")

    mask = subject_mask(rgb, 1.5 if a.mode == "light" else 3)
    Image.fromarray((mask * 255).astype(np.uint8)).save(out / f"{a.name}-subject.png")
    f = biggest_face(rgb) or (W // 3, H // 5, W // 3, W // 3)
    base = Image.fromarray((grade(rgb, mask, a.mode, f, a.placement) * 255).astype(np.uint8))
    base.save(out / f"{a.name}-base.png")

    band = mask[:, int(f[0] + f[2] * 0.1): int(f[0] + f[2] * 0.9)].max(1)
    head_top = int(np.argmax(band > 0.5))
    both, mt, kl, size = layout_text(kicker, lines, head_top, a.placement, a.kicker_size)
    both.save(out / f"{a.name}-textmask.png")
    (Image.new("L", (W, H), 0) if a.placement == "bottom" else mt).save(out / f"{a.name}-masthead.png")

    light = a.mode == "light"
    ink = INK if light else CREAM
    guide = Image.new("RGB", (W, H), (236, 234, 230) if light else (60, 60, 64))
    guide.paste(ink, (0, 0), both); guide.save(out / f"{a.name}-guide.png")
    occl = mask if a.placement == "top" else mask * 0
    pv = base.copy()
    pv.paste(ink, (0, 0), Image.fromarray((np.asarray(mt).astype(np.float32) * (1 - occl)).astype(np.uint8)))
    pv.paste(ink, (0, 0), kl); pv.save(out / f"{a.name}-preview.png")
    write_prompt(out / f"{a.name}-prompt.txt", kicker, lines, a.mode, a.placement)
    import json
    json.dump({"src": a.src, "t": a.t, "mode": a.mode, "placement": a.placement, "head_top": head_top,
               "kicker": kicker, "big": lines, "kicker_size": a.kicker_size, "upscale": round(up, 2)},
              open(out / f"{a.name}-layout.json", "w"), indent=1)

    rows = np.where(np.asarray(both).any(1))[0]
    top, bot = int(rows.min()), int(rows.max())
    print(f"{a.name}: upscale {up:.2f}x | head top {head_top} | big text {size}px | text y {top}-{bot}")
    if top < GRID_SAFE[0] or bot > GRID_SAFE[1]:
        print(f"WARNING: text runs outside the profile-grid area (y {GRID_SAFE[0]}-{GRID_SAFE[1]}); "
              f"try --placement bottom or a photo with more headroom.")
    if a.placement == "top" and head_top < 380:
        print("WARNING: his head is near the top of the frame; the headline will be cramped. Try --placement bottom.")


if __name__ == "__main__":
    main()
