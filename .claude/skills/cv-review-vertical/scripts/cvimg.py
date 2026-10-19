# Render a CV PDF to a tall image with all personal data blurred out.
import sys, re, json, unicodedata
import pypdfium2 as pdfium
from PIL import Image, ImageFilter

import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
from cvpaths import WORK as W
TARGET_W = 1080

NO_BAND = set()   # clips to blur only the named personal fields, not the whole header band

# Extra strings to blur per clip, for details the search misses (a street name, a postcode).
# Per batch only: fill this in your job copy, never in the shared skill.
EXTRA = {
    # 7: ["<street and number>", "<town>", "<postcode>", "<phone>"],
}

EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
URLISH = re.compile(r"(linkedin\.com/[^\s|]+|github\.com/[^\s|]+|www\.[^\s|]+|https?://[^\s|]+)", re.I)
PHONE = re.compile(r"(\+\s?\d[\d\s().\-]{7,}\d)|(\b\d{2}[\s.\-]\d{2}[\s.\-]\d{2}[\s.\-]\d{2}[\s.\-]\d{2}\b)")

def norm(s):
    s = unicodedata.normalize("NFKD", s or "")
    return "".join(c for c in s if not unicodedata.combining(c)).lower().strip()

def rects_for(tp, needle, whole_word=False):
    out = []
    if not needle or len(needle.strip()) < 3: return out
    try:
        s = tp.search(needle, match_case=False, match_whole_word=whole_word)
    except Exception:
        return out
    while True:
        r = s.get_next()
        if not r: break
        idx, cnt = r
        try:
            n = tp.count_rects(idx, cnt)
        except Exception:
            n = 0
        for i in range(n):
            out.append(tp.get_rect(i))
    return out

