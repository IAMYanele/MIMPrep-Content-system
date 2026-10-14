"""Generate an image with Nano Banana Pro (gemini-3-pro-image-preview).

Usage:
  python scripts/nano_banana.py --prompt-file p.txt --out out/x.png \
      --ref refs/guest-face.jpg --ref refs/style.webp [--aspect 9:16] [--size 2K]
Reads GEMINI_API_KEY from the .env next to this project.
"""
import argparse, os, sys
from pathlib import Path
from PIL import Image
from google import genai
from google.genai import types

ROOT = Path(__file__).resolve().parents[1]

def load_env():
    env = ROOT / ".env"
    for line in env.read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            k, v = line.split("=", 1)
            os.environ[k.strip()] = v.strip()   # this project's key wins

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt-file", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--ref", action="append", default=[])
    ap.add_argument("--aspect", default="9:16")
    ap.add_argument("--size", default="2K")
    ap.add_argument("--model", default="gemini-3-pro-image-preview")
    a = ap.parse_args()
    load_env()
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    contents = [Path(a.prompt_file).read_text(encoding="utf-8")]
    for r in a.ref:
        im = Image.open(r).convert("RGB")
        im.thumbnail((2048, 2048))
        contents.append(im)
    resp = client.models.generate_content(
        model=a.model, contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
            image_config=types.ImageConfig(aspect_ratio=a.aspect, image_size=a.size)))
    saved = False
    for part in resp.candidates[0].content.parts:
        if part.inline_data is not None:
            Path(a.out).parent.mkdir(parents=True, exist_ok=True)
            part.as_image().save(a.out); saved = True
        elif part.text:
            print("model:", part.text.strip()[:300])
    print("saved" if saved else "NO IMAGE", a.out)
    sys.exit(0 if saved else 1)

if __name__ == "__main__":
    main()
