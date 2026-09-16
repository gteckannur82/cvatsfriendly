---
version: 1
slug: "src-routes-site-index-tsx"
primary_target: "src/routes/_site/index.tsx"
related_targets: ["src/routes/_site/pricing.tsx","src/routes/_site/templates.tsx","src/styles.css"]
---

# Surface brief: marketing homepage

## Scope and mode
Homepage `src/routes/_site/index.tsx`, visitor mode **Persuade**. The same world carries to the other marketing pages (pricing, templates, guide, auth) and to the app shell via shared tokens in `src/styles.css` (user decision: site + app shell).

## Audience, action, proof, constraints
- Audience: active job seekers who have applied widely and heard little back; sceptical of AI hype.
- Action: Build my resume (signup). Secondary: See templates.
- Lead proof (user decision): keyword match — a sample job posting marked against the sample resume by the real `keywordMatch()`.
- Supporting proof: what an ATS extracts (clearly labelled illustration), fact-keeping AI rewrites (labelled examples), five templates at readable size, plain pricing derived from `PLAN_LIMITS`.
- Constraints: pre-launch, no social proof; every demo labelled as a sample; tone pinned by the user as "precise instrument" (plain, technical, exact; not a startup).

## Direction contract
THESIS: The homepage is the job posting printed out and highlighted against your resume, the job seeker's own ritual done with keyed, exact marks. It refuses the SaaS hero with icon-card grid, stat strip and gradient CTA slab.

OWN-WORLD: A cool PDF-viewer grey desk with white letter-proportioned sheets and hairline shadows; laser-black ink; exactly two highlighter roles, yellow for "in your resume" and pink for "missing, add only if true", swiped with ragged ends behind words; Chivo for the site voice, Chivo Mono only for counts, credits and extracted text; documents themselves in standard fonts; black rectangular buttons; yellow text selection. No gradients, blobs, pills, or icon tiles.

STORY: The visitor sees which words of a real-looking posting the sample resume already has and which are missing, understands that the product reads documents the way an ATS does and never invents facts, and clicks Build my resume.

FIRST VIEWPORT: Desktop 1280×800: left half holds the H1 at poster scale with "past the ATS" swiped yellow, one-sentence subhead, black Build my resume button with a See templates link, a mono reassurance line. Right half: a slightly tilted Sample job posting sheet with live keyword swipes; a paper tally slip overlapping the blank foot of the sheet reads the real matcher result "23/26 · 88%" with the two-colour key as toggles. Phones: CTA first, then the tally, then the full posting sheet (kept uncropped so every mark the tally counts stays visible).

FORM: Highlighted Printout, position 1 of my ordered list of 7 (offered as the pick card; chosen by the user over the rolled Marked Proof). Seed key c33683da. Signature interaction: swipes draw across the matched words in reading order once, the tally digits roll to the computed value, and the key swatches are toggles that isolate found or missing marks (reduced motion: marks already drawn, digits static).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Real proof (users, parser tests) to replace labelled samples once it exists.
