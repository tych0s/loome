# DESIGN.md — Loome Product Design System

**Project:** Loome
**Status:** v1 — Product UI direction, design rules and frontend implementation guide
**Owner:** Loome maintainers
**Last updated:** July 2026

---

## 1. Purpose

This document defines the visual direction, UX rules, product surfaces, layout system, component patterns and design security rules for Loome.

Loome is an open source autonomous community game platform where the community proposes, debates and votes on what the game becomes next, while an AI implementation agent builds the winning proposal live. The interface must make the process visible, trustworthy and exciting.

The design goal is not to look like a generic SaaS dashboard. Loome must feel like a live command center for a game that is being created in public.

---

## 2. Design North Star

> A game built live by the community.

The user should immediately understand four things:

1. **Play** — there is always a current playable game version.
2. **Vote** — the community decides what happens next.
3. **Watch** — AI implementation happens live and visibly.
4. **Trust** — every build, version, vote and rollback is transparent.

Loome’s interface should communicate autonomy, transparency, safety and community energy.

---

## 3. Product Personality

Loome should feel:

- Futuristic, but not cold.
- Technical, but understandable.
- Game-like, but not childish.
- Open source, but premium.
- Transparent, but not chaotic.
- Autonomous, but controlled.

### Keywords

```txt
live
open source
autonomous
community-built
versioned
playable forever
transparent
secure
AI-assisted
```

### What Loome is not

Loome must not look like:

- A generic AI SaaS landing page.
- A crypto/NFT dashboard.
- A childish game launcher.
- A dark-mode admin template with purple buttons.
- A fake “AI magic” product with no traceability.
- A terminal-only developer toy.

---

## 4. Visual Direction

The visual system is dark, high-contrast and neon-accented, with a strong focus on modular panels, realtime status, pixel-art game previews and visible implementation progress.

### Core Visual Traits

```txt
near-black backgrounds
purple neon accents
soft glass-like panels
thin borders
subtle glow
terminal surfaces
pixel-art game imagery
version cards
live status indicators
compact data density
clear hierarchy
```

### Primary UI Mood

Loome should feel like a mix of:

- A live game launcher.
- A developer build dashboard.
- A community voting platform.
- An open source project control room.

---

## 5. Brand Elements

### 5.1 Name

The product name is:

```txt
Loome
```

The preferred UI wordmark is uppercase in navigation contexts:

```txt
LOOME
```

Marketing copy may use sentence case:

```txt
Loome
```

### 5.2 Logo Direction

The Loome wordmark should use a clean geometric style with the double “oo” treated as an infinity/community loop when possible.

Logo rules:

- Keep the logo simple and legible at small sizes.
- Use the loop mark as an icon where space is limited.
- Avoid overly playful mascot-style branding.
- Avoid complex 3D logos.
- Avoid gradients that harm readability.

### 5.3 Tagline

Primary tagline:

```txt
A game built live by the community.
```

Secondary lines:

```txt
Propose. Debate. Vote. Watch AI build. Play forever.
Open source. Auto-versioned. Community-governed.
Every version remains playable forever.
```

---

## 6. Color System

Loome is dark-first. Light mode is not required for MVP.

### 6.1 Core Palette

```css
:root {
  --loome-bg: #05060a;
  --loome-bg-soft: #080a10;
  --loome-surface: #0d1018;
  --loome-surface-raised: #121624;
  --loome-surface-glass: rgba(18, 22, 36, 0.72);

  --loome-border: #252a3a;
  --loome-border-soft: #1a1f2e;
  --loome-border-strong: #6d35ff;

  --loome-text: #f7f3ff;
  --loome-text-soft: #c9c1d9;
  --loome-text-muted: #8e879d;
  --loome-text-disabled: #5f596d;

  --loome-purple: #8b5cf6;
  --loome-purple-strong: #7c3aed;
  --loome-purple-glow: #a855f7;
  --loome-purple-soft: rgba(139, 92, 246, 0.18);

  --loome-cyan: #22d3ee;
  --loome-green: #22c55e;
  --loome-yellow: #facc15;
  --loome-orange: #fb923c;
  --loome-red: #ef4444;
  --loome-blue: #60a5fa;
}
```

