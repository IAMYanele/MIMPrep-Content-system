#!/bin/bash
# render_queue.sh <job id>... : render each prepped job, one at a time
T="$(dirname "$0")"; G=G:/mim-master-urgency-2026-10
declare -A TITLE=([A]="Round 1 is gone" [B]="Every round fewer seats" [C]="The real timeline" [D]="We only take 30 per round" [E]="Next year is not free")
for id in "$@"; do
  L=${id:0:1}; H=${id:1:1}
  python "$T/render_job.py" "$id" "Master $L - ${TITLE[$L]} - Hook $H - London EDIT ${VER:-v1}.mp4" "$(cat $G/jobs/$id/cta_start.txt)" 2>&1 | grep -v waiting
done
