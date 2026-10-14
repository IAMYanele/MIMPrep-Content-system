# Remotion Prompt Framework

Use this framework when prompting an AI to generate Remotion animations.
Fill in as many fields as possible for precise output. Skip sections for creative freedom.

---

## 1. FORMAT

```
Resolution:    [1920x1080 | 1280x720 | 1080x1920 | 1080x1080]
Orientation:   [landscape | portrait | square]
FPS:           [30 | 60]
Duration:      [X seconds]
Use case:      [YouTube intro | Instagram Reel | ad | explainer | product demo | etc.]
```

## 2. STYLE

```
Theme:         [dark | light | colorful | minimal | glassmorphism | neon]
Color palette: [list 2-4 hex codes, or describe: "purple/blue gradient"]
Typography:    [bold modern | elegant serif | playful rounded | monospace tech]
Mood:          [professional | playful | dramatic | calm | energetic | luxurious]
Animation:     [bouncy springs | smooth easing | snappy | cinematic slow]
Reference:     [optional: "like Stripe's website" or "like Apple keynote"]
```

## 3. SCENES (repeat for each scene)

```
Scene [N]:
  Name:        [Hero | Features | Testimonial | CTA | etc.]
  Duration:    [X seconds]
  Background:  [solid color | gradient | pattern | image]
  Elements:    [list what appears on screen]
  Animation:   [how elements enter/exit/move]
  Text:        [exact copy to display]
  Transition:  [fade | slide | wipe | none] to next scene
```

## 4. CONTENT

```
Brand name:    [name]
Tagline:       [tagline]
Features:      [feature 1, feature 2, feature 3]
Stats:         [optional: "10K users", "$2M revenue"]
CTA text:      [optional: "Get Started Free"]
URL:           [optional: "yoursite.com"]
```

## 5. TECHNICAL

```
Assets:        [none | list any images/videos/audio to include]
Interactivity: [static render | parametrizable with Zod schema]
Output:        [MP4 | WebM | GIF | transparent video]
```

---

## Full Example Prompt

```
Make a Remotion animation with:

FORMAT:
- 1920x1080, 30fps, 15 seconds, YouTube pre-roll ad

STYLE:
- Dark theme with deep navy (#0B1120) to purple (#1a0a2e) gradients
- White + light purple text, accent color #8B5CF6
- Inter font, bold modern typography
- Smooth spring animations (damping: 200), no bounce
- Cinematic feel, like Linear.app's marketing

SCENES:
1. Logo Reveal (0-3s): Brand name "Nexus" scales up from center
   with a glowing purple ring expanding behind it. Tagline
   "Build faster together" fades in below.

2. Problem (3-6s): Text "Tired of scattered tools?" types in
   character by character. Three red X icons appear next to
   pain points: "Slow deploys", "Lost context", "Broken workflows"

3. Solution (6-10s): Three feature cards slide in from bottom
   staggered 0.2s apart:
   - "One-click Deploy" with rocket icon
   - "AI Code Review" with sparkle icon
   - "Live Collaboration" with people icon
   Each card has a colored gradient icon badge.

4. Social Proof (10-12s): Counter animates from 0 to "12,847 teams"
   with subtitle "ship 3x faster with Nexus"

5. CTA (12-15s): "Start free today" with glowing button,
   URL "nexus.dev" fades in at bottom. Subtle particle effect.

TRANSITIONS: 0.5s crossfade between all scenes

CONTENT:
- Brand: Nexus
- Tagline: Build faster together
- Features: One-click Deploy, AI Code Review, Live Collaboration
- Stat: 12,847 teams
- CTA: Start free today
- URL: nexus.dev

TECHNICAL:
- No external assets needed
- Make it parametrizable (brand name + tagline as Zod props)
- Output as MP4
```

---

## Tips for Better Prompts

- **Be specific about animation style**: "bouncy spring" vs "smooth slide" vs "snappy pop" produce very different results
- **Include exact text**: Don't say "add a tagline", say "tagline: Build faster together"
- **Reference images help for**: color palettes, layouts, UI card styles, typography
- **Reference images don't help for**: motion/animation feel (describe in words instead)
- **Describe transitions**: How scenes connect matters as much as the scenes themselves
- **Specify duration per scene**: This controls pacing — front-load the hook for social media
