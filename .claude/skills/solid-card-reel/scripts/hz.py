#!/usr/bin/env python3
"""Hormozi "solid card" look, re-skinned to MiM Prep (signature blue #004AAD, Poppins), on top of the
business-short-form-reels engine.   import hz as H  (after reel_engine / kit)

Two modes only: creator full screen <-> full-screen MiM-blue card. No split, no glass, no orbs, no grain.
Cards: flat white graphics (emoji objects, ALL-CAPS Poppins labels with italic sub-labels, drawn white arrows,
outline shapes) that build one part at a time on the words. Captions: Poppins, 2-3 words, key words <b>/<i>.
Card coordinates: the 1080x1920 frame, graphic in y 330-1100 (the engine scales full scenes to 84% around 540,730)."""
import json, os, re, shutil
import reel_engine as E
import kit as K

BLUE = "#004AAD"
FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")

BRAND_CSS = """
/* ---- MiM Prep x Hormozi solid-card look (appended by hz.py) ---- */
@font-face { font-family: "Pop"; src: url("fonts/Poppins-Regular.ttf"); font-weight: 400; font-style: normal; }
@font-face { font-family: "Pop"; src: url("fonts/Poppins-Medium.ttf"); font-weight: 500; font-style: normal; }
@font-face { font-family: "Pop"; src: url("fonts/Poppins-SemiBold.ttf"); font-weight: 600; font-style: normal; }
@font-face { font-family: "Pop"; src: url("fonts/Poppins-Bold.ttf"); font-weight: 700; font-style: normal; }
@font-face { font-family: "Pop"; src: url("fonts/Poppins-ExtraBold.ttf"); font-weight: 800; font-style: normal; }
@font-face { font-family: "Pop"; src: url("fonts/Poppins-Black.ttf"); font-weight: 900; font-style: normal; }
@font-face { font-family: "Pop"; src: url("fonts/Poppins-Italic.ttf"); font-weight: 400; font-style: italic; }
@font-face { font-family: "Pop"; src: url("fonts/Poppins-MediumItalic.ttf"); font-weight: 500; font-style: italic; }
@font-face { font-family: "Pop"; src: url("fonts/Poppins-SemiBoldItalic.ttf"); font-weight: 600; font-style: italic; }
@font-face { font-family: "Pop"; src: url("fonts/Poppins-BoldItalic.ttf"); font-weight: 700; font-style: italic; }
@font-face { font-family: "Pop"; src: url("fonts/Poppins-ExtraBoldItalic.ttf"); font-weight: 800; font-style: italic; }
@font-face { font-family: "Pop"; src: url("fonts/Poppins-BlackItalic.ttf"); font-weight: 900; font-style: italic; }
@font-face { font-family: "Emo"; src: local("Segoe UI Emoji"), local("SegoeUIEmoji"); }
.de-panel, .de-full { background: #004AAD !important; font-family: "Pop", sans-serif; color: #fff; }
.de-grid { background: #004AAD !important; }
.de-grid::after, .lg-orbs, .de-seam { display: none !important; }
/* the engine draws full-screen graphics at 84%: these cards are designed at full size in frame coordinates instead */
#root .de-full [id$="-in2"] { transform: none !important; }
/* card parts */
.hz-l { position: absolute; transform: translateX(-50%); text-align: center; white-space: nowrap; z-index: 5; opacity: 0; }
.hz-l b { display: block; font-family: "Pop"; font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em; line-height: 1.02; color: #fff; }
.hz-l i { display: block; font-family: "Pop"; font-weight: 500; font-style: italic; color: #fff; line-height: 1.15; margin-top: 6px; }
.hz-e { position: absolute; transform: translate(-50%, -50%); line-height: 1; z-index: 5; opacity: 0; font-family: "Emo"; }
.hz-sv { position: absolute; left: 0; top: 0; overflow: visible; z-index: 4; }
.hz-ln { fill: none; stroke: #fff; stroke-linecap: round; stroke-linejoin: round; }
.hz-x { position: absolute; transform: translate(-50%, -50%); z-index: 6; opacity: 0; }
.hz-t { position: absolute; z-index: 5; opacity: 0; font-family: "Pop"; color: #fff; white-space: nowrap; }
.hz-bx { position: absolute; z-index: 4; opacity: 0; border: 5px solid #fff; border-radius: 6px; box-sizing: border-box; }
.hz-im { position: absolute; transform: translate(-50%, -50%); z-index: 5; opacity: 0; filter: drop-shadow(0 8px 12px rgba(0,0,0,.20)); }
.hz-im img { display: block; height: 100%; width: auto; }
"""

