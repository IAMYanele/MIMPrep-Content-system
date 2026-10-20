"""Shared setup for the MiM Prep cover scripts: brand colours, fonts, logo, Gemini key."""
import os
from pathlib import Path
from PIL import Image, ImageFont

SKILL = Path(__file__).resolve().parents[1]
W, H = 1080, 1920
BLUE, BLUE_L = (0, 74, 173), (68, 144, 246)          # MiM primary #004AAD, secondary #4490F6
PAPER, DOT, INK = (241, 241, 241), (197, 202, 214), (32, 37, 40)
GRID_SAFE = (240, 1680)                              # the profile grid shows the centre 3:4 of a 9:16 cover

_UF = Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft/Windows/Fonts"
def _font(env, *cands):
    for c in [os.environ.get(env)] + [str(p) for p in cands]:
        if c and Path(c).exists(): return c
    raise SystemExit(f"Font missing: set {env} (tried {cands})")
POPPINS_SB = _font("MIM_FONT_BOLD", _UF / "Poppins-SemiBold.ttf", "C:/Windows/Fonts/Poppins-SemiBold.ttf")
POPPINS_MD = _font("MIM_FONT_MEDIUM", _UF / "Poppins-Medium.ttf", "C:/Windows/Fonts/Poppins-Medium.ttf")
SERIF_IT = _font("MIM_FONT_SERIF", "C:/Windows/Fonts/GeorgiaPro-CondItalic.ttf", _UF / "GeorgiaPro-CondItalic.ttf")
def bold(sz): return ImageFont.truetype(POPPINS_SB, sz)
def medium(sz): return ImageFont.truetype(POPPINS_MD, sz)
def serif(sz): return ImageFont.truetype(SERIF_IT, sz)
def logo(): return Image.open(SKILL / "assets/mimprep-logo.png").convert("RGBA")

def gemini_key():
    if os.environ.get("GEMINI_API_KEY"): return os.environ["GEMINI_API_KEY"]
    for p in [Path.cwd() / ".env", Path.home() / "plug kit/.env", Path.home() / "plugkit/.env"]:
        if p.exists():
            for line in p.read_text(encoding="utf-8").splitlines():
                if line.strip().startswith("GEMINI_API_KEY="): return line.split("=", 1)[1].strip()
    raise SystemExit("GEMINI_API_KEY not found (env or a .env file)")