### 6.2 Semantic Colors

```css
:root {
  --status-live: var(--loome-purple);
  --status-success: var(--loome-green);
  --status-warning: var(--loome-yellow);
  --status-danger: var(--loome-red);
  --status-info: var(--loome-cyan);
  --status-neutral: var(--loome-text-muted);
}
```

### 6.3 Usage Rules

- Purple is the primary brand and action color.
- Green is only for success, online and passing checks.
- Red is only for destructive actions, failed builds and critical warnings.
- Yellow/orange is only for warnings, pending states and cost alerts.
- Cyan is for informational realtime events.
- Do not rely on color alone. Always pair status colors with labels or icons.
- Avoid large saturated backgrounds. Use glow and borders instead.

---

## 7. Typography

### 7.1 Recommended Fonts

```txt
Primary UI: Geist Sans, Inter or system sans-serif
Code / terminal: Geist Mono, JetBrains Mono or system monospace
Logo: custom geometric wordmark
```

Fonts should be self-hosted if used in production to avoid external font dependencies in strict CSP contexts.

### 7.2 Type Scale

```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 32px;
--text-4xl: 44px;
--text-5xl: 56px;
```

### 7.3 Typography Rules

- Use short, direct headings.
- Use numeric data prominently.
- Use monospace only for code, commits, versions, logs and hashes.
- Do not overuse uppercase. Reserve uppercase for labels, badges and small metadata.
- Keep body copy readable and calm.
- Terminal text must be readable at small sizes.

---

## 8. Layout System

### 8.1 Desktop Shell

Primary desktop layout:

```txt
┌──────────────────────────────────────────────────────────────┐
│ Sidebar │ Top Context Bar                                    │
│         ├───────────────────────────────┬───────────────────┤
│         │ Main Content Grid             │ Right Context Rail │
│         │                               │                   │
│         ├───────────────────────────────┴───────────────────┤
│         │ Version Archive / Stats Footer                     │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Desktop Dimensions

```txt
App max width: 1680px
Sidebar width: 220–248px
Top bar height: 64px
Right rail width: 340–380px
Grid gap: 16px / 20px
Card radius: 16px
Inner radius: 12px
Page padding: 16px / 24px
```

### 8.3 Main Dashboard Grid

The public live page should prioritize:

1. Current cycle state.
2. Current playable game.
3. Current vote.
4. AI implementation status.
5. Live events.
6. Version archive.
7. Open source / trust signals.

Recommended desktop structure:

```txt
Top:    cycle status + search + notifications + user menu
Hero:   message + game visual / current cycle theme
Main:   voting panel + AI implementer panel
Rail:   play current version + live events
Bottom: archived versions + platform stats
```

---

## 9. Responsive Behavior

### 9.1 Breakpoints

```txt
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### 9.2 Tablet

At tablet sizes:

- Collapse right rail below main content or into tabs.
- Keep voting and game preview visible above implementation logs.
- Use a compact sidebar or top navigation.
- Preserve access to Play, Vote, Live and Archive.

### 9.3 Mobile

At mobile sizes:

- Replace sidebar with bottom navigation.
- Stack all panels vertically.
- Use tabs for Vote / Live / Play / Events.
- Keep the primary CTA sticky when voting or playing.
- Terminal logs should be collapsible by default.
- Avoid dense three-column layouts.

Mobile bottom navigation:

```txt
Live | Play | Vote | Archive | Menu
```

### 9.4 Mobile Priority

The mobile experience must answer:

1. What is happening now?
2. Can I vote?
3. Can I play?
4. What did the AI just change?

---

## 10. Core Public Pages

### 10.1 Home / Live

This is the main product surface.

Purpose:

- Explain Loome instantly.
- Show the current cycle.
- Show live AI implementation when active.
- Let users play the current version.
- Let users vote when voting is open.
- Show that the project is open source and versioned.

Required modules:

```txt
hero statement
current cycle chip
online humans / NPCs
current vote card
AI implementer card
play current version card
live events feed
version archive strip
open source trust card
platform status card
```

### 10.2 Play

Purpose:

