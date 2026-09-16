# IMPLEMENTATION.md — handoff notes for continuing development

> **For a new Claude / AI session:** read this file first, then `README.md`. It records what was built, why each decision was made, what has been verified, and what is left to do.
> Last updated: 2026-09-16.

---

## 1. Project goal

A lean, paid AI resume builder similar to Rezi, for the domain **https://cvatsfriendly.com**.

The original requirements from the owner:
- Start from the open-source project **rendercv/rendercv**, reuse what fits, and strip its branding.
- Guided form → clean, **ATS-friendly** resume, with multiple templates.
- AI: **rewrite bullet points** for impact and **tailor the resume to a pasted job description**.
- **Export to PDF**, and **save multiple versions**.
- Clean, modern, responsive UI with a thoughtful **landing page**.
- **Email/password auth** plus a simple **paid tier (Stripe test mode)**.
- A README covering setup, environment variables and deployment.
- **Stack chosen by the owner:** TanStack Start, deployed to the **Cloudflare Workers free tier** with a **SQLite database (D1)**.
- Run locally first, then deploy.

---

## 2. Current status

| Area | Status |
| --- | --- |
| Local MVP | ✅ Complete. `npm run typecheck` and `npm run build` pass |
| Landing page, pricing, templates, ATS guide, privacy, terms, sitemap, robots | ✅ Done |
| Auth (signup, login, logout, change password, sessions) | ✅ Done and tested in the browser |
| Dashboard (create blank/sample, import YAML/JSON, duplicate, delete) | ✅ Done and tested |
| Editor (8 steps, live preview, autosave, mobile edit/preview toggle) | ✅ Done and tested (desktop and 375px mobile) |
| AI (bullet variants, improve a role, write summary, tailor to JD) | ✅ Done; tested end to end with `AI_MOCK=true` only |
| AI credit limits (free 5/day, pro 150/day) | ✅ Tested; the limit error shows an upgrade link |
| ATS check (10 rules) and JD keyword match | ✅ Done |
| Versions (save, preview, restore, delete) and "tailored copy" | ✅ Done; backup-before-tailor tested |
| PDF export (client-side, react-pdf) | ✅ All 5 templates rendered and text extraction verified; hyphenation disabled |
| YAML (RenderCV format) and JSON export/import | ✅ Done (import only lightly tested) |
| Stripe webhook (signature verification, plan update) | ✅ Tested locally with a hand-signed event |
| Stripe Checkout, Customer Portal, checkout sync | ⚠️ Code complete, **not tested**: no real Stripe test key yet |
| Real AI (Claude / Workers AI) | ⚠️ Code complete, **not tested with real providers** |
| **Deployment to Cloudflare** | ❌ **Not done.** The machine was not logged in (`wrangler login` needed) |
| Custom domain cvatsfriendly.com | ❌ Not done. `routes` block is commented out in `wrangler.jsonc` |
| Git repository | ❌ Not initialised. Recommended: `git init`, commit, push to GitHub |

---

## 3. Next steps (in priority order)

1. **Deploy** (see README §4):
   ```bash
   npx wrangler login
   npx wrangler d1 create cvatsfriendly-db     # paste database_id into wrangler.jsonc
   npm run db:migrate:remote
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   npx wrangler secret put ANTHROPIC_API_KEY   # optional
   npm run deploy
   ```
2. **Custom domain:** add the zone in Cloudflare, switch nameservers, uncomment `routes` in `wrangler.jsonc`, redeploy.
3. **Stripe:** create the webhook endpoint `https://cvatsfriendly.com/api/stripe/webhook` with the events `checkout.session.completed` and `customer.subscription.created/updated/deleted`. Save the Customer Portal settings once in test mode. Then test the full checkout with card 4242….
4. **Test real AI** (Claude or Workers AI) and tune the prompts in `src/server/ai.ts` if needed.
5. Features still missing:
   - Password reset by email (needs Resend or Cloudflare Email)
   - Login rate limiting (Cloudflare Rate Limiting rule or binding)
   - Account deletion (the privacy page promises it via email)
   - OG share image (`og:image` meta is not set yet)
   - Analytics (Cloudflare Web Analytics is free)
   - Legal review of `/privacy` and `/terms`