def build(clip, meta, dbg=False):
    doc = pdfium.PdfDocument(f"{W}/cvs/clip{clip}.pdf")
    pages, boxes, yoff = [], [], 0
    for pi in range(len(doc)):
        pg = doc[pi]
        pw, ph = pg.get_size()
        sc = TARGET_W / pw
        img = pg.render(scale=sc).to_pil().convert("RGB")
        tp = pg.get_textpage()
        text = tp.get_text_range()

        targets = []
        # known values from the spreadsheet
        for k in ("mail_cv", "mail_form", "linkedin", "name_full"):
            v = (meta.get(k) or "").strip()
            if v: targets.append(v)
        # anything that looks like contact data anywhere on the page
        targets += EMAIL.findall(text)
        targets += [m.group(0) for m in URLISH.finditer(text)]
        targets += [m.group(0).strip() for m in PHONE.finditer(text)]
        # name split into parts (CVs often style first/last separately)
        nf = (meta.get("name_full") or "").split()
        if len(nf) >= 2:
            targets.append(" ".join(nf))
        # --- header band: everything above the first section heading ---
        HEAD = ("EDUCATION","EDUCATIONS","FORMATION","WORK EXPERIENCE","EXPERIENCE",
                "PROFESSIONAL EXPERIENCE","PROFILE","SUMMARY","OBJECTIVE","SKILLS",
                "EMPLOYMENT","ACADEMIC","EXPERIENCES","PARCOURS","COMPETENCES")
        first_y = None
        for kw in HEAD:
            for (l, b, r, t) in rects_for(tp, kw):
                yy = (ph - t) * sc
                if yy > 20 and (first_y is None or yy < first_y):
                    first_y = yy
        if pi == 0 and meta.get("clip") not in NO_BAND:
            band = (first_y - 12) if first_y else img.height * 0.17
            band = max(60, min(band, img.height * 0.42))
            boxes.append((0, 0, TARGET_W, band + yoff))

        # references block
        # references block -> blur the heading and everything under it on that page
        for kw in ("References", "Reference", "Référence", "Referees", "Referencias",
                   "Referencia", "Referenze", "Referenzen", "Referências", "Referenties"):
            for (l, b, r, t) in rects_for(tp, kw, whole_word=True):
                top = (ph - t) * sc + yoff
                # A real references section lives low on the page. A match in the top
                # half is almost always a word that merely contains the keyword, and
                # blurring from there to the bottom destroys the CV.
                if (top - yoff) < img.height * 0.55:
                    print(f"    skipped {kw!r} at y={top - yoff:.0f} "
                          f"({(top - yoff) / img.height:.0%} down) - too high to be a references heading")
                    continue
                if meta.get("clip") in NO_BAND:
                    # references sit in one column: blur that column from the heading down,
                    # leaving the facing column readable
                    if l * sc < TARGET_W / 2:
                        x0, x1 = 0.0, 600.0
                    else:
                        x0, x1 = max(0.0, l * sc - 90), TARGET_W
                    boxes.append((x0, top - 10, x1, yoff + img.height))
                else:
                    boxes.append((0, top - 6, TARGET_W, yoff + img.height))

        targets += EXTRA.get(meta.get("clip"), [])
        for tgt in targets:
            for (l, b, r, t) in rects_for(tp, tgt):
                boxes.append((l * sc, (ph - t) * sc + yoff, r * sc, (ph - b) * sc + yoff))

        # photos / images on the page -> blur (face protection)
        try:
            for obj in pg.get_objects():
                if obj.type == 3:  # image
                    l, b, r, t = obj.get_bounds()
                    if (r - l) * sc > 60 and (t - b) * sc > 60:
                        boxes.append((l * sc, (ph - t) * sc + yoff, r * sc, (ph - b) * sc + yoff))
        except Exception as e:
            if dbg: print("  obj scan skipped:", e)

        pages.append(img); yoff += img.height

    full = Image.new("RGB", (TARGET_W, sum(p.height for p in pages)), "white")
    y = 0
    for p in pages: full.paste(p, (0, y)); y += p.height

    # merge overlapping boxes on the same line, pad, then pixelate
    merged = []
    for (x0, y0, x1, y1) in boxes:
        h = max(1.0, y1 - y0)
        py = min(max(12.0, h * 0.85), 26.0)   # cap: tall blocks must not balloon
        px = min(max(8.0, (x1 - x0) * 0.04), 24.0)
        x0, y0, x1, y1 = x0 - px, y0 - py, x1 + px, y1 + py
        hit = False
        for m in merged:
            if not (x1 < m[0] - 12 or x0 > m[2] + 12 or y1 < m[1] - 4 or y0 > m[3] + 4):
                m[0], m[1] = min(m[0], x0), min(m[1], y0)
                m[2], m[3] = max(m[2], x1), max(m[3], y1)
                hit = True; break
        if not hit: merged.append([x0, y0, x1, y1])

    for (x0, y0, x1, y1) in merged:
        x0 = max(0, int(x0)); y0 = max(0, int(y0))
        x1 = min(full.width, int(x1)); y1 = min(full.height, int(y1))
        if x1 - x0 < 4 or y1 - y0 < 4: continue
        reg = full.crop((x0, y0, x1, y1))
        small = reg.resize((max(1, (x1 - x0) // 45), max(1, (y1 - y0) // 20)), Image.BILINEAR)
        full.paste(small.resize(reg.size, Image.NEAREST).filter(ImageFilter.GaussianBlur(11)), (x0, y0))
    return full, merged

if __name__ == "__main__":
    clip = int(sys.argv[1])
    cm = json.load(open(f"{W}/sheet/clipmap.json", encoding="utf-8"))[str(clip)]
    meta = {"clip": clip, "name_full": f"{cm['name']} {cm['last']}", "mail_cv": cm["mail_cv"],
            "mail_form": cm["mail_form"], "phone": cm["phone"],
            "address": cm["address"], "linkedin": cm["linkedin"]}
    img, m = build(clip, meta, dbg=True)
    img.save(f"{W}/render/clip{clip}_cv_blur.png")
    print(f"clip{clip}: {img.size}, {len(m)} blurred regions")
    for b in m[:12]:
        print("   box", [int(v) for v in b])
