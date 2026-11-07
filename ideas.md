# Manus AI Companion — Design Directions

## Three candidate approaches

### 1. The Cognitive Observatory
**Very Brief Intro:** An editorial, research-instrument aesthetic that makes advanced AI feel measured, legible, and quietly powerful. It balances data-like precision with warm, human curiosity.

**Probability:** 0.06

### 2. The Signal Cabinet
**Very Brief Intro:** A warm, archival-inspired product experience shaped by index cards, annotated margins, and the feeling of a carefully maintained knowledge system. It treats AI as a trusted working library rather than a spectacle.

**Probability:** 0.03

### 3. The Lucid Workshop
**Very Brief Intro:** A bright, creative studio with tactile translucency and experimental visual energy, positioning AI as a collaborative space for making and testing ideas.

**Probability:** 0.08

---

## Chosen approach: The Cognitive Observatory

### Design Movement
Contemporary **editorial information design** with influences from scientific field notes, Swiss typographic systems, and quiet-luxury software interfaces. The visual language translates the product's emphasis on reasoning, memory, and trustworthy infrastructure into a tangible research instrument.

### Core Principles
1. **Intelligence should be inspectable:** Numbers, labels, evidence trails, and concise explanations give the product a sense of accountable capability.
2. **Warmth counterbalances complexity:** Soft mineral backgrounds and restrained brass accents prevent the AI platform from feeling cold or purely technical.
3. **Asymmetry creates direction:** The site moves through staggered content shelves, vertical rails, and offset panels rather than generic centered cards.
4. **One clear signal at a time:** Bold display moments are paired with calm supporting detail and generous breathing room.

### Color Philosophy
The foundation is **ink-black** and charcoal—an environment for focus rather than a familiar “dark tech” trope. Weathered paper and fog grey introduce an editorial materiality, while **signal lime** is reserved for live status, key actions, and the brand mark. It represents verified insight breaking through a dense field of information. A muted ultraviolet appears only as a secondary data tint, never as a gradient-led visual identity.

### Layout Paradigm
The landing page is organized as an **observatory logbook**: a fixed-feeling vertical measure rail at the left, full-bleed chapter transitions, and offset content blocks that alternate their point of gravity. The hero is a dark stage with a real product conversation panel leaning into the right margin, while the text starts from a low, grounded baseline. Sections use oversized chapter markers and long horizontal rules in place of conventional centered grid stacks.

### Signature Elements
1. **Signal orb:** A lime, concentric-ring symbol used as the logo, live-status marker, and visual anchor in the hero.
2. **Measurement rail:** Fine numbered rails, coordinate labels, and hairline rules that make scrolling feel like moving through a research instrument.
3. **Evidence chips:** Small monospaced labels such as “RAG / VERIFIED,” “< 1S,” and “SOC 2 READY” that punctuate the story with proof rather than decoration.

### Interaction Philosophy
Controls should feel like calibrated equipment: sharp feedback, clear state changes, and no ornamental surprise. Navigation links underline with a measured horizontal draw; cards slightly lift and sharpen their border tone; the interactive chat sample returns a concise response after the visitor chooses a suggested prompt. Actions must always feel purposeful and reversible.

### Animation
Use only opacity and transform-based movement. Hero components arrive in a 40–70ms stagger, starting from a modest 12px vertical offset. The signal orb performs a slow, almost imperceptible pulse (4s) and data lines drift at a low amplitude to create a live-instrument effect. Interactive UI transitions use a crisp cubic-bezier ease-out and complete within 180ms. Disable nonessential movement under `prefers-reduced-motion`.

### Typography System
**Space Grotesk** provides the confident, mechanical display voice for headlines, large numerals, and navigation. **DM Sans** handles readable body copy. **IBM Plex Mono** is reserved for labels, coordinate ticks, and system states. Headline line-height is tight (0.92–1.0); editorial copy uses a comfortable 1.55–1.65 line-height. Monospace labels are uppercase, tracked, and visually quiet.

### Brand Essence
**Manus AI Companion is the evidence-first AI workspace for teams that need answers they can act on, not just outputs they can skim.**

**Personality:** considered, capable, candid.

### Brand Voice
Headlines are declarative, grounded, and specific. CTAs invite a concrete next action, while microcopy explains the operational value without hype.

> “Your next answer should know what came before.”

> “Bring context. Leave with a decision.”

### Wordmark & Logo
The wordmark pairs an engineered grotesk word shape with a **nested open-circle signal mark**: three slightly irregular concentric arcs with a deliberate north-east break, representing an answer becoming actionable. The mark appears without text in the favicon and at a substantial size in the navigation.

### Signature Brand Color
**Observatory Lime — #C7F36B**. This is used sparingly and consistently for the live signal, primary actions, and the logo mark.

## Style Decisions

- **Observatory Lime #C7F36B is a signal color, not a background color:** it may dominate only the logo/orb moment or a single calibrated conversion field, while most page surfaces remain ink, charcoal, fog, or paper.
- **Headlines use Space Grotesk as the primary display voice:** italic or serif-style emphasis appears only as a rare editorial accent, never as the dominant headline system.
- **Every major section includes an observatory-system cue:** a coordinate label, measurement rail, evidence chip, chapter marker, or hairline rule keeps the page feeling like a research instrument.
