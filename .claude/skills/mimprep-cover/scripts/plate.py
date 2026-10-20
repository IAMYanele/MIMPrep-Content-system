"""Generate an EMPTY high-end background plate with Nano Banana (no people). The girl is composited on it later.
usage: python plate.py <library|campus|office|"custom description"> <out.png>"""
import sys
from google import genai
from google.genai import types
sys.path.insert(0, __import__("os").path.dirname(__file__)); from common import gemini_key
SCENES = {
 "library": "the interior of an elegant historic university library in London: tall dark-wood bookshelves full of old leather-bound books, a couple of warm brass reading lamps, tall arched windows with soft daylight, polished floor",
 "campus": "a prestigious London university courtyard: cream Georgian stone building with columns and tall sash windows, neat clipped green hedges, a paved path, soft natural daylight on an overcast-bright day",
 "office": "a premium modern London office lounge on a high floor: floor-to-ceiling windows onto the City skyline, warm oak and cream interiors, a few designer plants, bright natural daylight",
}
scene = SCENES.get(sys.argv[1], sys.argv[1]); out = sys.argv[2]
P = f"""A real photograph of {scene}. Completely EMPTY: no people, no person, no figures anywhere.
Shot handheld on an iPhone in portrait mode at eye level (about 1.5 m high), as the background behind someone standing 1 m from the camera: softly out of focus with natural smartphone portrait-mode bokeh, soft even daylight, realistic colours, slight natural phone-camera noise. Not CGI, not a render, no HDR look, no text or logos. Square framing."""
r = genai.Client(api_key=gemini_key()).models.generate_content(model="gemini-3-pro-image-preview", contents=[P],
    config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"], image_config=types.ImageConfig(aspect_ratio="1:1", image_size="2K")))
next(p.as_image() for p in r.candidates[0].content.parts if p.inline_data is not None).save(out); print(out)
