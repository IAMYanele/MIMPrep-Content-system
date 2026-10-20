"""Side-by-side options sheet. usage: python sheet.py <out.jpg> <cover1> <cover2> ..."""
import sys

from PIL import Image

ims = [Image.open(p).convert("RGB").resize((540, 960)) for p in sys.argv[2:]]
s = Image.new("RGB", (550 * len(ims) - 10, 960), "white")
for i, im in enumerate(ims):
    s.paste(im, (i * 550, 0))
s.save(sys.argv[1], quality=90)
print(sys.argv[1])
