"""Where this pipeline keeps its intermediates.

Everything (extracted audio, transcripts, blurred CV PNGs, ASS subtitles, trimmed
cuts) lands under one working directory so a run is easy to inspect and easy to
throw away. It defaults to ./cv-work in the folder you run from (never inside the
installed skill), and CVWORK overrides it -- useful when the footage lives on an
external drive and you want the scratch there too.
"""
import os

WORK = os.environ.get("CVWORK") or os.path.join(os.getcwd(), "cv-work")

for _sub in ("captions", "render", "trimmed", "geom", "norm"):
    os.makedirs(os.path.join(WORK, _sub), exist_ok=True)
