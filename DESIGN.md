---
name: CV ATS Friendly
description: Resumes built around how hiring software reads documents, shown as a job posting printed out and highlighted.
colors:
  desk: "#e6e8eb"
  desk-rule: "#cfd3d8"
  paper: "#ffffff"
  ink: "#141414"
  ink-soft: "#3d4046"
  mark: "#f6e53e"
  mark-tint: "#fef9c8"
  miss: "#f7a8c8"
  miss-ink: "#9b1c52"
  brand-50: "#fef9c8"
  brand-100: "#fbf1a0"
  brand-200: "#d9c84a"
  brand-500: "#2b2d31"
  brand-600: "#141414"
  brand-700: "#141414"
  brand-800: "#0a0a0a"
typography:
  display:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.2vw, 4.4rem)"
    fontWeight: 800
    lineHeight: 0.97
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.6vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  numeric:
    fontFamily: "Chivo Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  document:
    fontFamily: "Helvetica, Arial, Liberation Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "3px"
  swatch: "2px"
  lg: "4px"
  xl: "6px"
  2xl: "8px"
spacing:
  page-gutter: "16px"
  page-gutter-sm: "24px"
  sheet-pad: "24px"
  sheet-pad-sm: "36px"
  section-y: "80px"
  section-y-sm: "96px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-primary-hero:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "#000000"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-outline-hover:
    backgroundColor: "{colors.mark-tint}"
  button-ghost-hover:
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "{spacing.sheet-pad}"
  key-toggle-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    height: "36px"
  site-header:
    backgroundColor: "{colors.desk}"
    textColor: "{colors.ink}"
    height: "64px"
---

# Design System: CV ATS Friendly

## Overview

**Creative North Star: "The Highlighted Printout"**

The system is a job posting printed out and marked up against your resume, the ritual a job seeker already performs, done with exact keyed marks. Every surface is a cool PDF-viewer grey desk; content sits on white, letter-proportioned sheets with a hairline-plus-drop shadow; type is laser-black ink. The only colour in the world is highlighter, and highlighter always means something.

Density is document-like: ruled rows, hairline dividers, tabular figures for every count and price, and real document faces inside anything that represents a document. Sheets may sit a fraction of a degree off square on large screens, as paper on a desk does. Motion is the act of marking: swipes draw across matched words in reading order once, and digits roll to a computed value once. Under reduced motion the marks are already drawn and the digits are static.

The world rejects the generic SaaS shell it replaced: no gradients, blobs, pills, icon tiles, glassmorphism, or colour used for decoration.

**Key Characteristics:**
- Grey desk, white sheets, black ink; colour appears only as highlighter.
- Exactly two highlighter meanings: yellow found, pink missing (with a dotted underline).
- Chivo for the site voice, Chivo Mono only for figures and extracted text, Helvetica for documents.
- Black rectangular buttons with 3px paper corners.
- Swipes with ragged ends, drawn once in reading order; yellow text selection.

## Colors

A monochrome desk-and-ink palette with two highlighter inks that carry meaning, never mood.

### Primary
- **Laser Ink** (ink): all headings, primary buttons, active toggles, focus outlines, rules under sheet headers, and the footer top rule. The action colour of the system is black, not a hue.

### Secondary
- **Found Yellow** (mark): the highlighter swipe for "found / in your resume", keyword key swatches, the wordmark's "ATS" swipe, and `::selection`.
- **Missing Pink** (miss): the highlighter swipe for "missing, add only if true". Always paired with **Missing Ink** (miss-ink), a dotted 1.5px underline offset 0.24em, so the difference never depends on colour alone.

### Tertiary
- **Pale Yellow Tint** (mark-tint / brand-50, brand-100): a surface state, not a mark. Outline-button hover, selected and suggestion states in the app shell. The brand scale's light steps are this tint; brand-200 is its border.

