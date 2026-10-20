#!/usr/bin/env bash
# Install (or update) this repo's Claude skills into ~/.claude/skills so they work from
# any folder. Re-run after every `git pull`. The repo is the source of truth: edits made
# directly in ~/.claude/skills get overwritten.
set -euo pipefail
src="$(cd "$(dirname "$0")" && pwd)/.claude/skills"
dst="$HOME/.claude/skills"
mkdir -p "$dst"
for d in "$src"/*/; do
  name="$(basename "$d")"
  rm -rf "$dst/$name" 2>/dev/null || true
  mkdir -p "$dst/$name"
  cp -R "$d"/. "$dst/$name"/
  find "$dst/$name" -name "__pycache__" -type d -prune -exec rm -rf {} +
  echo "installed $name"
done
echo
echo "Also needed once per machine:"
echo "  pip install numpy opencv-python pillow pillow-heif requests faster-whisper google-genai rembg pymatting"
echo "  ffmpeg + ffprobe on PATH; Helvetica Now Text Medium installed (cover font)"
echo "  GEMINI_API_KEY (covers) and OPENAI_API_KEY (transcription) - see each SKILL.md"