# captions and face overlays live in the index page: E.top css lands after the engine's own caption css, so it wins
TOP_CSS = """
.cap span { font-family: "Pop", sans-serif !important; font-weight: 500 !important; letter-spacing: -0.01em !important; font-size: 60px !important; line-height: 1.1 !important;
  text-shadow: 0 2px 14px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.4) !important; }
.cap span b { font-weight: 700; } .cap span i { font-style: italic; font-weight: 600; }
.cap-f span { top: 1150px !important; }
.cap-a span { top: 1330px !important; text-shadow: none !important; }
.hz-hk { position: absolute; left: 0; width: 1080px; text-align: center; z-index: 30; }
.hz-hk span { display: inline-block; background: #fff; color: #0A0A0A; font-family: "Pop"; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.015em;
  font-size: 54px; line-height: 1; padding: 10px 22px 12px; box-shadow: 0 10px 30px rgba(0,0,0,.35); }
.hz-pl { position: absolute; left: 0; width: 1080px; text-align: center; z-index: 30; opacity: 0; }
.hz-pl span { display: inline-block; background: #004AAD; color: #fff; font-family: "Pop"; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.01em;
  font-size: 76px; line-height: 1.04; padding: 10px 28px 14px; box-shadow: 0 12px 34px rgba(0,0,0,.4); }
.hz-pl span + span { margin-top: 10px; }
"""


def setup_project(P, cam_full, cam_top):
    """Fonts + brand css + media into a scaffolded project (call once, idempotent)."""
    fd = os.path.join(P, "assets", "fonts"); os.makedirs(fd, exist_ok=True)
    for f in os.listdir(FONTS): shutil.copy(os.path.join(FONTS, f), fd)
    bc = os.path.join(P, "assets", "brand.css"); s = open(bc, encoding="utf-8").read()
    s = s.split("\n/* ---- MiM Prep x Hormozi")[0]                      # re-apply the current block on every build
    open(bc, "w", encoding="utf-8").write(s + BRAND_CSS)
    for src, dst in ((cam_full, "cam_full.mp4"), (cam_top, "cam_top.mp4")):
        d = os.path.join(P, "assets", dst)
        if not os.path.exists(d) or os.path.getsize(d) != os.path.getsize(src): shutil.copy(src, d)


def style(open_on_face=True):
    """Call once in build.py after E.init: puts the caption / title-pill css on the top layer.
    #camTop only carries the audio (no split mode), so it is never shown; a reel opening on the creator shows #camFull on frame 0
    (a tl.set at 0 does not render while the playhead sits exactly on 0)."""
    E.top("", TOP_CSS + "\n#camTop { opacity: 0 !important; }", "gsap.set('#camFull', {opacity:1});" if open_on_face else "")