6. Optional improvements:
   - Show a paginated PDF preview in the editor
   - Embed fonts for non-Latin scripts (e.g. Malayalam or Hindi names): `Font.register` in `ResumePdf.tsx`
   - Cover-letter generator
   - Stronger keyword extraction

---

## 4. Setting up on a new PC

Requirements: **Node.js 20+** (developed on Node 24.15, npm 11) and git.

```bash
# copy/clone the project folder (exclude node_modules, dist, .wrangler)
npm install
cp .dev.vars.example .dev.vars     # set AI_MOCK=true for keyless local dev
npm run db:migrate:local           # local SQLite lives in .wrangler/ (NOT portable, recreate it)
npm run dev                        # http://localhost:3000
```

Things that do **not** travel with the source code and must be recreated on the new PC:
- `.dev.vars` (secrets, gitignored)
- `.wrangler/` (local D1 data; test users and resumes are lost, which is fine)
- Cloudflare login (`npx wrangler login`)
- Production secrets live in Cloudflare (`wrangler secret list`), not in files

The **Workers AI binding is remote**. Local dev only uses it with `CF_REMOTE_BINDINGS=true npm run dev` after `wrangler login`. Without that, use `AI_MOCK=true` or `ANTHROPIC_API_KEY`.

For in-app browser previews, `.claude/launch.json` defines the `cvatsfriendly` config (`npm run dev`, port 3000).

---

## 5. Architecture

```
Browser (React 19, TanStack Router)
  │  SSR HTML + hydration; server functions called over RPC (/_serverFn/...)
  ▼
Cloudflare Worker  (main: @tanstack/react-start/server-entry)
  ├─ src/functions/*.fn.ts     createServerFn(...).validator(zod).handler(...)
  ├─ src/routes/api/stripe/webhook.ts   server route (POST)
  ├─ src/routes/sitemap[.]xml.ts        server route (GET)
  ├─ D1 binding  "DB"  (SQLite)  ← migrations/0001_init.sql
  ├─ AI binding  "AI"  (Workers AI, fallback provider)
  ├─ fetch → api.anthropic.com  (Claude, via @anthropic-ai/sdk, when ANTHROPIC_API_KEY set)
  └─ fetch → api.stripe.com     (raw REST, no SDK)
PDF generation: in the BROWSER only (lazy-imported @react-pdf/renderer)
```

### Versions (installed September 2026)
- `@tanstack/react-start` 1.168.x and `@tanstack/react-router` 1.170.x
- `vite` 8.3 (rolldown)
- `@cloudflare/vite-plugin` 1.54 and `wrangler` 4.132
- `react` 19.3
- `tailwindcss` 4.3 via `@tailwindcss/vite`
- `zod` 4.6
- `@react-pdf/renderer` 4.9
- `@anthropic-ai/sdk` 0.126
- `js-yaml` 5.4
- `lucide-react`

---

## 6. File map

