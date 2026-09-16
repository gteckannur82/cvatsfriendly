# CV ATS Friendly — AI resume builder

Production source for **[cvatsfriendly.com](https://cvatsfriendly.com)**: a lean, Rezi-style resume builder.

- **Guided form → ATS-friendly resume.** Step-by-step editor with a live preview and 5 single-column templates (2 free, 3 Pro).
- **AI.** Rewrite a bullet (3 alternatives), improve every bullet in a role, write a summary, and tailor a whole resume to a pasted job description. The AI is told never to invent facts.
- **ATS tools.** 10-point content check and job-description keyword match score.
- **Export & versions.** Text-based PDF (Letter/A4) generated in the browser, RenderCV-compatible YAML and JSON export/import, named version snapshots, and tailored copies.
- **Build before signing up.** `/build` runs the whole editor for logged-out visitors, keeping the draft in `localStorage`; signing up claims it into the account. AI, exports and the ATS check prompt for a free account.
- **Accounts & billing.** Email/password auth with HttpOnly sessions, plus a Free/Pro plan. Pro is a one-time ₹499 payment for 30 days, collected with Cashfree Payment Links. Discount codes are applied at checkout.
- **Admin dashboard.** `/admin` covers revenue, users (including comping a Pro period), discount codes and the support inbox.
- **Marketing site.** Landing page, pricing, templates gallery, ATS guide, privacy and terms pages, sitemap, robots.txt and JSON-LD structured data.

**Stack:** TanStack Start (React 19, SSR, server functions) · Cloudflare Workers · D1 (SQLite) · Workers AI, Groq or Claude · Cashfree Payments · Tailwind CSS v4 · `@react-pdf/renderer`.
Everything runs on the **Cloudflare Workers free tier**.

---

## 1. Local setup

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .dev.vars.example .dev.vars        # then edit values (see below)
npm run db:migrate:local              # creates the local SQLite DB in .wrangler/
npm run dev                           # http://localhost:3000
```

With `AI_MOCK=true` in `.dev.vars`, the AI features return canned text, so you can click through the whole app with no keys and no Cloudflare login.

To use **real** AI locally, choose one:

- **Claude:** set `ANTHROPIC_API_KEY` in `.dev.vars` and set `AI_MOCK=false`.
- **Groq:** set `GROQ_API_KEY` in `.dev.vars` and set `AI_MOCK=false` (used when `ANTHROPIC_API_KEY` is not set).
- **Workers AI (free):** run `npx wrangler login` once, set `AI_MOCK=false`, and start dev with remote bindings enabled:
  ```bash
  CF_REMOTE_BINDINGS=true npm run dev
  ```

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server running inside the real Workers runtime (workerd) with local D1 |
| `npm run build` | Production build (client assets + Worker) into `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate:local` / `db:migrate:remote` | Apply `migrations/*.sql` to the local or production D1 |
| `npm run deploy` | Build and `wrangler deploy` |
| `npm run cf-typegen` | Regenerate `worker-configuration.d.ts` after editing `wrangler.jsonc` |

---

## 2. Environment variables

**Plain vars** live in `wrangler.jsonc → vars`; they aren't secret.

| Var | Default | Purpose |
| --- | --- | --- |
| `APP_NAME` | `CV ATS Friendly` | Product name, used in the payment link description |
| `SITE_URL` | `https://cvatsfriendly.com` | Canonical site URL |
| `PRO_PRICE_PAISE` | `49900` | Price of one 30-day Pro period, in paise (₹499) |
| `WORKERS_AI_MODEL` | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Model for the Workers AI fallback |

**Secrets** go in `.dev.vars` locally and are set with `wrangler secret put NAME` in production.

| Secret | Required | Purpose |
| --- | --- | --- |
| `ADMIN_EMAILS` | For `/admin` | Comma-separated emails that get the admin dashboard. An allowlist, so no database row can grant admin |
| `CASHFREE_APP_ID` | For billing | App ID from Cashfree → Developers → API Keys. Without it the upgrade button is disabled |
| `CASHFREE_SECRET_KEY` | For billing | Matching secret key. Also the key used to verify webhook signatures |
| `CASHFREE_ENV` | No | `production` hits `api.cashfree.com`; anything else stays on the sandbox |
| `ANTHROPIC_API_KEY` | No | When set, AI uses Claude; otherwise Groq (if set), otherwise Workers AI |
| `ANTHROPIC_MODEL` | No | Overrides the Claude model (default `claude-opus-5`). For example, `claude-haiku-4-5` is much cheaper per call |
| `GROQ_API_KEY` | No | When set (and `ANTHROPIC_API_KEY` is not), AI uses Groq |
| `GROQ_MODEL` | No | Overrides the Groq model (default `openai/gpt-oss-120b`) |
| `AI_MOCK` | No | `true` returns canned AI output (local development only) |

**Bindings** (`wrangler.jsonc`): `DB` is D1, and `AI` is Workers AI.

---

## 3. Cashfree Payments (sandbox)

Pro is a **one-time payment**, not a subscription: one payment unlocks Pro for 30 days
(`PRO_PERIOD_DAYS` in `src/server/cashfree.ts`), nothing auto-renews, and a lapsed period
downgrades the account on the next request. Checkout is a Cashfree **Payment Link**, so the
upgrade is a plain redirect with no client SDK to load.

1. Create a Cashfree merchant account. In the dashboard, go to **Developers → API Keys** and
   copy the App ID and Secret Key into `CASHFREE_APP_ID` / `CASHFREE_SECRET_KEY`. Leave
   `CASHFREE_ENV=sandbox` until you are ready to take real money.
2. **Local testing:** the upgrade works without webhooks. When the user returns to
   `/app/billing?link_id=…`, the app fetches the link from Cashfree and grants Pro only if
   `link_status` is `PAID`.
3. **Production webhook:** Dashboard → Developers → Webhooks → add
   `https://cvatsfriendly.com/api/cashfree/webhook` and subscribe to the payment success event.
   The handler verifies `x-webhook-signature` (base64 HMAC-SHA256 of
   `x-webhook-timestamp` + raw body, keyed with the secret) and then re-fetches the link from
   Cashfree before granting anything — the webhook is only a trigger, never the source of truth.
   Granting is idempotent, so the webhook and the return URL can both fire in any order.
4. To charge real money, set `CASHFREE_ENV=production` and swap in production keys. No code changes are needed.

> Cashfree requires a customer phone number on every payment link, so the billing page asks for
> one before redirecting and stores it on the user row for next time.

### Discount codes

Admins create codes at `/admin/offers` as either a percentage or a flat rupee amount, with an
optional expiry and redemption cap. `applyOffer` in `src/server/offers.ts` validates a code and
computes the charge; a redemption is only counted once the payment is **confirmed**, so an
abandoned checkout never burns one. A 100%-off code still charges ₹1, the minimum Cashfree accepts.

### Domain whitelisting

Cashfree reviews the site before activating a merchant account and expects these pages to exist
and be linked from the footer: `/contact`, `/terms`, `/privacy`, `/refund-policy`, `/shipping`
and `/pricing`. They are all in `src/routes/_site/`. **Before submitting for review, fill in the
registered business address and phone number on `/contact`** — they are placeholders right now.

---

## 4. Deploy to Cloudflare (free tier)

```bash
npx wrangler login

# 1) Create the production database, then paste the printed database_id into wrangler.jsonc
npx wrangler d1 create cvatsfriendly-db

# 2) Create tables
npm run db:migrate:remote

# 3) Secrets
npx wrangler secret put CASHFREE_APP_ID        # optional; without it the upgrade button is disabled
npx wrangler secret put CASHFREE_SECRET_KEY
npx wrangler secret put CASHFREE_ENV           # 'production' for real money, else sandbox
npx wrangler secret put GROQ_API_KEY           # optional; skip to use free Workers AI

# 4) Build & deploy
npm run deploy
```

The first deploy gives you a `https://cvatsfriendly.<your-subdomain>.workers.dev` URL.

### Connect cvatsfriendly.com

1. Add `cvatsfriendly.com` as a site in Cloudflare (the Free plan is fine) and change the nameservers at your registrar to the two Cloudflare gives you. Wait until the zone shows **Active**.
2. Keep the `routes` block in `wrangler.jsonc` pointed at the hostnames you want to serve.
3. Run `npm run deploy` again. Cloudflare creates the DNS records and TLS certificates automatically.
4. Update the Cashfree webhook URL to `https://cvatsfriendly.com/api/cashfree/webhook`.

`cvatsfriendly.com` is canonical. `www.` and `beta.` are custom domains on the same Worker so
their DNS resolves, but a zone-level redirect rule 301s them to the apex, so only one hostname
ever serves pages.

### Deploy from Git (optional)

In Cloudflare Dashboard → Workers & Pages → your Worker → Settings → Build, connect the repository. Set the build command to `npm run build` and the deploy command to `npx wrangler deploy`.

---

## 5. Free-tier notes

| Resource | Free limit | How the app fits |
| --- | --- | --- |
| Workers requests | 100k/day | SSR pages and server functions |
| Worker CPU | 10 ms/request | Password hashing uses PBKDF2 at 60k iterations. PDFs are rendered in the browser, not the Worker. Waiting on AI/Cashfree calls doesn't count as CPU |
| Worker size | 3 MB gzipped | About 0.5 MB gzipped (react-pdf is excluded from the Worker bundle) |
| D1 | 5 GB storage, 5M reads/day | Resumes are small JSON rows |
| Workers AI | 10k neurons/day | Enough for light use (on the order of 100 rewrites/day on the 70B model); use `ANTHROPIC_API_KEY` or a smaller `WORKERS_AI_MODEL` for more |

---

## 6. Project structure

```
migrations/            D1 schema (users, sessions, resumes, resume_versions, ai_usage)
src/routes/            File-based routes
  _site/               Public pages: landing, pricing, templates, guide, auth, legal
  app/                 Authenticated app: dashboard, editor (resume.$id), billing
  api/cashfree/webhook Cashfree webhook (signature verified with WebCrypto)
  sitemap[.]xml        Dynamic sitemap
src/functions/         Server functions (auth, resumes & versions, AI, billing)
src/server/            Server-only code: D1/env, sessions, crypto, Cashfree REST client, AI providers & prompts
src/lib/resume/        Resume schema, templates, date formatting, ATS checks, RenderCV YAML import/export
src/components/        UI, editor steps, HTML preview, PDF document
```

### Plan limits

Edit `src/lib/plans.ts`. Free: 2 resumes, 3 versions each, 5 AI credits/day, and the Classic & Harvard templates. Pro: 50 resumes, 100 versions, 150 AI credits/day, and all templates. Tailoring costs 3 credits; everything else costs 1.

---

## 7. Known limitations and next steps

- **Password reset** needs an email provider (e.g. Resend or Cloudflare Email Service). It isn't included yet.
- **Rate limiting** of login attempts: add Cloudflare Rate Limiting rules on `/_serverFn/*`, or use the Workers Rate Limiting binding.
- PDFs use the standard PDF fonts (Helvetica/Times), which cover Latin scripts. Supporting other scripts needs embedded fonts via `Font.register`.
- The legal pages are templates. Have them reviewed before launch.

## Credits

The resume data model, theme typography and YAML format are adapted from [RenderCV](https://github.com/rendercv/rendercv) (MIT License). See `THIRD_PARTY_NOTICES.md`.