def captions(words_path, out_path, phrases, styled=None, show=None):
    """phrases: list of caption strings in order (exact words). styled: {"word": "b"|"i"} -> wrapped in <b>/<i>.
    show: {"word": "Shown"} display fixes (ASR spellings, names, British spelling) - matching still uses the heard word.
    Times come from words.json ([[s,e,w],..] on the cut clock), matched word by word."""
    show = show or {}
    W = [[float(w[0]), float(w[1]), str(w[2])] for w in json.load(open(words_path))]
    norm = lambda x: re.sub(r"[^a-z0-9']", "", x.lower())
    caps, i = [], 0
    for ph in phrases:
        toks = ph.split(); start = end = None
        for t in toks:
            while i < len(W) and norm(W[i][2]) != norm(re.sub(r"<[^>]+>", "", t)): i += 1
            if i >= len(W): raise SystemExit("caption word not found in order: %r (phrase %r)" % (t, ph))
            if start is None: start = W[i][0]
            end = W[i][1]; i += 1
        sh = lambda t: show.get(norm(t), t)
        txt = " ".join(("<%s>%s</%s>" % (styled[norm(t)], sh(t), styled[norm(t)]) if styled and norm(t) in styled else sh(t)) for t in toks)
        caps.append({"text": txt, "start": round(start, 3), "wend": round(end, 3)})
    for k, c in enumerate(caps):
        nx = caps[k + 1]["start"] if k + 1 < len(caps) else c["wend"] + 0.6
        c["end"] = round(min(nx, c["wend"] + 0.6), 3)
    json.dump(caps, open(out_path, "w"), indent=0); return caps


# ------------------------------------------------------------------ face-window overlays
def hook(lines, out, top=300):
    """The opening title: black italic caps on white boxes, on screen from frame 1."""
    html = "".join('<div class="hz-hk" id="hzh%d" style="top:%dpx"><span>%s</span></div>' % (k, top + k * 92, ln) for k, ln in enumerate(lines))
    K.OF.append(html); K.OJ.append("tl.to([%s], {opacity:0, duration:0.25}, %s);" % (",".join("'#hzh%d'" % k for k in range(len(lines))), out))


def pill(pid, lines, t, out, top=820):
    """A LEVEL/STEP title: white black-italic caps on MiM-blue boxes, mid-frame on the creator."""
    html = '<div class="hz-pl" id="%s" style="top:%dpx">%s</div>' % (pid, top, "<br>".join("<span>%s</span>" % ln for ln in lines))
    K.OF.append(html); K.OJ.append("tl.fromTo('#%s', {opacity:0, scale:0.85}, {opacity:1, scale:1, duration:0.22, ease:'back.out(2)'}, %s); oout('#%s', %s, 0.2);" % (pid, t, pid, out))


# ------------------------------------------------------------------ card parts (HTML for K.raw bodies; ids get the {ID}- prefix)
def label(i, x, y, title, sub="", size=64, sub_size=28):
    return '<div id="{ID}-%s" class="hz-l" style="left:%dpx;top:%dpx"><b style="font-size:%dpx">%s</b>%s</div>' % (
        i, x, y, size, title, ('<i style="font-size:%dpx">%s</i>' % (sub_size, sub)) if sub else "")


def emoji(i, x, y, ch, size=150):
    return '<div id="{ID}-%s" class="hz-e" style="left:%dpx;top:%dpx;font-size:%dpx">%s</div>' % (i, x, y, size, ch)


def text(i, x, y, html, size=40, weight=500, italic=False, align="left"):
    tx = "translateX(-50%)" if align == "center" else "none"
    return '<div id="{ID}-%s" class="hz-t" style="left:%dpx;top:%dpx;font-size:%dpx;font-weight:%d;font-style:%s;transform:%s;text-align:%s">%s</div>' % (
        i, x, y, size, weight, "italic" if italic else "normal", tx, align, html)


def box(i, x, y, w, h):
    return '<div id="{ID}-%s" class="hz-bx" style="left:%dpx;top:%dpx;width:%dpx;height:%dpx"></div>' % (i, x, y, w, h)


def lines(paths, w=1080, h=1500):
    """paths: [(id, d, stroke_width)] -> one svg; each path draws on with draw(tl, id, t). Arrowheads: give them their own path."""
    return '<svg class="hz-sv" width="%d" height="%d" viewBox="0 0 %d %d">%s</svg>' % (w, h, w, h, "".join(
        '<path id="{ID}-%s" class="hz-ln" d="%s" stroke-width="%s" pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="1000"/>' % (i, d, sw) for i, d, sw in paths))


