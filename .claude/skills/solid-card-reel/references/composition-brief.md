# Composition brief: solid-card scenes

The generation brief for every full-screen card in this style. It applies the Ultimate Editors design-layer method
(`ai-designer-brain`, `podcast-edit-design-minimal`: references always attached, fixed style contract, per-block
prompts, QC, approved outputs feed their siblings) to the Hormozi solid-card reference, re-skinned to the brand.

## 1. What a card is

One flat brand-colour field (MiM Prep `#004AAD`, never the reference's purple), and on it:

1. **Hero objects**: FLAT real photographs of objects or people - shot straight-on in plain daylight, like a photo cut
   out of a magazine - cut out cleanly on the card colour with only a light shadow. This is the reference's look: the
   front-on Coca-Cola can, the flat $100 bill, the creator at a laptop. People show their upper bodies, not floating hands.
   Never emoji or clip-art (Yanele, 2026-10-29: "very cheap"), and never glossy three-quarter studio product shots
   (rejected the same day as "3D images"; "when I said realistic, I meant like flat images").
2. **Labels**: Poppins ExtraBold ALL CAPS in white (`MAKE FRIENDS`), with an optional small italic sub-label
   under it (`Summer internship apps open`).
3. **Lists**: Poppins Medium sentence case, one bold key word per line (`They didn't know **how**`).
4. **Connectors**: thick white hand-drawn arrows (curved, rounded caps) and thin white rules. Flat white only.
5. **Flat badges where a picture can't carry it**: drawn flags, a green tick or red cross in a white-ringed circle,
   white wordmark chips for company names (`PIMCO`), the plain white avatar silhouette for "a person / a group".

Nothing else: no glass, no glow, no gradients, no grain, no headline over the card. The caption sits under the graphic.

## 2. Picking the hero object (the metaphor step)

For each card, take the sentence and find the ONE noun a viewer can see:

| She says | Object |
|---|---|
| "coffee chats" | a takeaway coffee cup |
| "exams start in October" | a stack of exam booklets with a pencil |
| "lose track super fast" | a tangled ball of red string |
| "balance my studies, my job and my sport" | a brass balance scale, then books / briefcase / stopwatch |
| "good luck" | a four-leaf clover |

Rules: one object per idea, the most literal everyday version of it, and no brand names or logos (that includes
universities and employers: those go in as white wordmark chips, never as generated logos). A person is a white
avatar silhouette unless real footage or photos of them exist.

## 3. Generating the objects (GPT Image 2)

`scripts/gen_asset.py <out_dir> <refs_dir> --gemini --style flat name="object description" ...`

- **Default: `--gemini --style flat`** (Nano Banana Pro, the flat straight-on contract). `--style product` is the old
  glossy studio contract, kept only for reference; `--style photo` makes candid real-life scene photos for a rounded
  photo card (offered as option B and not picked, 2026-10-29).

- **Model** `gpt-image-2` through the OpenAI images edit endpoint, `quality: high`, `1024x1024`.
- **References: always.** The 3 reference card frames in `references/refs/` go with every call (the reference rule:
  a prompt-only generation drifts to stock-icon or 3D-cartoon looks; the reference pixels carry the photographic
  cut-out look). Once an object is approved, it may join the refs for its siblings in the same reel.
- **Style contract** (fixed, in the script): a REAL photograph in the exact style of the reference objects; studio
  product shot; soft key light top-left; true materials; one object centred at about 80% of the canvas; slight
  three-quarter angle; soft contact shadow; no backdrop, text, logos, brand names, watermark or props.
- **Object block** (yours): material, colour, state and count, in plain words: "a brown leather briefcase",
  "two champagne flutes clinking together". If text must appear on the object (a calendar page), give it verbatim in
  capitals and say that's the ONLY text; everywhere else say "the text on the page is blurred and unreadable".
- **Transparency**: GPT Image 2 has no transparent output. The object is rendered on a flat plate of the CARD colour
  (`#004AAD`), never white, and matted with rembg `isnet-general-use` (largest component only). On white, white
  objects (calendar pages, paper, cups) lost chunks to the matte; on the card colour they survive, and any edge fringe
  is already the card colour. The card CSS gives every object a soft drop shadow back.
- **Fallback provider**: `--gemini` runs the same contract and references on Nano Banana Pro
  (`gemini-3-pro-image-preview`), e.g. when the OpenAI account is out of credits (it ran out mid-batch on the first
  job). The two models' objects sit together fine on one card; still QC them side by side.
- Run ONE generator process at a time (`--jobs 3`): each process loads its own matting model, and two pools ran the
  machine out of memory.

## 4. QC every object before it goes on a card

Open each PNG on the blue (`_check` composite) and reject it when any of these hold:

- It reads as an illustration, a 3D render or an icon rather than a photo.
- There's a logo, brand name, or legible fake text.
- It's the wrong count, or there are extra props.
- A bite is missing from the matte: white objects on the white plate (a cup lid, paper) are the usual failure.
- The light direction differs from its siblings on the same card.
- A BLUE part went missing: anything navy or royal blue (a suit sleeve, a lanyard) can matte away with the blue
  plate. Ask for a non-blue colour in the description ("charcoal-black suit jackets, nothing blue on them").
- Both GPT Image 2 and Nano Banana draw ONE chair when asked for "two chairs facing each other". Pick a symbol that is
  one object (a handshake for interviews, puzzle pieces for group projects), and ask for blank spines on books
  or the model invents off-topic titles ("Organic Chemistry").

Regenerate by deleting the PNG and re-running with the description sharpened, rather than editing the prompt contract.

## 5. Laying out the card

- One idea per card. Two to four parts that build one at a time, each landing ~0.6 s before its word.
- Hero object 240-340 px tall for a single hero, 150-200 px in a row of three, 110-150 px as a list bullet.
- Labels 50-92 px ExtraBold caps; sub-labels 36-44 px italic; lists 48-56 px.
- Graphic block inside y 380-1150, x 65-1015, centred. The caption sits at y ~1330 under it.
- Layout patterns from the reference: three columns ("3 P's"), a stacked list with objects as bullets
  ("knowledge / skills / environment"), a hub with arrows to labelled corners ("unique / sticky / expensive"),
  a before/after or expected/reality split, a left-to-right path with arrows, a checklist that ticks.
- Vary the pattern from card to card; never two identical layouts back to back.
