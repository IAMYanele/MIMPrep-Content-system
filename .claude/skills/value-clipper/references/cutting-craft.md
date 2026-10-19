# Cutting craft: how to cut speech so nobody hears the cut

Every rule here came from a real defect in a delivered clip.

## Cut in pauses, never on word timestamps

Whisper word times drift ±100ms, can be zero-length, and a "word" can span seconds of
silence. Cutting on a word start shaved consonants and **inverted meaning**: "don't do a
summary" became "do a summary", "the impact" became "the fact", "not the most professional"
became "the most professional". So:

- Every edge goes into a real pause, from `pauses.py`. `assemble.py` does this and keeps
  at most 0.35s of the pause, so joins stay tight.
- An edge with no pause nearby gets padded 0.3s into the silence and FLAGGED. Listen to it.
  A full second between words with no pause usually means a hidden "um" or a false start.
- Snapping to pauses also halves the number of windows, and that's what fixes "the whole
  video feels choppy". The choppiness was dozens of sub-2-second windows.

## Calibrate the silence threshold

`pauses.py` splits each recording's loudness into its two natural groups (speech and
silence, Otsu's method) and never puts the line within 11dB of speech. Two failures drove
this: on a GRE class, "speech minus 11dB" called the tutor's soft trailing "the" and "a"
silence (soft words sat 20-30dB under speech, real silence 40+), so tightening would have
cut them; and that threshold also put a false "pause" inside "hyper|link". A fixed offset
from the room's floor missed real pauses in a noisier room. Earlier, with a fixed number:
A remembered `-30dB` once sat above a soft speaker's quiet passages and called 3.2s of real
speech "dead air", which nearly deleted a sentence. Real silence reads -60 to -83dB; soft
speech still moves across 0.25s slices. If consecutive slices move, it's speech.
`silencedetect` prints at INFO level: under `-v error` it shows nothing, so never conclude
"no pauses" from empty output.

## Fillers and repeats (Level 2)

**Remove every um, uh, filler and redundancy** (user standard, 2026-10-19). A stumble left in
because it had no pause around it ("so make it clippable, that... make it clickable") was
sent back.

- Transcribe each chosen segment ON ITS OWN and VERBATIM (`transcribe.py --start --end`
  prompts Whisper with disfluent text so it keeps "uh"/"um"). The full-file pass merges
  stutters and deletes fillers.
- Hidden ums: voiced sound in a gap between words that isn't a word. `fillers.py` transcribes
  each burst on its own to tell an "uh" from a real word whose timing drifted.
- Cut at a PAUSE when there is one. Otherwise cut at the energy DIP between the two words
  (the quietest 10ms, at least 18dB under the speech level) with a 12ms fade.
- HARD (no gap at all): drop the whole sentence between two pauses instead of cutting
  inside a word.
- Take the connector with an abandoned start ("so make it clippable, that"), and when a
  sentence is said two or three ways, keep only the clearest version.
- Not every flagged phrase is a filler: "nine, nine and six, six" is the data, "this kind of
  question" and "because you know what it measures" are content. A filler phrase is set off
  by a comma or a pause; fillers.py now applies that, and wordless voiced bursts (breaths,
  word tails) are not reported, only bursts actually heard as um/uh/ah.
- Check what a removal takes with it. A cut that started one pause too early once deleted
  "contact you" along with the restart it was meant to remove. The dry-run read-back
  catches this.
- Whisper places words up to ~250ms off. Block ends taken off the transcript must let the
  last word finish (snap to the next pause): a dip-cut at a transcript time clipped
  "space". Only removal edges, already placed exactly, cut at dips.

## Joins and order (Level 3)

- End each block on a completed clause, never a dangling "because..." (a CV 08 window ended
  on a stray "because" and had to be re-cut).
- Every join must read as one continuous thought: no "this" or "he" pointing at something
  that was cut, no "and that's why" landing on an unrelated line.
- One clip, one main point. Never staple two topics together, however clean the joins.
- A rearranged version needs the same checks plus: does every line still mean what it
  meant in context? A rearrangement that changes what someone said is fabrication.

## Rendering and verifying

- Frame-accurate `trim`/`atrim` per window, 20ms audio fades at every join, `concat`,
  original resolution and frame rate. Stream copy is not frame-accurate.
- ffmpeg 9 removed `-vsync`: use `-fps_mode cfr`. Never grep ffmpeg's stderr away when
  checking a render.
- Loudness: two-pass `loudnorm` to -14 LUFS. The 16:9 CV clips once sat at -36 LUFS
  ("his voice is too soft") because normalisation only lived in the vertical build.
- **Always re-transcribe the rendered file and read it back.** This caught every defect
  above; window arithmetic never did. `assemble.py --render` does it automatically.
- One render at a time, never in parallel. Back up anything already delivered before
  overwriting it.