```
wrangler.jsonc              Worker config: D1 (placeholder database_id!), AI binding, vars, commented custom-domain routes
vite.config.ts              cloudflare({viteEnvironment:{name:'ssr'}, remoteBindings: CF_REMOTE_BINDINGS==='true'}), tailwind, tanstackStart, react
tsconfig.json               "~/*" → "./src/*"; includes worker-configuration.d.ts (generated by `wrangler types`)
migrations/0001_init.sql    users, sessions, resumes, resume_versions, ai_usage
.dev.vars.example           all secrets documented
public/                     favicon.svg, robots.txt, site.webmanifest
README.md                   setup, env vars, Stripe, deploy, free-tier notes
THIRD_PARTY_NOTICES.md      RenderCV MIT licence (required, keep it)

src/router.tsx              getRouter(); context { user }
src/styles.css              Tailwind v4 @theme (brand emerald colours, fonts) + @utility btn/btn-primary/input/card/...
src/routes/__root.tsx       <html> shell, SEO meta, JSON-LD, Google Fonts; beforeLoad → getMe() puts user in context
src/routes/_site.tsx        pathless layout: SiteHeader + SiteFooter
src/routes/_site/index.tsx  LANDING (hero with live resume preview, features, steps, templates carousel, comparison, pricing, FAQ + FAQPage JSON-LD, CTA)
src/routes/_site/{pricing,templates,ats-resume-guide,privacy,terms,login,signup}.tsx
src/routes/app.tsx          auth-guarded layout (redirects to /login?redirect=…), noindex
src/routes/app/index.tsx    dashboard
src/routes/app/resume.$id.tsx   EDITOR page (autosave, toolbar, steps, preview, modals)
src/routes/app/billing.tsx  account & billing (plan, AI usage, checkout, portal, change password, ?session_id sync)
src/routes/api/stripe/webhook.ts
src/routes/sitemap[.]xml.ts

src/functions/auth.fn.ts     getMe, signup, login, logout, changePassword
src/functions/resumes.fn.ts  list/create/get/save/duplicate/delete resumes; list/save/get/delete versions; plan limit checks
src/functions/ai.fn.ts       aiRewriteBullet, aiImproveRole, aiWriteSummary, aiTailorResume (3 credits), getAiUsage; atomic credit counter + refund on failure
src/functions/billing.fn.ts  getBillingConfig, createCheckoutSession, syncCheckoutSession, createPortalSession

src/server/env.ts      `import { env } from 'cloudflare:workers'`; Secrets interface (add new secrets here)
src/server/auth.ts     sessions (random token in HttpOnly cookie "cvaf_session", SHA-256 stored in DB, 30 days), requireUser, toPublicUser
src/server/crypto.ts   PBKDF2-SHA256 (60k iterations), random tokens, HMAC, timing-safe compare
src/server/stripe.ts   fetch-based Stripe client (form-encoded, Stripe-Version 2024-06-20), webhook signature verify, applySubscription()
src/server/ai.ts       provider switch (mock | claude | workers-ai), JSON-schema structured output, ALL PROMPTS live here

src/lib/resume/schema.ts        ResumeData zod schema, empty*/sample/normalizeResume (always normalise loaded data)
src/lib/resume/themes.ts        5 templates (classic, harvard free; engineer, modern, compact pro) — values ported from RenderCV themes
src/lib/resume/format.ts        date formatting ("2021-03" → "Mar 2021", "present"), **bold** inline parsing, contact list
src/lib/resume/ats.ts           runAtsChecks (10 weighted rules), extractKeywords, keywordMatch, resumePlainText
src/lib/resume/rendercv-yaml.ts fromRenderCvYaml / toRenderCvYaml
src/lib/plans.ts        PLAN_LIMITS, PLAN_FEATURES, PRO_PRICE_DISPLAY ($9)
src/lib/site.ts         SITE constants + seo() helper (title/description/og/canonical)
src/lib/errors.ts       UPGRADE_PREFIX "[upgrade] " + readError() (parses zod error JSON too)
src/lib/download.ts     saveBlob, downloadResumePdf (guarded by import.meta.env.SSR + dynamic import)
src/lib/auth-search.ts  login/signup search schema + safeRedirect (keep non-route exports OUT of route files)

src/components/preview/ResumeHtml.tsx  HTML renderer + ScaledResume (ResizeObserver scaling)
src/components/pdf/ResumePdf.tsx       react-pdf renderer (mirrors ResumeHtml) + renderResumePdfBlob; Font.registerHyphenationCallback disables hyphenation
src/components/editor/Steps.tsx        Contact/Summary/Experience/Education/Skills/Projects/Certifications/Design steps
src/components/editor/BulletsEditor.tsx  per-bullet AI wand + "Improve all"
src/components/editor/Fields.tsx       TextField, TextArea, DateField (type=month + "present"), ItemCard, AddButton, moveItem
src/components/editor/TailorModal.tsx  JD paste, live keyword match, AI tailoring with per-item checkboxes, apply/copy (applyTailoring())
src/components/editor/VersionsModal.tsx
src/components/editor/AtsPanel.tsx
src/components/{SiteHeader,SiteFooter,Logo,PricingCards,AuthForm,NotFound,ui}.tsx   (ui = Spinner, ErrorNote, Modal)
```

