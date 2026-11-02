#!/usr/bin/env python3
"""Photoreal cut-out object assets for solid-card reels, made with GPT Image 2 and ALWAYS with reference images attached
(the Ultimate Editors reference rule: never prompt-only).
   gen_asset.py <out_dir> <refs_dir> <name>="<object description>" [<name>="..."] ... [--model gpt-image-2] [--jobs 3] [--gemini]
--gemini uses Nano Banana Pro (gemini-3-pro-image-preview) with the same contract and refs, e.g. when OpenAI credits run out.
Writes <out_dir>/<name>.png (transparent, trimmed). Skips names that already exist (delete to regenerate).
The key is read from OPENAI_API_KEY and never printed."""
import base64, concurrent.futures as cf, glob, io, os, sys, time
import requests
from PIL import Image

STYLE = ("Isolated product-photography cut-out of {obj}, in the exact visual style of the objects in the reference frames "
         "(the Coca-Cola can, the $100 bill, the man at the laptop): a REAL photograph, not an illustration, not 3D cartoon, not an icon, not an emoji. "
         "Crisp studio product shot, soft even key light from the top left, true-to-life materials and colours, sharp focus, "
         "a soft natural contact shadow directly under the object. ONE single object only, centred, filling about 80% of the canvas, "
         "seen at a slight three-quarter angle. The background is a perfectly flat, plain, solid royal blue (#004AAD) with no gradient, "
         "no texture and no shadow on it - nothing else in the frame: no backdrop, no text, no logos, "
         "no brand names, no watermark, no border, no extra props. Premium, clean, high detail.")

# Yanele, 2026-10-29: the product-shot cut-outs read as "3D images". Two 2D-realistic alternatives:
STYLES = {
    "product": STYLE,
    # flat: an everyday object photographed dead-on, like a photo cut out of a magazine (Hormozi's Coke can / $100 bill)
    "flat": ("A real, ordinary photograph of {obj}, shot straight-on from the front like a flat photo cut out of a magazine or a "
             "catalogue - exactly like the flat front-on Coca-Cola can and the flat $100 bill in the reference frames. Plain, natural, "
             "slightly soft daylight, true everyday colours, the normal wear and texture of a real used object. NOT a 3D render, NOT a "
             "glossy studio product shot, NOT CGI, no dramatic lighting, no reflections, no depth-of-field effect, no three-quarter angle, "
             "no perspective. ONE object only, centred, filling about 80% of the canvas. The background is a perfectly flat, plain, solid "
             "royal blue (#004AAD) with no gradient, no texture and no shadow - nothing else: no text, no logos, no brand names, no watermark, "
             "no border, no extra props."),
    # photo: a candid real-life photograph of the moment, shown whole in a rounded card (not cut out)
    "photo": ("A candid, natural, real-life photograph of {obj}. It looks like an ordinary photo someone took on a good phone or a DSLR "
              "in a real place: real people and real settings, natural available light, documentary / editorial feel, slight natural "
              "imperfection. NOT staged studio, NOT CGI, NOT 3D, NOT an illustration. Nobody looks at the camera. No text, no logos, no "
              "brand names, no watermark. Landscape 4:3 framing."),
}


_SESS = []
import threading; _LOCK = threading.Lock()
def key(im):
    """isnet-general-use matte (cached in ~/.u2net). Keeps every component at least 12% the size of the largest - "largest only"
    threw away the second of two cups and a medal's ribbon - and drops specks. The contact shadow goes with the blue plate;
    the card CSS gives every object a soft drop shadow instead."""
    import numpy as np, cv2
    from rembg import remove, new_session
    with _LOCK:                                                     # one shared session: one model load, not one per thread
        if not _SESS: _SESS.append(new_session("isnet-general-use"))
    rgb = im.convert("RGB"); a = np.asarray(remove(rgb, session=_SESS[0], only_mask=True)).astype(np.float32) / 255
    n, lab, st, _ = cv2.connectedComponentsWithStats((a > .5).astype(np.uint8))
    if n > 1:
        areas = st[1:, cv2.CC_STAT_AREA]; keep = 1 + np.where(areas >= 0.12 * areas.max())[0]
        a *= cv2.dilate(np.isin(lab, keep).astype(np.uint8), np.ones((9, 9), np.uint8))
    out = rgb.convert("RGBA"); out.putalpha(Image.fromarray((a * 255).astype(np.uint8))); return out