### Neutral
- **PDF Desk Grey** (desk): the page background behind every sheet, header, and footer.
- **Desk Rule** (desk-rule): hairline section dividers and header/footer borders on the desk.
- **Paper White** (paper): sheets, inputs, cards.
- **Soft Ink** (ink-soft): body copy, captions, secondary labels on paper and desk.
- **Ink steps** (brand-500 to brand-800): the legacy brand scale's dark steps, remapped to ink so app-shell text, borders and fills resolve to black.

### Named Rules
**The Two Highlighters Rule.** There are exactly two highlighter meanings: yellow means found or in your resume, pink means missing and add only if true. Emphasis anywhere else uses weight or ink, never highlighter colour. The one exception is the hero headline and wordmark swipes, which use yellow.

**The Second Cue Rule.** A pink mark always carries its dotted miss-ink underline, and screen readers hear "(missing)" unless the words already say it.

**The Ink Is The Accent Rule.** Primary actions are black on white or white on black. No hue is introduced for buttons, links, or status.

## Typography

**Display Font:** Chivo (with ui-sans-serif, system-ui)
**Body Font:** Chivo (with ui-sans-serif, system-ui)
**Label/Mono Font:** Chivo Mono (with ui-monospace, Menlo), plus Helvetica/Arial for document content

**Character:** Chivo at extra-bold with tight tracking gives the site a blunt, printed-poster voice; Chivo Mono is the machine reading back; Helvetica inside sheets makes documents look like the documents candidates actually send.

### Hierarchy
- **Display** (800, clamp(2.5rem, 5.2vw, 4.4rem), 0.97, -0.035em): the hero H1 and the closing call, balanced text.
- **Headline** (800, clamp(2rem, 3.6vw, 3rem), 1.02, -0.03em): section H2s; auth and 404 titles use the same weight and tracking at fixed sizes.
- **Title** (700, 1.25rem): sheet headers, FAQ questions (1.125rem), definition terms.
- **Body** (400, 1.125rem, 1.625): section intros in soft ink; running text capped near 65ch; 15px inside sheets.
- **Label** (400 to 700, 13px): captions, figcaptions, key-toggle labels. Sentence case, no tracking.
- **Numeric** (Chivo Mono, tabular figures, -0.01em): every count, score, price, credit cost, and extracted-text listing.
- **Document** (Helvetica, 15px, 1.5): sample postings and rewrite examples, i.e. anything that stands in for a real document.

### Named Rules
**The Mono Means Machine Rule.** Chivo Mono appears only for figures and for text a parser extracted. Never for headings or prose.

**The Documents Stay Documents Rule.** Anything representing a posting or resume is set in the standard document face; resume templates themselves are governed by their own theme definitions, not by these tokens.

## Layout

A centred page container (max 72rem, 16px gutters, 24px from 640px) on a full-bleed desk. Sections are separated by a desk-rule hairline and padded 80px vertically (96px from 640px; the closing call runs taller). Desktop sections use asymmetric two-column grids: a narrow copy column (18 to 24rem) beside a wide sheet, or a heading row with an intro paragraph aligned to its baseline. The hero splits roughly 1.15 : 0.85 between copy and the posting sheet, with the tally slip overlapping the sheet's blank foot. Below 1024px everything stacks to one column; the hero orders CTA, then tally, then the full uncropped sheet. Sheets pad 24px, 36px from 640px, and divide internally with slate hairlines.

## Elevation & Depth

Depth is physical: a sheet of paper lying on a desk. The desk is flat; paper lifts off it with one soft two-layer shadow. There is no hover lift and no stacked elevation scale.

### Shadow Vocabulary
- **Sheet** (`box-shadow: 0 1px 2px rgb(20 20 20 / 0.08), 0 14px 36px -12px rgb(20 20 20 / 0.28)`): every sheet: postings, tally slip, pricing rate sheet, FAQ, auth form, editor spec list.
- **Card hairline** (`box-shadow: 0 1px 2px rgb(20 20 20 / 0.06)`): bordered cards in the app shell that sit on white rather than on the desk.
- **Resume paper** (`box-shadow: 0 1px 2px rgb(20 20 20 / 0.08), 0 12px 32px -10px rgb(20 20 20 / 0.24)`): rendered resume previews.