---

## 7. Data model (D1)

- **users:**
  - `id` (uuid), `email` (unique, lowercased), `name`, `password_hash` (`pbkdf2$iter$salt$hash`)
  - `plan` (`free` | `pro`)
  - `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `current_period_end` (unix seconds), `created_at` (ms)
- **sessions:** `id` = sha256(token), `user_id`, `expires_at` (ms), `created_at`
- **resumes:** `id`, `user_id`, `title`, `template` (theme id), `data` (JSON `ResumeData`), `created_at`, `updated_at`
- **resume_versions:** `id`, `resume_id`, `user_id`, `label`, `template`, `data` (JSON snapshot), `created_at`
- **ai_usage:** (`user_id`, `day` YYYY-MM-DD UTC) primary key, `count`

To change the schema, **add a new file** such as `migrations/0002_xxx.sql`. Never edit `0001`. Then run `db:migrate:local` and `db:migrate:remote`.

`ResumeData` (JSON) has these fields:
- `basics`: name, headline, email, phone, location, website, linkedin, github
- `summary`
- `experience[]`: id, company, position, location, startDate, endDate, highlights[]
- `education[]`: id, institution, area, degree, location, dates, highlights[]
- `projects[]`: id, name, url, dates, summary, highlights[]
- `skills[]`: id, label, details
- `certifications[]`: id, name, issuer, date
- `sectionOrder[]`
- `pageSize`: `LETTER` | `A4`

Dates are `YYYY-MM`, `YYYY` or `present`. Highlights support `**bold**`. If you add a field, update `schema.ts` (the zod schema, `empty*`, `normalizeResume`), both renderers, `rendercv-yaml.ts`, and the editor step.

---

## 8. Key decisions and why

- **RenderCV is Python/Typst**, so it cannot run on Workers. Reused: the CV data model and entry types, theme typography and spacing values, the date format, and YAML import/export compatibility. Its branding is removed; `THIRD_PARTY_NOTICES.md` keeps the MIT licence.
- **One theme config drives two renderers:** `ResumeHtml` (live preview) and `ResumePdf` (export). **Any template change must be made in both files.**
- **PDF is generated client-side** with `@react-pdf/renderer`:
  - It uses the standard PDF fonts (Helvetica/Times), produces real text in a single column, and is ATS-safe.
  - It is kept out of the Worker bundle with an `import.meta.env.SSR` guard plus a dynamic import (Worker ≈ 0.5 MB gzip).
  - Hyphenation is disabled because split words break ATS keyword matching.
- **Stripe via raw fetch**, not the SDK: smaller bundle and no Node-specific code. The price is created inline (`price_data`, `PRO_PRICE_CENTS`) unless `STRIPE_PRICE_ID` is set.
  - Upgrades happen in two ways: **webhook** and **`syncCheckoutSession`** on return to `/app/billing?session_id=`. The second means checkout works locally without webhooks.
  - Statuses `active`, `trialing` and `past_due` all count as Pro.
- **AI providers:**
  - `AI_MOCK=true` → canned output for development
  - `ANTHROPIC_API_KEY` set → Claude via `client.beta.messages.create`
    - default model `claude-opus-5` (override with `ANTHROPIC_MODEL`)
    - `output_config: { effort, format: { type: 'json_schema', schema } }`
    - `betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default'`
    - `stop_reason === 'refusal'` is checked
  - otherwise → Workers AI `env.AI.run(WORKERS_AI_MODEL)` with `response_format` json_schema
  - Prompts forbid inventing facts. User text is wrapped in `<bullet>`, `<resume>` and `<job_description>` tags and treated as data.
- **Credits** use an atomic D1 upsert (`ON CONFLICT … WHERE count + cost <= limit RETURNING`), refunded when the AI call fails.
- **Plan gating is enforced server-side** (resume count, version count, pro templates, AI credits). The UI hides or locks things too.
  - Errors starting with `[upgrade] ` show an "Upgrade to Pro" link through `readError()` and `<ErrorNote upgrade>`.
