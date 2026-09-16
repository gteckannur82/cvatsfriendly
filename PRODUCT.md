# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Active job seekers: mid-career professionals sending many applications to mid-size and large employers that screen with an applicant tracking system (ATS). Many have applied widely and heard nothing back, so they arrive anxious and sceptical, wondering whether software is filtering them out before a person ever reads their resume. They want a resume that parses correctly, ranks for the right searches, and still reads well to the recruiter who skims it.

## Product Purpose

CV ATS Friendly (cvatsfriendly.com) turns a guided form into a single-column, text-based resume, then helps the candidate tailor it to each job posting. Success is a candidate who sends a resume that an ATS extracts cleanly, that contains the posting's real keywords where they are true, and that describes achievements in outcome-first language without invented facts.

## Positioning

A resume builder built around how hiring software reads documents, not around decoration. Every template is single-column with standard fonts and headings and exports real selectable text. Tailoring is grounded in the posting: the product shows which of a job description's keywords the resume already contains and which are missing, and the AI is instructed never to add employers, tools, numbers or results that the candidate did not write.

## Operating Context

- Job postings pasted in as plain text; resumes compared against them keyword by keyword.
- PDFs uploaded into employer ATS portals (Workday, Greenhouse, Lever, Taleo are the systems candidates meet).
- Letter and A4 page sizes; US and international users ("CV" and "resume" both in use).
- Many applications in parallel: one tailored copy or named version per application.
- RenderCV-compatible YAML and JSON import/export for portability.

## Capabilities and Constraints

- Guided step-by-step editor with live preview; five templates (Classic and Harvard free; Engineer, Modern and Compact Pro).
- AI: rewrite a bullet (3 alternatives), improve all bullets in a role, write a summary, tailor a whole resume to a job description. Costs are defined in `src/lib/plans.ts` (`AI_CREDIT_COST`): 1 credit per rewrite, role improvement or summary; 3 per full tailoring. The candidate picks which suggestions to apply.
- ATS content check (weighted checks, scored out of 100) and a separate job-description keyword match score (matched ÷ extracted keywords). Keyword matching is available on the Free plan.
- Plans: Free ($0) and Pro ($9/month via Stripe). Limits live in `PLAN_LIMITS` and plan copy is derived from them.
- Import is YAML/JSON only; no PDF or Word import yet.
- PDFs are generated in the browser with `@react-pdf/renderer`; runs on Cloudflare Workers + D1.

## Brand Commitments

- Name: CV ATS Friendly; domain cvatsfriendly.com.
- Voice: plain, specific, honest about limits. No hype, no invented social proof.
- The redesigned identity applies to both the marketing site and the app shell (shared tokens in `src/styles.css`).
- Resume templates are product output, not site decoration: their typography stays governed by `src/lib/resume/themes.ts`.

## Evidence on Hand

- Pre-launch: no users, testimonials, customer logos, parser benchmark results or press exist. None may be fabricated or implied ("Most popular", "Recruiter-approved", user counts).
- Real demonstrable material: the live resume renderer (`src/components/preview/ResumeHtml.tsx`), the sample resume (`sampleResume()` in `src/lib/resume/schema.ts`, a fictional person, must read as a sample), the keyword extractor and matcher (`src/lib/resume/ats.ts`), and the ATS guide content.
- Any demonstration job posting or match result shown on the site is synthetic and must be labelled as a sample.

## Product Principles

1. Show the mechanism, not a promise: every claim on the site should be demonstrable with the product's own output.
2. Never invent facts, in the AI output and in the marketing.
3. Plain beats clever when a machine is the first reader.
4. Respect an anxious user's time: say what happens, what it costs, and what they control.

## Accessibility & Inclusion

WCAG 2.1 AA contrast and keyboard access across site and app; primary actions must meet 4.5:1 text contrast.
