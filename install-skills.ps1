# Install (or update) this repo's Claude skills into your user skills folder, so they
# work from any folder you open Claude Code in. Re-run after every `git pull`.
#
#   powershell -ExecutionPolicy Bypass -File install-skills.ps1
#
# The repo is the source of truth: edit skills here, then re-run this. Edits made
# directly in ~/.claude/skills get overwritten.

$src = Join-Path $PSScriptRoot ".claude\skills"
$dst = Join-Path $HOME ".claude\skills"
New-Item -ItemType Directory -Force $dst | Out-Null

Get-ChildItem $src -Directory | ForEach-Object {
    $target = Join-Path $dst $_.Name
    if (Test-Path $target) { Remove-Item -Recurse -Force $target }
    Copy-Item -Recurse $_.FullName $target
    Get-ChildItem $target -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force
    Write-Host "installed $($_.Name)"
}

Write-Host ""
Write-Host "Done. Also needed once per machine:"
Write-Host "  pip install numpy opencv-python pillow pillow-heif requests faster-whisper google-genai rembg"
Write-Host "  ffmpeg + ffprobe on PATH; Helvetica Now Text Medium installed (cover font)"
Write-Host "  GEMINI_API_KEY (covers) and OPENAI_API_KEY (transcription) - see each SKILL.md"
