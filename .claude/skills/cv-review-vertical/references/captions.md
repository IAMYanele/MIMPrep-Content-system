# Captions

Burned in with libass, from a word-level transcript of the **finished** cut so the
times need no remapping.

## Style

```
Style: Cap,HelveticaNowText Medium,88,&H00FFFFFF,&H00FFFFFF,&H00000000,
       &H78000000,0,0,0,0,100,100,0,0,1,0,3,5,40,40,40,1
```

White, no outline, soft shadow, positioned per line with `\pos(540, 556)` so the
baseline is fixed rather than drifting with line count.

The font was identified by measuring rendered width against the reference -- 349px
for a sample string at Helvetica Now Text Medium 88, against 428px for the Arial
fallback, which is how a missing font gives itself away.

## Size is probably not the problem

When captions "look too big", measure before resizing. Compared against the
reference, both landed on a **31px x-height** -- identical. What differed was line
length: three-word lines ran up to 28 characters and about 2.4x the reference's
pixel width. Shortening the lines fixed the complaint with the font untouched.

A quick way to measure either side: count pure-white, low-saturation pixels
(`min(r,g,b) > 238` and `max-min < 10`) per row in the caption band. The ink extent
gives you x-height and ascender height directly. Restrict the band tightly -- a
bright wall or laptop edge in the panel will otherwise widen the box and make the
numbers meaningless.

## Chunking

```
max 2 words, max 11 characters per line
break at sentence ends
also break on a gap > 0.55s or a line longer than 1.5s
```

The character cap matters as much as the word cap: two long words ("should receive")
still overflow. Lines of 1-2 words average ~7.8 characters, matching the reference's
6-9.

Sentence ends are found by aligning the punctuated transcript text against the
unpunctuated word list and flagging the words that close a sentence. Breaking there
keeps clauses intact instead of splitting mid-thought.

A single word longer than the cap cannot be split, so occasional 15-16 character
lines are expected and fine.

## Overlap clamp

Clamp every line's end to the next line's start minus 0.01s. Without it libass paints
two lines on top of each other and renders unreadable garble. Worth asserting after
generating: no overlaps, no zero-length lines.

## Word fixes

Whisper mishears predictable things in this material, so a per-clip correction table
runs before the ASS is written:

- Domain words -- "uni", "committee", "cohort", and school or company names
- Candidate names, which it spells differently each time
- **`%` arrives as its own empty token** and must be glued onto the preceding number
- Decimals get split ("6.5" -> "6", "5") and need rejoining

Corrections operate on the word list and must preserve the sentence-break flag, or
the line breaks move.

Fixes come from checking the render against what was actually said -- not from
guessing. When a client lists errors against a review link, fix exactly those.

## When the audio changes

If a clip is trimmed after captions exist, **re-transcribe the trimmed file**. Word
times then land in output time directly, and the result is correct rather than
approximately correct.

Re-timing existing subtitles around a removed span is a fallback for when the
transcription API is unavailable. It works, but a line that straddles the cut gets
dropped -- which silently lost a "GPA" caption once -- and `scripts/resplit_ass.py`,
which re-splits long lines by interpolating on character count, is only approximate
within a line. Both are stopgaps; redo them properly once the API is back.