### Named Rules
**The Paper On A Desk Rule.** Only paper casts a shadow, and it casts the same one everywhere. Controls, toggles and buttons are flat.

## Shapes

Paper corners: nothing on a desk is pillowy. Buttons, inputs, and key toggles use 3px; swatches 2px; the radius scale tops out at 8px, and sheets themselves are square. On large screens a sheet may rotate slightly (0.7deg for the posting, -1.4deg for the overlapping tally) to read as loose paper; it straightens on small screens. The highlighter swipe is the one organic shape: an irregular band with ragged ends, stretched to 78% of line height behind the words and cloned across line breaks.

## Components

### Buttons
Blunt, black, rectangular.
- **Shape:** paper corner (3px).
- **Primary:** ink fill, white bold 14px text, 8px 16px; hero and closing CTAs grow to 14px 24px at 16px with a trailing arrow.
- **Hover / Focus:** fill deepens to pure black; pressing nudges down 1px; focus is a 2px ink outline offset 2px.
- **Outline:** white fill, 1px ink border at 80%, pale yellow tint on hover. Used for the secondary plan action and mobile Log in.
- **Ghost:** soft slate text, 6% ink wash on hover.
- **Text link:** bold ink with a 30% ink underline offset 4px, full ink on hover.

### Sheets
- **Corner Style:** square.
- **Background:** paper white on the desk.
- **Shadow Strategy:** Sheet shadow (see Elevation).
- **Border:** none; headers rule off with a 1px ink or slate line.
- **Internal Padding:** 24px, 36px from 640px.

### Inputs / Fields
- **Style:** white, 1px slate-300 border, 3px corners, 8px 12px, 14px text.
- **Focus:** border turns ink, 2px Found Yellow ring.
- **Labels:** 12px medium soft slate, sentence case.

### Navigation
Sticky 64px desk-grey header with a desk-rule bottom hairline: wordmark left (sheet glyph plus "CV ATS Friendly" with "ATS" swiped yellow), text links, then a primary button. Mobile collapses to a 44px menu button opening full-width rows with 48px targets and stacked primary/outline actions. Footer sits on the desk under a 1px ink rule.

### Highlighter Swipe (signature)
An inline mark behind words in one of two kinds. Found is yellow; missing is pink with a dotted underline and a screen-reader suffix. In demonstrations it draws left to right (520ms, cubic-bezier(0.16, 1, 0.3, 1)), staggered 38ms per mark in reading order. When a key isolates one kind, the other kind dims to 18% opacity.

### Tally Slip and Key Toggles (signature)
A small sheet showing matched/total and percent in rolling mono digits, with a two-colour key. Each key row is a toggle (36px min height, 3px corners): swatch, label, count; pressed state is ink fill with white text.

### Rolling Number
Tabular digits where each place is a 0 to 9 strip that settles on its value once (1100ms, same easing, 60ms stagger per place), with the true value exposed to assistive tech.

## Do's and Don'ts

### Do:
- **Do** put content on white sheets with the single sheet shadow over the desk grey.
- **Do** use Found Yellow only for found / in-your-resume marks, plus the hero headline and wordmark swipes.
- **Do** give every Missing Pink mark its dotted miss-ink underline.
- **Do** set every count, score, price and credit cost in Chivo Mono with tabular figures.
- **Do** set sample postings and rewrite examples in the document face, labelled as samples.
- **Do** make primary actions ink-black rectangles with 3px corners.
- **Do** draw swipes and roll digits once, and show them finished under reduced motion.

### Don't:
- **Don't** use highlighter colour for emphasis; use weight or ink.
- **Don't** introduce a third highlighter colour or any accent hue for buttons, links, or status.
- **Don't** use gradients, blobs, pills, or icon tiles.
- **Don't** round corners past 8px, or add hover lift or extra shadow levels.
- **Don't** set headings or prose in Chivo Mono.
