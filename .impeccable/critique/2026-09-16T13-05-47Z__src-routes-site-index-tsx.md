---
target: marketing website (AI slop)
total_score: 24
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 3
target_identity: "file:/Users/rejatharathi/Desktop/sept/cvatsfriendly/src/routes/_site/index.tsx"
target_fingerprint: "sha256:9990f38d55181528c8e742c28a587577fc4a0ef81de993ae459a3f2cebac6c63"
target_path: /Users/rejatharathi/Desktop/sept/cvatsfriendly/src/routes/_site/index.tsx
timestamp: 2026-09-16T13-05-47Z
slug: src-routes-site-index-tsx
closed: true
---
Method: dual-agent (A: design-review sub-agent · B: detector sub-agent)

# Critique — CV ATS Friendly marketing site (AI-slop focus)
Target: src/routes/_site/index.tsx (+ /pricing, /templates, /ats-resume-guide). Mode: Persuade.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active nav state; ~9k px mobile page with no orientation |
| 2 | Match System / Real World | 3 | "ATS" unglossed in H1; "RenderCV YAML" jargon in step 01 |
| 3 | User Control and Freedom | 3 | Hover-lift on non-clickable feature/template cards |
| 4 | Consistency and Standards | 2 | 7 signup labels; logo "CVATSFriendly"; "92" vs "18/21" |
| 5 | Error Prevention | 2 | Plan lists contradict plans.ts and actual gating |
| 6 | Recognition Rather Than Recall | 3 | "5 AI rewrites/day" needs credit costs only on /pricing |
| 7 | Flexibility and Efficiency | n/a | One-page Persuade surface |
| 8 | Aesthetic and Minimalist Design | 2 | Same claims 3–4x; decorative blob + eyebrow |
| 9 | Error Recovery | 3 | Little can fail; 404 recovers |
| 10 | Help and Documentation | 3 | FAQ + guide; billing/credit help only on /pricing |
| Total | | 24/36 | Acceptable (67%) |

## Design Specificity Verdict
Authored content inside a category-interchangeable shell. Tells: Tailwind emerald verbatim (styles.css:6-12), Inter + Plus Jakarta Sans (__root.tsx:50), Sparkles pill eyebrow (index.tsx:64), blur blob + gradient wash (index.tsx:60-61), one accent word "and" in H1, 6 icon-tile feature cards, 01/02/03 dark band, numberless stat strip, "Most popular" badge, FAQ accordion, gradient CTA slab, 4-col footer, py-20 on 7/9 sections, stock copy ("in seconds", "read perfectly", "Recruiter-approved"). Absent: testimonials, logo walls, fake counts, gradient text, glassmorphism.
Detector: CLI 1 finding (overused-font Inter, __root.tsx:50). Browser ~8 true: icon-tile-stack x6 (index.tsx:148), low-contrast btn-primary white on #059669 3.8:1 + Most popular badge + CTA subtext borderline, overused-font banners, skipped-heading /pricing (h1->h3, PricingCards.tsx:10), ai-color-palette (hue misread as cyan, conclusion aligned). False positives: all resume-paper thumbnail findings (justified-text, tight-leading, tiny-text, nested-cards), clipped-overflow on decorative blob, Helvetica banner on /templates.

## What's Working
1. Hero and carousel render real product output with selectable text (index.tsx:92).
2. Contrarian, domain-correct "Why fancy resume designs get filtered out" section.
3. Honest, specific copy; no fake social proof; FAQ admits user approves every AI change.

## Priority Issues
- [P1] Hero proof contradicts the trust promise: AI rewrite invents "18%" (index.tsx:108-109) beside "AI that never invents facts"; score "92" vs 18/21=86%; "Unlimited saved versions" vs cap 100 (plans.ts:12); keyword matching listed Pro-only but ungated (TailorModal.tsx:47). Fix: real metric in "before" or "[add metric]" prompt, relabel card, align PLAN_FEATURES, drop/support "Most popular"/"Recruiter-approved". Cmd: clarify, harden.
- [P1] Category-interchangeable visual system. Fix: paper/typesetting world — serif or theme Times/Helvetica display, hairline section rules, ink on off-white, one editorial accent; remove eyebrow, blob, icon tiles. Cmd: bolder, typeset, colorize.
- [P1] Thesis told not shown, repeated 4x (index.tsx:116-245). Fix: replace grid + steps with parse demo, keyword-highlight demo, readable red-pen rewrite. Cmd: distill, layout (overdrive).
- [P2] Mobile loses proof and CTA: proof cards hidden <640px, illegible resume, no CTA y≈563–6635 on 9044px page. Fix: inline rewrite, cropped preview, mid-page/sticky CTA, collapse features. Cmd: adapt.
- [P2] Primary buttons fail AA (3.77:1), strikethrough 2.63:1 at 12px, /pricing heading skip. Fix: brand-700 fills, darker strikethrough, h2 on /pricing. Cmd: audit, polish.

## Persona Red Flags
Jordan: ATS unglossed; RenderCV YAML; keyword matching free vs Pro; 7 signup labels; no data-privacy note on homepage.
Riley: invented 18%; 92≠18/21; unlimited vs 100; Most popular on new product; Recruiter-approved by whom; hover-lift non-links; tailoring costs 3 credits undisclosed.
Casey: proof cards hidden; illegible hero resume; ~7.5 screens with no CTA; menu button 36px tall; 28px FAQ rows; thin-scrollbar carousel.

## Minor Observations
- Carousel clips 5th card at 1280px, no arrows.
- Logo "CVATSFriendly" vs brand "CV ATS Friendly"; footer copyright uses domain.
- Homepage pricing omits credit costs and Stripe note.
- Default ::selection is a missed moment for the "if you can highlight it, an ATS can read it" proof.
- Identical section padding; no pacing change.

## Questions to Consider
- Why does a site selling well-set paper look like an AI chat startup?
- Could the homepage be the ATS check itself?
- Would you keep the rewrite demo if screenshotted beside "never invents facts"?
- If the pitch were one phone screen, which proof survives — and why is it hidden on mobile today?
