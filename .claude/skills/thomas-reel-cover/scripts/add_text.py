"""Add a headline to a real photo/video frame with Nano Banana, WITHOUT changing the photo.

Nano Banana re-renders the whole image, so its output is only used as a source for the
text: we diff it against the original and composite back just the text (and its shadow).
Every other pixel in the result is the untouched original.

Usage:
  python scripts/add_text.py --base frames/x.png --prompt-file prompts/x.txt --out out/x.jpg \
      --ref refs/font-specimen.png --ref refs/style-reference-covers.webp
"""
import argparse, os, sys
from pathlib import Path
import numpy as np, cv2
from PIL import Image
from google import genai
from google.genai import types

ROOT = Path(__file__).resolve().parents[1]
# GEMINI_API_KEY: the environment wins; otherwise the first .env that has it.
ENV_FILES = [Path.cwd() / ".env", ROOT / ".env", ROOT.parents[2] / "plugkit" / ".env",
             Path.home() / "plug kit" / ".env"]

def load_env():
    if os.environ.get("GEMINI_API_KEY"):
        return
    for f in ENV_FILES:
        if not f.exists():
            continue
        for line in f.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                if k.strip() == "GEMINI_API_KEY" and v.strip():
                    os.environ["GEMINI_API_KEY"] = v.strip().strip('"')
                    return
    sys.exit("GEMINI_API_KEY not found: set it, or put it in a .env (see the skill's setup section).")

RULES = """
STRICT RULES — this is a text-only edit:
- Image 1 is the real photo. Return Image 1 EXACTLY as it is, pixel for pixel, with the headline added on top.
- Do NOT change, retouch, relight, recolour, sharpen, crop, zoom, reframe, extend or regenerate anything in the photo. Same person, same face, same pose, same background, same colours, same framing.
- The ONLY new thing in the image is the headline text (with its drop shadow).
- Write exactly the words given, nothing else anywhere. No logos, watermarks, emojis or UI.
"""

def generate(base, prompt, refs, out_raw):
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    contents = [prompt + RULES, base]
    for r in refs:
        s = Image.open(r).convert("RGB"); s.thumbnail((1600, 1600)); contents.append(s)
    w, h = base.size
    ratios = {"9:16": 9 / 16, "3:4": 3 / 4, "4:5": 4 / 5, "2:3": 2 / 3, "1:1": 1.0, "16:9": 16 / 9}
    aspect = min(ratios, key=lambda k: abs(ratios[k] - w / h))
    r = client.models.generate_content(
        model="gemini-3-pro-image-preview", contents=contents,
        config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"],
                                           image_config=types.ImageConfig(aspect_ratio=aspect, image_size="2K")))
    for part in r.candidates[0].content.parts:
        if part.inline_data is not None:
            im = part.as_image(); im.save(out_raw)
            return Image.open(out_raw).convert("RGB")
    sys.exit("Nano Banana returned no image")

def align(gen, base, exclude=None):
    """Warp Nano Banana's output onto the original in case it shifted/zoomed slightly."""
    g = cv2.cvtColor(gen, cv2.COLOR_RGB2GRAY).astype(np.float32)
    b = cv2.cvtColor(base, cv2.COLOR_RGB2GRAY).astype(np.float32)
    warp = np.eye(2, 3, dtype=np.float32)
    try:
        sm = 0.25
        gs, bs = cv2.resize(g, None, fx=sm, fy=sm), cv2.resize(b, None, fx=sm, fy=sm)
        msk = None
        if exclude is not None:   # line up on the photo only, never on the new text
            ex = cv2.dilate((exclude > 127).astype(np.uint8), np.ones((41, 41), np.uint8))
            msk = cv2.resize((1 - ex) * 255, (bs.shape[1], bs.shape[0]), interpolation=cv2.INTER_NEAREST).astype(np.uint8)
        _, warp = cv2.findTransformECC(bs, gs, warp, cv2.MOTION_AFFINE,
                                       (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), msk, 5)
        warp[:, 2] /= sm
        if np.abs(warp[:, :2] - np.eye(2)).max() < 0.002 and np.abs(warp[:, 2]).max() < 1.0:
            return gen            # already aligned: don't resample
        return cv2.warpAffine(gen, warp, (base.shape[1], base.shape[0]),
                              flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT)
    except cv2.error:
        return gen