- Let users play the current game version.
- Show SDK-backed player identity and version.
- Display minimal game metadata.

Required modules:

```txt
game iframe
current version badge
fullscreen control
changelog summary
leaderboard preview
report issue button
version switcher
```

### 10.3 Votes

Purpose:

- Show active proposals and voting history.
- Explain vote weight and NPC influence.

Required modules:

```txt
active proposals
vote progress bars
proposal details
scope estimate
risk flag
NPC influence note
rollback option
previous votes
```

### 10.4 Archive

Purpose:

- Make every game version playable forever.

Required modules:

```txt
version cards
git tag
cycle number
proposal origin
changelog
play button
restore status if admin
build status
```

### 10.5 Leaderboard

Purpose:

- Show community and NPC performance.

Required modules:

```txt
current leaderboard
version filter
human / NPC badge
score details
latest submitted score
```

### 10.6 Agents / NPCs

Purpose:

- Make AI NPCs visible, transparent and entertaining.

Required modules:

```txt
NPC list
AI badge
personality summary
activity status
vote tendency
recent messages
created date
```

NPCs must never be visually presented as humans.

### 10.7 Docs

Purpose:

- Explain how Loome works.
- Support contributors and open source trust.

Required modules:

```txt
getting started
architecture
Game SDK
security model
agent sandbox
versioning
contributing
```

### 10.8 Changelog

Purpose:

- Show product and game evolution with traceability.

Required modules:

```txt
release list
version tags
cycle links
proposal links
commit hash
AI summary
rollback markers
security notes
```

### 10.9 About

Purpose:

- Explain Loome’s philosophy and open source model.

Required modules:

```txt
mission
how it works
open source statement
security statement
community rules
GitHub link
```

---

## 11. Admin Product Design

The admin panel should share the same design language but be more utilitarian and less theatrical.

Admin design tone:

```txt
calm
precise
auditable
safe
fast to operate
```

### 11.1 Admin Dashboard

Required cards:

```txt
current cycle
phase countdown
humans active
NPCs active
latest game version
worker health
cost today
security alerts
failed jobs
```

### 11.2 NPC Agents

Required UI:

```txt
agent table
avatar
name
archetype
status
messages/day
cost/day
vote weight
frequency slider
pause / resume
regenerate personality
JSON editor
next tick preview
```

### 11.3 Cycle Control

Required UI:

```txt
cycle timeline
phase countdown
force transition
extend phase
abort cycle
proposal candidates
veto action
vote weight settings
chaos cycle settings
```

### 11.4 Implementer

Required UI:

```txt
current run status
raw log stream
plan / code / test / build / deploy steps
diff summary
kill switch
rollback action
rerun candidate
run history
cost and token usage
```

### 11.5 Logs & Observability

Required UI:

```txt
worker filter
level filter
time range
search
structured log details
error link to Sentry
product event link to PostHog
```

### 11.6 Costs

Required UI:

```txt
daily spend
category breakdown
NPC cost
synthesizer cost
implementer cost
budget limits
auto-pause status
alerts
```

### 11.7 Moderation

Required UI:

```txt
chat moderation queue
message delete
mute
ban
shadowban
report queue
user activity
appeal notes
```

### 11.8 Versions

Required UI:

```txt
version table
git tag
commit SHA
cycle
proposal
build status
play button
restore as current
rollback lineage
```

### 11.9 Audit Log

Required UI:

```txt
admin actor
action
target
timestamp
metadata
filter by risk level
export option
```

---

## 12. Component System

### 12.1 App Shell

The app shell contains:

```txt
sidebar
top context bar
main content area
right context rail
status footer where needed
```

Rules:

- Sidebar is persistent on desktop.
- Mobile uses bottom navigation.
- Current cycle status must always be easy to find.
- Current playable version must always be one click away.

### 12.2 Cards

Cards are the main layout primitive.

Card variants:

```txt
default
raised
interactive
live
warning
danger
success
terminal
game-preview
version
```

Card rules:

- Use subtle borders.
- Use glow only for live or selected states.
- Avoid heavy drop shadows.
- Maintain consistent padding.
- Card headers should include label, title and optional status badge.

### 12.3 Buttons

Button variants:

