#!/usr/bin/env python3
"""Mockup board for approval (the animation brain's step 4): one tile per beat, labelled with time, beat and type.
   board.py <out.jpg> "<title>" <frame.png>="<label>" ...   (frames are snapshot PNGs at each card's fullest moment)"""
import sys
from PIL import Image, ImageDraw, ImageFont

out, title, items = sys.argv[1], sys.argv[2], [a.split("=", 1) for a in sys.argv[3:]]
TW, TH, PAD, COLS = 360, 640, 18, 5
rows = (len(items) + COLS - 1) // COLS
W, H = COLS * (TW + PAD) + PAD, 90 + rows * (TH + 70 + PAD)
board = Image.new("RGB", (W, H), (14, 16, 22)); d = ImageDraw.Draw(board)
try:
    f1 = ImageFont.truetype(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "fonts", "Poppins-Bold.ttf"), 34); f2 = ImageFont.truetype(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "fonts", "Poppins-Medium.ttf"), 21)
except OSError:
    f1 = f2 = ImageFont.load_default()
d.text((PAD, 24), title, font=f1, fill=(255, 255, 255))
for k, (src, lab) in enumerate(items):
    x, y = PAD + (k % COLS) * (TW + PAD), 90 + (k // COLS) * (TH + 70 + PAD)
    board.paste(Image.open(src).convert("RGB").resize((TW, TH)), (x, y))
    for j, line in enumerate(lab.split("|")[:2]): d.text((x, y + TH + 8 + j * 28), line, font=f2, fill=(255, 255, 255) if j == 0 else (160, 170, 190))
board.save(out, quality=88); print(out, board.size)
