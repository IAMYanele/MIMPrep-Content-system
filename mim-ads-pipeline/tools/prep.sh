#!/bin/bash
# prep.sh <src.mp4> <job id>: decode check, base, captions, punch-ins
T="$(dirname "$0")"; SK=/c/Users/yanel/.claude/skills/thomas-broll-reel/scripts
J="G:/mim-master-urgency-2026-10/jobs/$2"
err=$(ffmpeg -v error -i "$1" -f null - 2>&1 | head -2); [ -n "$err" ] && { echo "CORRUPT $1: $err"; exit 1; }
python "$T/new_job.py" "$1" "$J" && python "$T/make_base_v.py" --job "$J" && \
python $SK/captions.py --job "$J" 2>&1 | grep -v -i warn | tail -1 && python "$T/punch.py" "$J" && cat "$J/transcript.txt"