```txt
primary
secondary
ghost
danger
success
terminal
open-source
```

Button rules:

- Primary action uses purple.
- Destructive actions use red and require confirmation.
- External links should include an external-link icon.
- Disabled buttons must explain why when appropriate.

### 12.4 Status Badges

Status badge labels:

```txt
LIVE
VOTING
IMPLEMENTING
BUILDING
DEPLOYED
FAILED
ROLLED BACK
OPEN SOURCE
AI
NPC
HUMAN
CURRENT
ARCHIVED
```

Rules:

- Status badges must be textual, not color-only.
- `LIVE` may pulse subtly.
- `FAILED` and `ROLLED BACK` must be visually distinct.
- AI/NPC badges must be visible wherever identity matters.

### 12.5 Proposal Cards

Proposal cards must show:

```txt
title
description
vote count
percentage
progress bar
scope estimate
risk flag if any
proposal source
```

Required fixed proposal:

```txt
Revert last change
```

This option must be shown in every vote.

### 12.6 AI Implementer Card

The implementer card is one of Loome’s signature components.

It must show:

```txt
current proposal
implementation phase
step progress
terminal preview
latest command/result
commit hash
files changed
test status
build status
deploy status
```

Implementation phases:

```txt
Plan → Code → Tests → Build → Deploy → Archive
```

### 12.7 Terminal Panel

Terminal rules:

- Use monospace font.
- Show timestamps only when useful.
- Use syntax coloring carefully.
- Provide auto-scroll toggle.
- Provide copy button in admin only.
- Public terminal must be sanitized.
- Secrets must never be displayed.

### 12.8 Game Preview Card

Game preview card must show:

```txt
current version
actual game screenshot or live iframe preview
play button
archive link
fullscreen option
```

Marketing images may be concept art, but product UI must clearly distinguish between:

```txt
actual playable version
concept preview
archived version
```

### 12.9 Version Cards

Version cards must show:

```txt
version tag
cycle number
relative date
thumbnail
current / archived badge
play button
changelog link
```

Rules:

- Every version card must link to a playable immutable URL.
- The current version must be clearly labeled.
- Failed builds may appear in admin, but public archive should prioritize playable versions.

### 12.10 Live Event Feed

Event feed items should include:

```txt
icon
time
title
short description
source
```

Event types:

```txt
vote opened
vote closed
proposal added
NPC joined
commit pushed
build started
tests passed
deploy completed
rollback triggered
security event
```

### 12.11 Open Source Card

The open source card should include:

```txt
GitHub link
license
stars if available
security policy link
contributing link
status badge
```

Tone should be transparent, not promotional.

---

## 13. Game Art Direction

Loome’s platform UI may use pixel-art game imagery to create an emotional bridge between the dashboard and the game.

### 13.1 Preferred Game Visual Style

```txt
moody pixel art
fantasy / sci-fi compatible
cinematic lighting
small player character
dynamic weather
modular environments
gameplay-readable composition
```

### 13.2 Rules for Game Imagery

- Real product screenshots must come from actual playable builds.
- Concept art must be labeled as concept art.
- Do not misrepresent AI-generated mockups as shipped gameplay.
- Avoid overly detailed images that conflict with the actual game.
- Keep thumbnails visually consistent across archived versions.

### 13.3 Version Thumbnails

Every deployed game version should generate or store a thumbnail.

Thumbnail requirements:

```txt
16:9 aspect ratio
shows gameplay area
includes no private user data
uses actual version where possible
fallback placeholder allowed
```

---

## 14. Icons and Illustration

Recommended icon system:

```txt
Lucide icons for UI
custom loop icon for Loome brand
pixel icons for proposals and game-specific elements
```

Icon rules:

- Use outlined icons for navigation.
- Use filled/glowing icons sparingly for selected or live states.
- Keep icon sizes consistent.
- Avoid mixing too many icon styles in the same panel.

Recommended sizes:

```txt
Navigation: 20px
Badges: 14–16px
Cards: 20–24px
Hero icons: 32–48px
```

---

## 15. Motion and Realtime Behavior

Motion should make the product feel alive without becoming distracting.

### 15.1 Allowed Motion

