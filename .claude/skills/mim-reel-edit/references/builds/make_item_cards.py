"""Build 16:9 item cards for the ranking reels.

The items in these two videos are concepts, not products: there is no real screenshot
or interface to photograph for "a story about you" or "one week is hard to build on".
So each card is a bold line icon on the reel's own dark/blue ground, which reads at the
107px width a crowded tier row squeezes them to. Subject sits in the upper two thirds
because the engine prints the item name across the bottom.
"""
import os, sys

W, H = 960, 540
ACCENT = "#4490F6"
PALE = "#A9CCFF"

HEAD = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0C1A33"/><stop offset="1" stop-color="#050505"/>
  </linearGradient>
  <radialGradient id="glow" cx="50%" cy="38%" r="55%">
    <stop offset="0" stop-color="{ACCENT}" stop-opacity=".40"/>
    <stop offset="1" stop-color="{ACCENT}" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="{W}" height="{H}" fill="url(#bg)"/>
<rect width="{W}" height="{H}" fill="url(#glow)"/>
<g transform="translate(480,215)" fill="none" stroke="{ACCENT}" stroke-width="15"
   stroke-linecap="round" stroke-linejoin="round">'''
TAIL = "</g></svg>"


def person(cx, cy, s=1.0, col=ACCENT):
    return (f'<circle cx="{cx}" cy="{cy}" r="{30*s:.0f}" fill="{col}" stroke="none"/>'
            f'<path d="M{cx-46*s:.0f},{cy+96*s:.0f} a{46*s:.0f},{52*s:.0f} 0 0 1 {92*s:.0f},0" '
            f'fill="{col}" stroke="none"/>')


ICONS = {
    # --- C34 -------------------------------------------------------------
    # everyone is a member, nobody turns up: a full row of people, all equally faint
    "society": (person(-150, -40, .9, "#3A4A66") + person(-50, -40, .9, "#3A4A66")
                + person(50, -40, .9, "#3A4A66") + person(150, -40, .9, "#3A4A66")
                + '<path d="M-190,90 L190,90" stroke="#3A4A66" stroke-width="12"/>'),
    # changed something: a hand lifting a heart
    "volunteering": ('<path d="M0,-80 a52,52 0 0 1 88,52 c0,46 -88,104 -88,104 '
                     's-88,-58 -88,-104 a52,52 0 0 1 88,-52 z" fill="' + ACCENT + '" stroke="none"/>'
                     '<path d="M-150,135 q150,70 300,0"/>'),
    # a business problem under pressure: a board of figures and a clock running
    "case": ('<rect x="-180" y="-110" width="300" height="210" rx="16"/>'
             '<path d="M-130,50 L-130,-20 M-70,50 L-70,-60 M-10,50 L-10,10 M50,50 L50,-45"/>'
             '<circle cx="150" cy="70" r="62" stroke="' + PALE + '"/>'
             '<path d="M150,30 L150,70 L182,88" stroke="' + PALE + '"/>'),
    # real money, real decisions: a line that actually moves, with a currency mark
    "money": ('<path d="M-190,80 L-90,10 L-10,55 L90,-60 L190,-110"/>'
              '<circle cx="190" cy="-110" r="20" fill="' + ACCENT + '" stroke="none"/>'
              '<path d="M-150,-90 L-80,-90 M-115,-125 L-115,-55" stroke="' + PALE + '"/>'),
    # one week is hard to build a story on: a month, one column lit
    "oneweek": ('<rect x="-190" y="-110" width="380" height="250" rx="18"/>'
                '<path d="M-190,-40 L190,-40"/>'
                '<rect x="-60" y="-40" width="62" height="180" fill="' + ACCENT + '" stroke="none" opacity=".85"/>'
                '<path d="M-110,-150 L-110,-90 M110,-150 L110,-90"/>'),
    # work and study at the same time: a clock on top of a bag
    "job": ('<path d="M-160,0 L160,0 L160,130 L-160,130 Z"/>'
            '<path d="M-60,0 L-60,-45 a30,30 0 0 1 30,-30 L30,-75 a30,30 0 0 1 30,30 L60,0"/>'
            '<circle cx="118" cy="-78" r="66" stroke="' + PALE + '" fill="#050505"/>'
            '<path d="M118,-120 L118,-78 L152,-58" stroke="' + PALE + '"/>'),
    # --- C36 -------------------------------------------------------------
    # a 705 clears the bar, and so does everyone else's: one score on a scale
    "score": ('<path d="M-200,70 L200,70"/>'
              '<path d="M-200,40 L-200,100 M-70,50 L-70,90 M60,50 L60,90 M200,40 L200,100"'
              ' stroke="#3A4A66"/>'
              '<path d="M120,70 L120,-30" stroke="' + PALE + '"/>'
              '<circle cx="120" cy="-60" r="34" fill="' + ACCENT + '" stroke="none"/>'
              '<path d="M-200,-110 L-30,-110" stroke="#3A4A66" stroke-width="12"/>'),
    # an activity you built yourself: a block being set in place
    "built": ('<path d="M-170,110 L0,30 L170,110 L0,190 Z" fill="' + ACCENT + '" stroke="none" opacity=".30"/>'
              '<path d="M-170,110 L0,30 L170,110 L0,190 Z"/>'
              '<path d="M0,-150 L0,-20 M-55,-75 L0,-20 L55,-75" stroke="' + PALE + '"/>'),
    # 20 rushed essays: a deep stack of identical pages
    "stack": ('<rect x="-130" y="-120" width="260" height="150" rx="12" opacity=".35"/>'
              '<rect x="-130" y="-70" width="260" height="150" rx="12" opacity=".65"/>'
              '<rect x="-130" y="-20" width="260" height="150" rx="12"/>'
              '<path d="M-85,35 L85,35 M-85,85 L30,85" stroke="' + PALE + '" stroke-width="12"/>'),
    # a specific story about you: one quote, not a paragraph
    "story": ('<path d="M-170,-90 L170,-90 L170,90 L-40,90 L-120,160 L-120,90 L-170,90 Z"/>'
              '<path d="M-100,-20 L100,-20 M-100,30 L40,30" stroke="' + PALE + '" stroke-width="12"/>'),
    # it keeps you in a conversation, but that is it: two bubbles, going nowhere
    "convo": ('<path d="M-190,-100 L30,-100 L30,30 L-110,30 L-170,85 L-170,30 L-190,30 Z" opacity=".55"/>'
              '<path d="M-10,-30 L190,-30 L190,100 L170,100 L170,155 L110,100 L-10,100 Z"/>'),
    # you did not care enough to look them up: a search that was never run
    "lookup": ('<circle cx="-30" cy="-30" r="100"/>'
               '<path d="M45,45 L160,160"/>'
               '<path d="M-110,110 L160,-160" stroke="#B3261E" stroke-width="18"/>'),
    # no spike: a flat line next to the one that rises
    "spike": ('<path d="M-190,60 L190,60" stroke="#3A4A66"/>'
              '<path d="M-190,60 L-60,60 L10,-120 L80,60 L190,60" opacity=".30"/>'),
    # AI cannot create human substance: a chip with nothing inside
    "ai": ('<rect x="-120" y="-120" width="240" height="240" rx="28"/>'
           '<rect x="-45" y="-45" width="90" height="90" rx="10" stroke="' + PALE + '" opacity=".5"/>'
           '<path d="M-120,-60 L-180,-60 M-120,0 L-180,0 M-120,60 L-180,60'
           ' M120,-60 L180,-60 M120,0 L180,0 M120,60 L180,60'
           ' M-60,-120 L-60,-180 M0,-120 L0,-180 M60,-120 L60,-180'
           ' M-60,120 L-60,180 M0,120 L0,180 M60,120 L60,180"/>'),
    # one personal story for the whole degree: a single book
    "book": ('<path d="M-150,-120 L-150,120 L0,150 L150,120 L150,-120 L0,-90 Z"/>'
             '<path d="M0,-90 L0,150"/>'),
}

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
for name, body in ICONS.items():
    open(os.path.join(OUT, name + ".svg"), "w", encoding="utf-8").write(HEAD + body + TAIL)
print(f"wrote {len(ICONS)} cards to {OUT}")
