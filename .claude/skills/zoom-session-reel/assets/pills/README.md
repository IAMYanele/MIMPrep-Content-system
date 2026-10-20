# Tutor credential pills

One PNG per tutor, named `<tutor>.png` in lowercase (e.g. `margot.png`): RGBA, 708x79, a white
rounded pill (radius 15) with the tutor's name, school logos and GMAT score, as on Thomas's
approved reel. `title_card.py --tutor <tutor>` centres it 20px under the title box.

The pill PNGs are kept out of git (`.gitignore`), because this repo is public and a pill holds
a tutor's name and credentials. Add one only with that tutor's OK to be posted. Until a
tutor's PNG is here, use `--pill-text "Name · School · Score"`. It renders a text-only pill in
the same serif. Get the credentials from the user; never guess them.

On Yanele's PC, the first tutor's pill was cut from Thomas's example reel (frame 1s, x 186-893,
y 1396-1474 of the 1080x1920 frame).