```txt
subtle live pulse
progress bar animation
terminal line streaming
soft hover lift
card glow on active state
countdown transitions
new event slide-in
```

### 15.2 Disallowed Motion

```txt
constant background animation
aggressive neon flicker
large parallax effects
slow decorative loaders
animations that block interaction
```

### 15.3 Accessibility

Respect:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 16. Accessibility Rules

Loome must be usable by keyboard, screen readers and users with reduced motion needs.

Required rules:

```txt
WCAG AA contrast minimum
visible focus states
keyboard navigation for all controls
semantic HTML
ARIA labels where needed
no color-only status meaning
reduced motion support
readable terminal text
pauseable live updates where needed
forms with labels and validation messages
```

### 16.1 Focus Style

```css
:focus-visible {
  outline: 2px solid var(--loome-purple-glow);
  outline-offset: 2px;
}
```

### 16.2 Live Regions

Realtime updates should use ARIA live regions carefully.

Rules:

- Critical failures may use assertive announcements.
- Normal log streaming should not spam screen readers.
- Users must be able to pause auto-scroll.

---

## 17. UX Writing

Loome copy should be direct, transparent and human.

### 17.1 Voice

```txt
clear
confident
transparent
slightly playful
never fake
never overhyped
```

### 17.2 Preferred Phrases

```txt
Voting is open
AI is implementing the winning proposal
Build failed. Rolled back safely.
Every version remains playable
This NPC is AI-generated
View the implementation live
Open source on GitHub
```

### 17.3 Avoid

```txt
Magic
Revolutionary
Fully autonomous with no limits
Unbreakable
Human-like NPC
Secret AI process
```

Loome should never imply that AI has uncontrolled production authority.

---

## 18. Trust, Safety and Security UX

Security is part of the product experience. The UI must show that Loome is open, controlled and reversible.

### 18.1 Public Trust Signals

Required public trust signals:

```txt
Open Source badge
GitHub link
current version tag
archive link
build status
rollback history
AI/NPC identity badges
security model documentation link
platform status
```

### 18.2 Public Log Safety

Public implementation logs must be sanitized.

Never show publicly:

```txt
secrets
tokens
full environment variables
private admin notes
moderation reports
raw user personal data
provider API keys
infrastructure credentials
```

### 18.3 Admin Safety Patterns

Critical admin actions require strong confirmation.

Critical actions:

```txt
kill implementation run
rollback current version
restore archived version as current
ban user
delete NPC
change budget limits
disable security checks
force cycle transition
abort cycle
```

Required confirmation patterns:

```txt
clear consequence copy
confirmation modal
typed confirmation for destructive actions
optional cooldown / hold-to-confirm for production actions
audit log entry after action
```

### 18.4 Identity Safety

Rules:

- NPCs must always show an `AI` or `NPC` badge.
- Humans must never be visually confused with NPCs.
- System messages must be visually distinct from user messages.
- Admin actions in public logs should be attributed as system events unless identity disclosure is intentional.

### 18.5 Error Transparency

Failures should be understandable.

Good:

```txt
Build failed during smoke test. The previous version remains live.
```

Bad:

```txt
Something went wrong.
```

---

## 19. Data Visualization

Loome uses compact data visualizations for votes, costs, version history and platform health.

### 19.1 Vote Bars

Vote bars must show:

```txt
proposal title
vote count
percentage
weighted vote note when applicable
NPC influence note
```

### 19.2 Cost Charts

Admin cost charts must show:

```txt
daily total
NPC cost
synthesizer cost
implementer cost
budget threshold
auto-pause state
```

### 19.3 Worker Health

Worker health states:

```txt
healthy
delayed
failing
paused
offline
```

Use status labels and timestamps.

---

## 20. Design Tokens

### 20.1 Spacing

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### 20.2 Radius

```css
--radius-xs: 6px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 999px;
```

### 20.3 Shadows and Glow

```css
--shadow-card: 0 12px 40px rgba(0, 0, 0, 0.28);
--shadow-glow-purple: 0 0 32px rgba(139, 92, 246, 0.28);
--shadow-glow-green: 0 0 24px rgba(34, 197, 94, 0.22);
--shadow-glow-red: 0 0 24px rgba(239, 68, 68, 0.22);
```

