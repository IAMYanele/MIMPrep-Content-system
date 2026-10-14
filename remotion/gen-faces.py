"""Generate 5 body-fat-% faces (same woman, progressively leaner) via Gemini Nano Banana Pro.
40% anchor first; 35/30/25/20 reference the 40% image for identity consistency."""
import os, sys
from pathlib import Path
from google import genai
from google.genai import types
from PIL import Image

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = Path("out/faces"); OUT.mkdir(parents=True, exist_ok=True)

BASE = (
    "Photorealistic vertical portrait photo of a young woman, head and shoulders centered and facing "
    "straight into the camera. Dark brown hair pulled back tightly and flat against the head. Wearing a "
    "plain black crew-neck t-shirt. Plain smooth light grey studio background. Neutral relaxed expression, "
    "mouth closed, looking directly at the camera. Soft even frontal studio lighting. Natural bare skin, "
    "no heavy makeup. Clean, clinical, symmetrical framing. Educational fitness reference photo."
)
LEVELS = {
    "40": "Her face is at about 40% body fat: clearly rounded and full, soft puffy cheeks, a soft rounded jawline with almost no definition, and fullness under the chin.",
    "35": "at about 35% body fat: still soft and fairly full, cheeks slightly less puffy than before, jawline still soft with only faint definition.",
    "30": "at about 30% body fat: some facial shape starting to appear, cheeks a bit flatter, jawline slightly more visible but still soft.",
    "25": "at about 25% body fat: cheekbones starting to emerge, a more defined jawline, a noticeably leaner face.",
    "20": "at about 20% body fat: sharp well-defined cheekbones, a chiseled defined jawline, a lean and sculpted face.",
}

def gen(prompt, out, ref=None):
    contents = [prompt]
    if ref is not None:
        contents.append(Image.open(ref))
    resp = client.models.generate_content(
        model=MODEL, contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
            image_config=types.ImageConfig(aspect_ratio="3:4"),
        ),
    )
    for part in resp.candidates[0].content.parts:
        if getattr(part, "inline_data", None) is not None:
            part.as_image().save(str(out)); print("  saved", out); return True
    txt = " ".join(getattr(p, "text", "") or "" for p in resp.candidates[0].content.parts)
    print("  NO IMAGE for", out, "| text:", txt[:160]); return False

# 40% anchor
print("40 (anchor)")
gen(BASE + " " + LEVELS["40"], OUT / "face-40.png")
anchor = OUT / "face-40.png"
# leaner variants referencing the anchor for identity
for pct in ["35", "30", "25", "20"]:
    print(pct)
    p = ("Using the attached reference photo, generate the exact same woman with the identical face, "
         "hairstyle, black t-shirt, framing, lighting and plain light grey background, but " + LEVELS[pct] +
         " Keep her identity clearly the same person; only change the facial fat level. " + BASE)
    gen(p, OUT / f"face-{pct}.png", ref=anchor)
print("DONE")
