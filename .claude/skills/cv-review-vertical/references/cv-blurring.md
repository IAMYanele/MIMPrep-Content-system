# Blurring the CV

The candidate agreed to have their CV critiqued, not published. Everything that
identifies them or a third party comes off before the clip ships. `scripts/cvimg.py`
renders the PDF to a tall PNG at 1080 wide and pixelates the regions it finds.

## What must go

- Name and surname
- Email (both the one on the CV and the one from the intake form)
- Phone number
- LinkedIn and any other social handle or URL
- Home address
- **The references block** -- this is third-party personal data, often someone who
  never agreed to anything, so it matters even more than the candidate's own details.

## How regions are found

Three passes, because no single one is reliable:

1. **Known values from the intake sheet** -- the candidate's name, email, LinkedIn
   and phone, searched as literal strings in the PDF text.
2. **Patterns** -- email, URL-ish and phone regexes, which catch a second address or
   a handle the sheet didn't record.
3. **Image objects** -- photos, since a headshot identifies as well as a name.

Plus `EXTRA`, a per-clip list of literal strings for anything the first three miss
(a street name, a postcode).

## Header band vs targeted

**Header band (default).** Blur everything above the first real section heading:

```
EDUCATION, EDUCATIONS, FORMATION, WORK EXPERIENCE, EXPERIENCE,
PROFESSIONAL EXPERIENCE, PROFILE, SUMMARY, OBJECTIVE, SKILLS,
EMPLOYMENT, ACADEMIC, EXPERIENCES, PARCOURS, COMPETENCES
```

This is deliberately blunt: the contact block lives up there, and blurring the whole
region catches things the text search cannot, like a detail baked into a logo. The
band is clamped to 60px..42% of page height so an unusual layout can't blank the page.

**Targeted (`NO_BAND`).** Blur only the specific found items. Use when the client says
the band hides too much -- on CV07 the ask was explicitly to show more of the layout.
The tradeoff is real: targeted mode only removes what it finds, so check the render.

## References, in several languages

Candidates write this heading in whatever language the CV is in:

```
References, Reference, Référence, Referees, Referencias,
Referencia, Referenze, Referenzen, Referências, Referenties
```

From the heading down to the bottom of the page gets covered. In targeted mode the
block is column-limited -- if the heading sits in the left half, cover x 0..600,
otherwise from a little left of the heading to the right edge -- because a
full-width box in a two-column CV wipes unrelated content.

## Padding, and the trap in it

The text rectangles the PDF reports sit roughly 12px above the rendered glyphs, so
boxes need padding or text shows through the top of the blur. But padding scaled from
the block's own height explodes on tall blocks: `h * 0.85` gave the references block
318px of padding and blurred most of the page. Cap it:

```python
py = min(max(12.0, h * 0.85), 26.0)
px = min(max(8.0,  (x1 - x0) * 0.04), 24.0)
```

## Don't blur the city

Resist matching on the sheet's address field or bare city strings. Employer and
university locations are legitimately part of the CV and read as the same tokens, so
this false-positives constantly. Target the street-level specifics instead.

## Pixelation

Downscale hard, scale back with nearest neighbour, then a light blur so the blocks
don't look like a deliberate graphic:

```python
reg.resize((w // 45, h // 20), BILINEAR).resize(orig, NEAREST).filter(GaussianBlur(11))
```

Irreversible, unlike a soft blur, which is the point.

## Check the render

Look at the actual PNG before compositing. The failure modes are quiet: a blur that
covered an entire page, a references box that started at x=168 and left the names
visible at x≈40, a second email the search never found.