- **Auth** is hand-rolled: no library, WebCrypto PBKDF2 and DB sessions. 60k iterations were chosen for the free tier's 10 ms CPU limit.
  - Login runs a dummy hash for unknown emails to keep timing similar.
  - Root `beforeLoad` calls `getMe()` on every navigation. That's acceptable for now; cache it later if needed.
- **Autosave** is debounced to 1.2 s, compares a JSON snapshot, and flushes on route change (`useBlocker`) and `beforeunload`. If saving a Pro template is rejected, the template is reverted.

---

## 9. Gotchas already hit (don't repeat them)

1. **`createServerFn().inputValidator()` is deprecated** in this version. Use **`.validator()`**.
2. **Tailwind v4:** custom classes that are composed with `@apply` (btn, btn-primary, …) must be declared with **`@utility`**, not `@layer components`.
3. **`js-yaml` v5 has no default export.** Use `import { load, dump } from 'js-yaml'`.
4. **The dev server crashes without a Cloudflare login** when the AI binding is remote. That's why `remoteBindings` is opt-in through `CF_REMOTE_BINDINGS=true`.
5. **Don't export non-route helpers from route files** (breaks code-splitting). Put them in `src/lib/`.
6. **Mobile grid overflow:** single-column CSS grids need `grid-cols-1` and `min-w-0` on children, otherwise horizontally scrolling rows blow out the width.
7. **Server-only imports** (`~/server/*`, `cloudflare:workers`) must only be used inside `.handler()` bodies or server routes. Client code may use `import type` from them only.
8. `vite.config.ts` declares `process` locally because `@types/node` isn't installed (it would clash with the Workers types).
9. After editing `wrangler.jsonc`, run `npm run cf-typegen`. Secrets are typed manually in `src/server/env.ts`.
10. The `wrangler.jsonc` `database_id` is a **placeholder of all zeros**. It must be replaced before a remote migration or deploy.
11. Local webhook testing: put any value in `.dev.vars` `STRIPE_WEBHOOK_SECRET`, sign `t.payload` with HMAC-SHA256, and send the header `stripe-signature: t=…,v1=…`.

---

## 10. Verification commands

```bash
npm run typecheck        # must print nothing
npm run build            # must end with "✓ built"
npm run dev              # manual test: signup → sample resume → edit → AI (AI_MOCK) → tailor → versions → PDF
npx wrangler d1 execute cvatsfriendly-db --local --command "SELECT email, plan FROM users"
```

To render the template PDFs in Node for visual QA, use a temporary script. Run it with `npx tsx --tsconfig tsconfig.json script.ts`, and use `createElement`, not JSX:

```ts
import { createElement } from 'react'
import { renderToFile } from '@react-pdf/renderer'
import { ResumePdfDocument } from './src/components/pdf/ResumePdf'
import { sampleResume } from './src/lib/resume/schema'
import { THEMES } from './src/lib/resume/themes'
for (const t of THEMES) await renderToFile(createElement(ResumePdfDocument, { data: sampleResume(), theme: t, title: 'Test' }) as any, `./${t.id}.pdf`)
```

---

## 11. Conventions

- TypeScript strict. Path alias `~/`. 2-space indent, single quotes, no semicolons, and a ~150-character line width.
- UI uses Tailwind utilities plus the custom utilities in `styles.css` (`btn-primary`, `btn-outline`, `btn-ghost`, `btn-dark`, `btn-sm`, `input`, `label`, `card`, `container-page`). Icons come from `lucide-react`. The brand colour is emerald (`brand-600` `#059669`), the dark colour is `ink` `#0b1324`, and the fonts are Inter (body) and Plus Jakarta Sans (`font-display`).
- Server functions: validate with zod, call `requireUser()` first, check ownership with `user_id` in every query, and throw `Error` with a user-friendly message.
- Pricing text must stay consistent in three places: `src/lib/plans.ts` (display), `wrangler.jsonc` `PRO_PRICE_CENTS`, and the JSON-LD offer in `__root.tsx`.
- Don't add fake testimonials or user-count claims to the marketing pages.