def arrow(i, x1, y1, x2, y2, bend=0.0, sw=9, head=26):
    """A curved white arrow from (x1,y1) to (x2,y2); returns [(id, d, sw), (id+'h', head d, sw)] for lines()."""
    import math
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2; dx, dy = x2 - x1, y2 - y1
    cx, cy = mx - dy * bend, my + dx * bend
    tx, ty = x2 - cx, y2 - cy; L = math.hypot(tx, ty) or 1; ux, uy = tx / L, ty / L
    a1 = (x2 - head * (ux * 0.8 - uy * 0.6), y2 - head * (uy * 0.8 + ux * 0.6)); a2 = (x2 - head * (ux * 0.8 + uy * 0.6), y2 - head * (uy * 0.8 - ux * 0.6))
    return [(i, "M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f" % (x1, y1, cx, cy, x2, y2), sw),
            (i + "h", "M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f" % (a1[0], a1[1], x2, y2, a2[0], a2[1]), sw)]


def person(i, x, y, size=120, color="#fff"):
    return '<div id="{ID}-%s" class="hz-x" style="left:%dpx;top:%dpx;width:%dpx;height:%dpx;color:%s">%s</div>' % (i, x, y, size, size, color, K.PERSON)


# ------------------------------------------------------------------ card timing (scene JS)
def show(ids, times):
    """Pop each part on at its time (the engine turns opacity 0->1 into a focus pull landing just before the word)."""
    return "".join('tl.fromTo(q("%s"), {opacity:0, scale:0.9}, {opacity:1, scale:1, duration:0.4}, T(%s));' % (i, t) for i, t in zip(ids, times))


def drawn(ids, t, d=0.5):
    return "".join('draw(tl, "%s", %s, %s);' % (i, t, d) for i in ids)


def dim(ids, t, to=0.3):
    return 'tl.to([%s], {opacity:%s, duration:0.3}, T(%s));' % (",".join('q("%s")' % i for i in ids), to, t)


# ------------------------------------------------------------------ flags, drawn (Windows' emoji font has no flag glyphs)
def flag(i, x, y, w, kind):
    """A flat flag centred on (x, y), w px wide (3:2), white border. kind: fr | de | uk."""
    h = round(w * 2 / 3)
    if kind == "fr": inner = '<div style="display:flex;width:100%;height:100%"><i style="flex:1;background:#0055A4"></i><i style="flex:1;background:#fff"></i><i style="flex:1;background:#EF4135"></i></div>'
    elif kind == "de": inner = '<div style="display:flex;flex-direction:column;width:100%;height:100%"><i style="flex:1;background:#000"></i><i style="flex:1;background:#DD0000"></i><i style="flex:1;background:#FFCE00"></i></div>'
    else: inner = ('<svg viewBox="0 0 60 40" width="100%" height="100%" preserveAspectRatio="none"><rect width="60" height="40" fill="#012169"/>'
                   '<path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="8"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="3"/>'
                   '<path d="M30,0 V40 M0,20 H60" stroke="#fff" stroke-width="12"/><path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="7"/></svg>')
    return ('<div id="{ID}-%s" class="hz-x" style="left:%dpx;top:%dpx;width:%dpx;height:%dpx;border:5px solid #fff;border-radius:10px;overflow:hidden;'
            'box-shadow:0 14px 34px rgba(0,0,0,.3);box-sizing:border-box">%s</div>') % (i, x, y, w, h, inner)


def chip(i, x, y, html, size=40):
    """A white rounded tag with blue text (a name or wordmark, e.g. a company), centred on x."""
    return ('<div id="{ID}-%s" class="hz-t" style="left:%dpx;top:%dpx;transform:translateX(-50%%);background:#fff;color:#004AAD;font-weight:800;'
            'font-size:%dpx;padding:14px 34px;border-radius:18px;letter-spacing:-0.01em;box-shadow:0 14px 34px rgba(0,0,0,.25)">%s</div>') % (i, x, y, size, html)


# ------------------------------------------------------------------ photoreal cut-out objects (gen_asset.py) - the card's hero pictures
OBJ_CSS = """.hz-im { position: absolute; transform: translate(-50%, -50%); z-index: 5; opacity: 0; filter: drop-shadow(0 8px 12px rgba(0,0,0,.20)); }
.hz-im img { display: block; height: 100%; width: auto; }"""