Rules:

- Glow is a state indicator, not decoration everywhere.
- Default cards should use borders more than shadows.
- Active and live states may use purple glow.

---

## 21. Tailwind / shadcn Implementation Notes

Loome should use shadcn/ui as the base component layer, customized through tokens rather than one-off styling.

### 21.1 Recommended Component Mapping

```txt
Button          → shadcn Button with Loome variants
Card            → shadcn Card with surface variants
Dialog          → confirmation and detail modals
Sheet           → mobile nav and side details
Tabs            → mobile Live / Vote / Play sections
Badge           → status and identity labels
Progress        → vote bars and build steps
ScrollArea      → terminal and event feed
DropdownMenu    → user menu and card actions
Table           → admin data tables
Tooltip         → metadata explanations
Alert           → warnings and critical states
```

### 21.2 Variant Strategy

Use class variance authority or equivalent for repeatable variants:

```txt
buttonVariants
cardVariants
badgeVariants
statusVariants
terminalLineVariants
```

Avoid scattered arbitrary Tailwind values for core styles.

### 21.3 CSS Variable Strategy

All colors, radius, shadows and major spacing values must come from tokens.

Do not hard-code brand colors repeatedly inside components.

---

## 22. Navigation

### 22.1 Public Navigation

Primary items:

```txt
Live
Play
Votes
Archive
Leaderboard
Agents (NPCs)
Docs
Changelog
About
```

Secondary items:

```txt
GitHub
Discord
Platform Status
Security
```

### 22.2 Admin Navigation

Primary items:

```txt
Dashboard
NPC Agents
Cycle
Implementer
Logs
Costs
Moderation
Versions
Audit Log
Security
Settings
```

### 22.3 Navigation Rules

- Current page must be visually obvious.
- Current cycle and version should remain visible in the top context bar.
- Public and admin navigation must not be visually identical; admin needs stronger risk/status hierarchy.

---

## 23. Empty, Loading and Error States

### 23.1 Empty States

Empty states should explain what happens next.

Examples:

```txt
No vote is open yet. The next synthesis phase will create proposals from the discussion.
No archived versions yet. The first successful deploy will appear here.
No NPCs are active. Create an agent to start the pre-season discussion.
```

### 23.2 Loading States

Use skeletons for cards and lists.

Rules:

- Avoid full-page spinners.
- Keep known layout stable while loading.
- For realtime data, show last known state when safe.

### 23.3 Error States

Error states must include:

```txt
what failed
what remains safe
what the user can do
whether rollback happened
```

Example:

```txt
The latest build failed smoke tests. The previous playable version is still live.
```

---

## 24. Design QA Checklist

Before shipping any UI change, verify:

```txt
The current cycle is understandable.
The current game version is visible.
Voting state is clear.
NPCs are labeled as AI.
Live implementation state is clear.
Failures explain rollback/safety.
No public logs expose secrets.
No admin destructive action is one-click.
Keyboard navigation works.
Focus states are visible.
Contrast passes WCAG AA.
Mobile layout is usable.
Version archive remains accessible.
Open source trust signals are visible.
```

---

## 25. MVP Design Scope

The first production design pass should include:

```txt
public app shell
home/live page
vote card system
AI implementer card
play current version card
live events feed
archive strip
open source card
platform status card
admin dashboard
admin implementer page
admin NPC page
admin versions page
```

Do not overbuild marketing pages before the live product surface works.

---

## 26. Future Design Extensions

Possible future additions:

```txt
light mode
custom community themes per game era
shareable cycle recap cards
OBS-friendly live overlay
public build timeline
advanced version diff viewer
NPC profile pages
community achievement system
mobile game launcher mode
```

These should not weaken the core system: play, vote, watch, archive.

---

## 27. Final Design Principle

Loome’s design must always make the system legible.

The user should never wonder:

```txt
Who decided this?
What is being built?
Is this AI or human?
Is the game playable?
Which version am I seeing?
Did the build pass?
Can this be reverted?
Where is the source code?
```

If the interface answers those questions clearly, the design is doing its job.
