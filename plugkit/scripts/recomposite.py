"""Re-run only the compositing step on an existing Nano Banana output (no new API call)."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
sys.path.insert(0, str(Path(__file__).parent))
from add_text import align, text_mask
base_p, raw_p, out_p = sys.argv[1:4]
base_im = Image.open(base_p).convert("RGB"); base = np.asarray(base_im)
gen = align(np.asarray(Image.open(raw_p).convert("RGB").resize(base_im.size, Image.LANCZOS)), base)
m, _ = text_mask(gen, base)
Image.fromarray((base * (1 - m[..., None]) + gen * m[..., None]).round().astype(np.uint8)).save(out_p, quality=95)
Image.fromarray((m * 255).astype(np.uint8)).save(Path(out_p).with_name(Path(out_p).stem + ".mask.png"))
print("saved", out_p, f"text {(m > 0.5).mean():.1%}")