def text_mask(gen, base, expect=None):
    lab_g = cv2.cvtColor(gen, cv2.COLOR_RGB2LAB).astype(np.float32)
    lab_b = cv2.cvtColor(base, cv2.COLOR_RGB2LAB).astype(np.float32)
    d = np.linalg.norm(lab_g - lab_b, axis=2)
    d = cv2.GaussianBlur(d, (0, 0), 1.5)
    # letters = clearly new pixels that are bright and colourless (white/silver fill);
    # redrawn skin, wood, fabric etc. is coloured or dark, so it never counts as text
    L, A, B = lab_g[..., 0], lab_g[..., 1] - 128, lab_g[..., 2] - 128
    letterish = (L > 135) & (np.hypot(A, B) < 20)
    # with a known layout (expect) the region already says where letters go, so any colour of ink counts;
    # without one, only bright neutral pixels can be letters (white/silver text on photos)
    core = ((d > 38) & (letterish if expect is None else True)).astype(np.uint8)
    core = cv2.morphologyEx(core, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(core)
    keep = np.zeros_like(core)
    min_area = 250 if expect is None else 12
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] >= min_area: keep[lab == i] = 1
    if expect is not None:
        # we know exactly where the letters belong: accept Nano Banana's pixels only there
        e = (expect > 127).astype(np.uint8)
        keep = keep * cv2.dilate(e, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
        near = cv2.dilate(e, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
        soft = np.clip((d - 10) / 28, 0, 1) * near
        m = cv2.GaussianBlur(np.maximum(keep.astype(np.float32), soft), (0, 0), 0.8)
        return np.clip(m, 0, 1), keep
    # keep only the main headline block: group letters that sit close together, keep the biggest
    # group, drop stray specks elsewhere (Nano Banana's tiny re-render drift around edges)
    groups = cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (91, 91)))
    n, glab, gstats, _ = cv2.connectedComponentsWithStats(groups)
    if n > 1:
        main = 1 + int(np.argmax([(keep[glab == i]).sum() for i in range(1, n)]))
        keep = keep * (glab == main)
    near = cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (61, 61)))
    soft = np.clip((d - 10) / 28, 0, 1) * near             # shadows/glow, only right around the text
    m = np.maximum(keep.astype(np.float32), soft)
    m = cv2.GaussianBlur(m, (0, 0), 1.0)
    return np.clip(m, 0, 1), keep

def qa_lines(keep, expect):
    """Per text line: how well Nano Banana's letters match where the real letters should be."""
    e = expect > 127
    rows = e.any(1); bands, y = [], 0
    while y < len(rows):
        if rows[y]:
            y0 = y
            while y < len(rows) and rows[y]: y += 1
            bands.append((y0, y))
        y += 1
    k = cv2.dilate(keep, np.ones((5, 5), np.uint8)).astype(bool)
    ed = cv2.dilate(e.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
    out = []
    for y0, y1 in bands:
        rec = (k[y0:y1] & e[y0:y1]).sum() / max(e[y0:y1].sum(), 1)
        kk = keep[max(0, y0 - 4):y1 + 4].astype(bool)
        pre = (kk & ed[max(0, y0 - 4):y1 + 4]).sum() / max(kk.sum(), 1)
        # also look along the line in ~2-letter chunks: a word hidden behind someone must not pass
        cols = np.where(e[y0:y1].any(0))[0]
        worst = 1.0
        for c0 in range(cols.min(), cols.max() + 1, 48) if len(cols) else []:
            ec = e[y0:y1, c0:c0 + 48]
            if ec.sum() > 60:
                worst = min(worst, (k[y0:y1, c0:c0 + 48] & ec).sum() / ec.sum())
        out.append((y0, y1, min(rec, worst / 0.8 * 0.8 if worst < 0.6 else rec), pre))
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", required=True); ap.add_argument("--prompt-file", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--ref", action="append", default=[],
                    help="extra reference images, in order (Image 2, Image 3...): font specimen, style covers")
    ap.add_argument("--expect", help="mask of where the letters should be (from carousel_layout.py)")
    ap.add_argument("--reuse-raw", action="store_true", help="re-composite an existing Nano Banana output, no API call")
    a = ap.parse_args(); load_env()
    base_im = Image.open(a.base).convert("RGB")
    out = Path(a.out); out.parent.mkdir(parents=True, exist_ok=True)
    raw = out.with_name(out.stem + ".nanobanana-raw.png")
    if a.reuse_raw and raw.exists():
        gen_im = Image.open(raw).convert("RGB")
    else:
        gen_im = generate(base_im, Path(a.prompt_file).read_text(encoding="utf-8"), a.ref, raw)
    base = np.asarray(base_im)
    gen = np.asarray(gen_im.resize(base_im.size, Image.LANCZOS))
    expect = np.asarray(Image.open(a.expect).convert("L")) if a.expect else None
    gen = align(gen, base, expect)
    m, keep = text_mask(gen, base, expect)
    res = base * (1 - m[..., None]) + gen * m[..., None]
    Image.fromarray(res.round().astype(np.uint8)).save(out, quality=95)
    Image.fromarray((m * 255).astype(np.uint8)).save(out.with_name(out.stem + ".mask.png"))
    cover = (m > 0.5).mean()
    print(f"saved {out}  (text covers {cover:.1%} of the frame; everything else is the original)")
    if cover > 0.30: print("WARNING: mask is large; Nano Banana may have changed the photo. Check the mask.")
    if expect is not None:
        bad = 0
        for y0, y1, rec, pre in qa_lines(keep, expect):
            flag = "" if rec > 0.80 and pre > 0.80 else "   <-- CHECK"
            bad += bool(flag)
            print(f"  line y{y0:4d}-{y1:4d}  letters found {rec:.0%}  in place {pre:.0%}{flag}")
        print("QA:", "all lines match" if not bad else f"{bad} line(s) to check")

if __name__ == "__main__":
    main()