def gen(name, obj, out, refs, model):
    dst = os.path.join(out, name + ".png")
    if os.path.exists(dst): return name, "exists"
    files = [("image[]", (os.path.basename(r), open(r, "rb"), "image/png")) for r in refs]
    data = {"model": model, "prompt": STYLE.format(obj=obj), "size": "1024x1024", "quality": "high",
            "output_format": "png", "n": "1"}
    for attempt in range(3):
        r = requests.post("https://api.openai.com/v1/images/edits", headers={"Authorization": "Bearer " + os.environ["OPENAI_API_KEY"]},
                          data=data, files=files, timeout=600)
        if r.ok: break
        time.sleep(5)
        files = [("image[]", (os.path.basename(f), open(f, "rb"), "image/png")) for f in refs]
    if not r.ok: return name, "FAILED %s %s" % (r.status_code, r.text[:300])
    return finish(Image.open(io.BytesIO(base64.b64decode(r.json()["data"][0]["b64_json"]))), dst, name)


def gen_gemini(name, obj, out, refs, model, style="product"):
    """Same contract on Gemini (Nano Banana Pro) - the fallback when the OpenAI account has no credits."""
    dst = os.path.join(out, name + ".png")
    if os.path.exists(dst): return name, "exists"
    from google import genai
    from google.genai import types
    sys.path.insert(0, os.path.expanduser("~/.claude/skills/mimprep-cover/scripts")); from common import gemini_key
    photo = style == "photo"
    parts = [STYLES[style].format(obj=obj) + ("" if photo else " Square image.")] + ([] if photo else [Image.open(r).convert("RGB") for r in refs])
    for attempt in range(3):
        try:
            client = genai.Client(api_key=gemini_key())              # keep a reference: an inline client is closed before the call returns
            r = client.models.generate_content(model=model, contents=parts,
                config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"], image_config=types.ImageConfig(aspect_ratio="4:3" if photo else "1:1", image_size="1K")))
            im = next(p.as_image() for p in r.candidates[0].content.parts if p.inline_data is not None); break
        except Exception as e:
            err = str(e)[:300]; time.sleep(5)
    else:
        return name, "FAILED " + err
    im = Image.open(io.BytesIO(im.image_bytes)) if hasattr(im, "image_bytes") else im
    if photo:                       # a real-life photo is shown whole in a rounded card: no matte
        im.convert("RGB").save(dst); return name, "ok %dx%d (photo)" % im.size
    return finish(im, dst, name)


def finish(im, dst, name):
    im = key(im.convert("RGBA"))    # neither model gives a usable transparent output: they render on flat card blue and are matted
    bb = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    if bb: im = im.crop(bb)
    im.save(dst); return name, "ok %dx%d" % im.size


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    opt = lambda k, d: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
    out, refs_dir = args[0], args[1]; os.makedirs(out, exist_ok=True)
    jobs = [a.split("=", 1) for a in args[2:] if "=" in a]
    refs = sorted(glob.glob(os.path.join(refs_dir, "card_*.png")))[:3]
    gemini = "--gemini" in sys.argv
    def run(j):
        try:
            if gemini: return gen_gemini(j[0], j[1], out, refs, opt("--model", "gemini-3-pro-image-preview"), opt("--style", "product"))
            return gen(j[0], j[1], out, refs, opt("--model", "gpt-image-2"))
        except Exception as e:                                       # one bad object must not stop the batch
            return j[0], "FAILED %s" % str(e)[:300]
    with cf.ThreadPoolExecutor(int(opt("--jobs", 3))) as ex:
        for name, res in ex.map(run, jobs): print(name, res, flush=True)
