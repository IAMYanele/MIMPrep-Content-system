#!/bin/bash
# Step 1: Concatenate all clips into one video (simple concat, clips are already timed)
CLIPS_DIR="public/env-clips"
OUTPUT="out/environment-video.mp4"
AUDIO="public/environment-audio.mp3"
SUBS="public/environment-subs.srt"

# Create concat list
echo "file '${CLIPS_DIR}/clip1.mp4'
file '${CLIPS_DIR}/clip2.mp4'
file '${CLIPS_DIR}/clip3.mp4'
file '${CLIPS_DIR}/clip4.mp4'
file '${CLIPS_DIR}/clip5.mp4'
file '${CLIPS_DIR}/clip6.mp4'
file '${CLIPS_DIR}/clip7.mp4'" > concat_list.txt

# Concat videos, add audio, burn in subtitles
# Using xfade filter for crossfade transitions between clips
# Clip durations: 6, 6, 3.2, 4.8, 5.2, 4.2, 8 = 37.4s total
# Crossfade duration: 0.3s each

ffmpeg -y \
  -i "${CLIPS_DIR}/clip1.mp4" \
  -i "${CLIPS_DIR}/clip2.mp4" \
  -i "${CLIPS_DIR}/clip3.mp4" \
  -i "${CLIPS_DIR}/clip4.mp4" \
  -i "${CLIPS_DIR}/clip5.mp4" \
  -i "${CLIPS_DIR}/clip6.mp4" \
  -i "${CLIPS_DIR}/clip7.mp4" \
  -i "${AUDIO}" \
  -filter_complex "
    [0:v]setpts=PTS-STARTPTS[v0];
    [1:v]setpts=PTS-STARTPTS[v1];
    [2:v]setpts=PTS-STARTPTS[v2];
    [3:v]setpts=PTS-STARTPTS[v3];
    [4:v]setpts=PTS-STARTPTS[v4];
    [5:v]setpts=PTS-STARTPTS[v5];
    [6:v]setpts=PTS-STARTPTS[v6];
    [v0][v1]xfade=transition=fade:duration=0.3:offset=5.7[x01];
    [x01][v2]xfade=transition=fade:duration=0.3:offset=11.4[x02];
    [x02][v3]xfade=transition=fade:duration=0.3:offset=14.3[x03];
    [x03][v4]xfade=transition=fade:duration=0.3:offset=18.8[x04];
    [x04][v5]xfade=transition=fade:duration=0.3:offset=23.7[x05];
    [x05][v6]xfade=transition=fade:duration=0.3:offset=27.6[x06];
    [x06]subtitles='${SUBS}':force_style='FontName=Arial,FontSize=13,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H80000000,Outline=2,Shadow=1,MarginV=120,Alignment=2,BorderStyle=1'[vout]
  " \
  -map "[vout]" -map 7:a \
  -c:v libx264 -preset medium -crf 18 \
  -c:a aac -b:a 192k \
  -shortest \
  "${OUTPUT}" 2>&1 | tail -20