def img(i, x, y, name, h=260, w=None):
    """A generated cut-out object (assets/obj/<name>.png) centred on (x, y), h px tall. w: fit it inside a w x h box instead
    (list bullets: wide objects like a handshake would otherwise run into their label)."""
    if w:
        return ('<div id="{ID}-%s" class="hz-im" style="left:%dpx;top:%dpx;width:%dpx;height:%dpx"><img src="assets/obj/%s.png" '
                'style="width:100%%;height:100%%;object-fit:contain"/></div>') % (i, x, y, w, h, name)
    return '<div id="{ID}-%s" class="hz-im" style="left:%dpx;top:%dpx;height:%dpx"><img src="assets/obj/%s.png"/></div>' % (i, x, y, h, name)


def tick(i, x, y, size=84, good=True):
    """A flat round green tick / red cross badge (replaces the emoji check marks)."""
    col = "#2FA65A" if good else "#E5484D"
    path = "M28,52 L44,68 L74,34" if good else "M32,32 L68,68 M68,32 L32,68"
    return ('<div id="{ID}-%s" class="hz-x" style="left:%dpx;top:%dpx;width:%dpx;height:%dpx"><svg viewBox="0 0 100 100" width="100%%" height="100%%">'
            '<circle cx="50" cy="50" r="46" fill="%s" stroke="#fff" stroke-width="5"/><path d="%s" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
            ) % (i, x, y, size, size, col, path)


