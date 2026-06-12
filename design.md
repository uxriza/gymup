# GymUp Design System

## Visual Direction

GymUp should feel like a premium mobile fitness app with a dark, focused interface.
The reference style is useful for mood, but the product system should stay cleaner than the reference: fewer decorative gradients, clearer surfaces, and stronger readability.

Core mood:

- dark and immersive, not flat black
- premium and focused, not playful
- warm highlights for actions and progress
- WCAG-aware contrast for all text and controls

## Color Tokens

Base palette, implemented as HSL tokens:

- `background`: `220 18% 7%`, near-black charcoal
- `foreground`: `210 24% 96%`, primary text on dark backgrounds
- `card`: `220 16% 12%`, primary surface
- `secondary`: `220 14% 17%`, raised or nested surface
- `muted-foreground`: `215 15% 76%`, secondary text that still passes WCAG AA on dark surfaces
- `border`: `220 12% 26%`, visible but quiet separators
- `primary`: `42 94% 62%`, amber action color
- `primary-foreground`: `220 18% 8%`, text/icon color on amber

Usage:

- use amber only for primary actions, selected states, and key progress moments
- keep large surfaces flat and low-noise
- prefer borders and spacing over decorative gradients
- avoid placing small low-opacity text directly over photography

WCAG guidance:

- body text should target at least `4.5:1`
- large display text and icon labels should target at least `3:1`
- primary amber buttons must use dark foreground text
- secondary text should use `muted-foreground`, not arbitrary opacity like `text-white/50`

## Typography

Type system:

- display: condensed, assertive, athletic
- body: clean geometric sans

Rules:

- `page-title`: display, `2rem`, bold, uppercase, tight line height
- `page-description`: body, `0.875rem`, `1.5rem` line height
- `section-title`: body, `1rem`, semibold, `1.5rem` line height
- `section-description`: body, `0.875rem`, `1.5rem` line height
- `card-heading`: body, `1rem`, semibold
- `metric-value`: body, `1.5rem`, bold, tight line height
- `metric-label`: body, `0.75rem`, muted
- headings are short, bold, and compact
- supporting copy uses the shared description classes, not one-off sizes
- avoid long paragraph blocks inside cards
- numbers and stats should read quickly at a glance

## Shape Language

- primary radius: large and soft, roughly `16px` to `24px`
- buttons should feel pill-shaped or heavily rounded
- cards should avoid sharp corners
- icon holders should use rounded capsules or rounded squares

## Surfaces

Hero surfaces:

- layered background image
- dark overlay for text readability
- no extra colored glow unless it directly supports hierarchy

Standard cards:

- flat `card` surface
- clear `border`
- modest shadow only for elevation
- no gradient by default

Metric tiles:

- compact rectangular capsules
- flat `secondary` surface
- small accent icon or progress cue

## Component Guidance

Buttons:

- primary buttons use solid amber
- text stays dark for strong contrast
- default height should feel mobile-first and thumb friendly

Badges and chips:

- selected chips are amber
- inactive chips use dark tonal fill
- text is compact and medium weight

Dialogs:

- dark elevated panel
- quiet border
- rounded large enough to match card system

## Home Screen Application

For the home screen:

- hero area should feel like a featured workout card, not a plain banner
- greeting and date should be compact and stacked
- activity summary should use small dense tiles
- recent workout section should look like a curated content block
- calendar should read as a premium utility card with low-noise cells

## Do / Avoid

Do:

- keep spacing dense but breathable
- let action color lead the eye
- use flat surfaces for cards, metric tiles, and dialogs
- check contrast before introducing new muted text colors

Avoid:

- bright blue accents fighting the amber CTA
- square utility components
- high-contrast white borders
- repeated gradients on every surface
- arbitrary low-opacity text that may fail WCAG