def assets_into(P, names, src=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")):
    """Copy the named objects into <project>/assets/obj/."""
    d = os.path.join(P, "assets", "obj"); os.makedirs(d, exist_ok=True)
    for n in names: shutil.copy(os.path.join(src, n + ".png"), d)


# ================================================================== short-form-animation-brain layer (Ultimate Editors)
# Motion: spring (stiffness 220, damping 18 -> zeta 0.607, w0 14.83 rad/s, settles in ~0.45 s), elements land ON their word,
# hard cuts (no composition fades - see hard_cuts()). Types: card list, vertical slider, crowd, comparison (stacked), money line,
# concept, credibility lower third, section markers (the pills). Portrait = vertical stacking, never three across.
SPRING_JS = ("const __spr = function (p) { const t = p * 0.6; return 1 - Math.exp(-9.0 * t) * (Math.cos(11.79 * t) + 0.763 * Math.sin(11.79 * t)); };"
             "function sp(s, g, o) { o = o || {}; const el = q(s); __ft(el, {opacity:0}, {opacity:1, duration:0.12, ease:'none'}, T(g) - 0.1);"
             "  __ft(el, {scale: o.from == null ? 0.6 : o.from, y: o.y == null ? 40 : o.y}, {scale:1, y:0, duration:0.6, ease:__spr}, T(g) - 0.1); }")


def spring(ids, times, **kw):
    """Spring each part on AT its word (0.1 s lead, the brain's short-form window). kw: from (scale), y (px).
    Put SPRING_JS once at the start of the scene's js (brain_js() does it)."""
    o = "{%s}" % ",".join("%s:%s" % (k, v) for k, v in kw.items())
    return "".join('sp("%s", %s, %s);' % (i, t, o) for i, t in zip(ids, times))


def brain_js(js):
    """Prefix a scene's js with the spring helpers (once per scene)."""
    return SPRING_JS + js


def slider(pre, items, x=540, y0=430, w=820, h=150, gap=70):
    """Vertical slider (brain type 5): stacked boxes joined by thin connectors; the active box is solid white with blue text,
    the earlier ones fade back to outlines. items: [(num, label, sub, t_active)]. Returns (html, js) - js needs brain_js()."""
    html, js = "", ""
    for k, (n, lab, sub, t) in enumerate(items):
        top = y0 + k * (h + gap)
        html += ('<div id="{ID}-%sb%d" class="hz-sl" style="left:%dpx;top:%dpx;width:%dpx;height:%dpx"><span class="n">%s</span>'
                 '<span class="l"><b>%s</b>%s</span></div>') % (pre, k, x - w // 2, top, w, h, n, lab, ("<i>%s</i>" % sub) if sub else "")
        if k: html += '<i id="{ID}-%sc%d" class="hz-slc" style="left:%dpx;top:%dpx;height:%dpx"></i>' % (pre, k, x - 2, top - gap, gap)
    for k, (n, lab, sub, t) in enumerate(items):
        js += 'sp("%sb%d", %s, {from:0.85, y:30});' % (pre, k, t)
        if k: js += '__ft(q("%sc%d"), {scaleY:0}, {scaleY:1, duration:0.25, ease:"power2.out"}, T(%s) - 0.3);' % (pre, k, t)
        js += 'tl.to(q("%sb%d"), {backgroundColor:"#FFFFFF", color:"#004AAD", borderColor:"#FFFFFF", duration:0.18}, T(%s));' % (pre, k, t)
        if k: js += ('tl.to(q("%sb%d"), {backgroundColor:"rgba(255,255,255,0)", color:"#FFFFFF", borderColor:"rgba(255,255,255,.45)", '
                     'opacity:0.55, duration:0.18}, T(%s));') % (pre, k - 1, t)
    return html, js


def crowd(pre, rows, x=540):
    """Crowd visualisation (brain type 6), stacked vertically. rows: [(label, sub, count, highlight, top, t)] - many faded
    figures for the crowd, ONE bright figure with a glow for the few. Returns (html, js) - js needs brain_js()."""
    html, js = "", ""
    for r, (lab, sub, n, hot, top, t) in enumerate(rows):
        cols = min(n, 9); size = 120 if hot else (62 if n > 1 else 120); gx = 135 if hot else (84 if n > 1 else 0)
        x0 = x - (cols - 1) * gx / 2
        html += '<div id="{ID}-%sl%d" class="hz-l" style="left:%dpx;top:%dpx"><b style="font-size:52px">%s</b>%s</div>' % (
            pre, r, x, top, lab, ('<i style="font-size:34px">%s</i>' % sub) if sub else "")
        for k in range(n):
            cx, cy = x0 + (k % cols) * gx, top + 150 + (k // cols) * 86 + (40 if hot or n == 1 else 0)
            if hot: html += '<i id="{ID}-%sg%d_%d" class="hz-glow" style="left:%dpx;top:%dpx"></i>' % (pre, r, k, cx, cy)
            html += person("%sp%d_%d" % (pre, r, k), cx, cy, size, "#FFFFFF" if hot or n == 1 else "rgba(255,255,255,.55)")
        js += 'sp("%sl%d", %s, {from:0.9, y:20});' % (pre, r, t)
        js += "".join('sp("%sp%d_%d", %s, {from:0.4, y:0});' % (pre, r, k, round(t + 0.025 * k, 3)) for k in range(n))
        if hot: js += "".join('__ft(q("%sg%d_%d"), {opacity:0, scale:0.3}, {opacity:1, scale:1, duration:0.5, ease:"power2.out"}, T(%s));' % (pre, r, k, t + 0.2) for k in range(n))
    return html, js


def money(i, x, y, html_line, size=104, sub="", sub_size=44):
    """Money line (brain type 8): under 12 words, bold, centred; ONE word wrapped in <u> becomes a white block with blue text."""
    return ('<div id="{ID}-%s" class="hz-mn" style="left:%dpx;top:%dpx;font-size:%dpx">%s%s</div>'
            % (i, x, y, size, html_line, ('<i style="font-size:%dpx">%s</i>' % (sub_size, sub)) if sub else ""))


def lower_third(i, name, cred, t, out, top=1290):
    """Credibility marker (brain type 2) on the creator: name + credential, small and calm."""
    K.OF.append('<div class="hz-lt" id="%s" style="top:%dpx"><b>%s</b><span>%s</span></div>' % (i, top, name, cred))
    K.OJ.append("tl.fromTo('#%s', {opacity:0, y:20}, {opacity:1, y:0, duration:0.35, ease:'back.out(1.6)'}, %s); oout('#%s', %s, 0.15);" % (i, t, i, out))


def punch(windows, scale=1.18, origin="50% 32%"):
    """Punch-in on a same-angle jump that has no card over it: the face camera container is scaled up for each [a, b] window,
    so the shots either side of the jump differ in size and it reads as a cut, not a glitch. It scales #camFull (a transform:
    the frame renderer ignores the standalone CSS scale property), so keep hook/pill overlays out of punch windows."""
    js = "".join("tl.set('#camFull', {scale:%s, transformOrigin:'%s'}, %s); tl.set('#camFull', {scale:1}, %s);" % (scale, origin, a, b) for a, b in windows)
    E.top("", "", js)


def hard_cuts(root):
    """The brain's rule 'never fade a composition in or out': after E.build(), strip the engine's whole-graphic focus pull on
    entry and its soft fade before every switch from the scene files (the cut itself is the transition)."""
    import glob as _g
    used = open(os.path.join(root, "index.html"), encoding="utf-8", errors="replace").read()
    for f in _g.glob(os.path.join(root, "compositions", "*.html")):            # scene files from earlier builds: delete
        if "compositions/" + os.path.basename(f) not in used: os.remove(f); continue
        s = open(f, encoding="utf-8").read()
        s = re.sub(r'__ft\("#" \+ ID \+ "-in", \{ opacity: 0, scale: 1\.07, filter: "blur\(18px\)" \}.*?V\);[^\n]*', "", s)
        s = re.sub(r'__tt\("#" \+ ID \+ "-in", \{ opacity: 0, duration: 0\.3, ease: "power2\.inOut" \}, [^)]*\);', "", s)
        open(f, "w", encoding="utf-8").write(s)


BRAIN_CSS = """
.hz-sl { position: absolute; display: flex; align-items: center; gap: 30px; padding: 0 40px; box-sizing: border-box; border: 4px solid rgba(255,255,255,.45);
  border-radius: 26px; color: #fff; z-index: 5; opacity: 0; font-family: "Pop"; }
.hz-sl .n { font-weight: 900; font-style: italic; font-size: 58px; min-width: 70px; }
.hz-sl .l b { display: block; font-weight: 800; font-size: 48px; text-transform: uppercase; line-height: 1.05; }
.hz-sl .l i { display: block; font-weight: 500; font-size: 32px; margin-top: 4px; }
.hz-slc { position: absolute; width: 4px; background: rgba(255,255,255,.7); transform-origin: 50% 0; z-index: 4; }
.hz-glow { position: absolute; width: 230px; height: 230px; margin: -115px 0 0 -115px; border-radius: 50%; z-index: 4; opacity: 0;
  background: radial-gradient(closest-side, rgba(255,255,255,.55), rgba(255,255,255,.12) 60%, rgba(255,255,255,0)); }
.hz-mn { position: absolute; transform: translateX(-50%); width: 940px; text-align: center; z-index: 5; opacity: 0; font-family: "Pop"; font-weight: 900;
  font-style: italic; text-transform: uppercase; line-height: 1.08; color: #fff; letter-spacing: -0.01em; }
.hz-mn u { text-decoration: none; display: inline-block; background: #fff; color: #004AAD; padding: 0 18px 6px; margin: 6px 0; }
.hz-mn i { display: block; font-style: italic; font-weight: 500; text-transform: none; margin-top: 26px; }
"""
TOP_CSS += """
.hz-lt { position: absolute; left: 0; width: 1080px; text-align: center; z-index: 30; opacity: 0; font-family: "Pop"; color: #fff; }
.hz-lt b { display: inline-block; background: #004AAD; padding: 8px 22px 10px; font-weight: 800; font-size: 40px; text-transform: uppercase; }
.hz-lt span { display: inline-block; background: #fff; color: #004AAD; padding: 8px 22px 10px; font-weight: 700; font-size: 40px; }
"""
BRAND_CSS += BRAIN_CSS
