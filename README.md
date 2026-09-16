# CV ATS Friendly — AI resume builder

Production source for **[cvatsfriendly.com](https://cvatsfriendly.com)**: a lean, Rezi-style resume builder.

- **Guided form → ATS-friendly resume.** Step-by-step editor with a live preview and 5 single-column templates (2 free, 3 Pro).
- **AI.** Rewrite a bullet (3 alternatives), improve every bullet in a role, write a summary, and tailor a whole resume to a pasted job description. The AI is told never to invent facts.
- **ATS tools.** 10-point content check and job-description keyword match score.
- **Export & versions.** Text-based PDF (Letter/A4) generated in the browser, RenderCV-compatible YAML and JSON export/import, named version snapshots, and tailored copies.
- **Accounts & billing.** Email/password auth with HttpOnly sessions, plus a Free/Pro plan with Stripe Checkout, the Customer Portal and webhooks.
- **Marketing site.** Landing page, pricing, templates gallery, ATS guide, privacy and terms pages, sitemap, robots.txt and JSON-LD structured data.

**Stack:** TanStack Start (React 19, SSR, server functions) · Cloudflare Workers · D1 (SQLite) · Workers AI or Claude · Stripe · Tailwind CSS v4 · `@react-pdf/renderer`.
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
| `APP_NAME` | `CV ATS Friendly` | Product name used for the Stripe product |
| `SITE_URL` | `https://cvatsfriendly.com` | Canonical site URL |
| `PRO_PRICE_CENTS` | `900` | Pro monthly price when `STRIPE_PRICE_ID` is not set |
| `WORKERS_AI_MODEL` | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Model for the Workers AI fallback |

**Secrets** go in `.dev.vars` locally and are set with `wrangler secret put NAME` in production.

| Secret | Required | Purpose |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | For billing | `sk_test_…` (test mode) or `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | For billing | `whsec_…` signing secret of your webhook endpoint |
| `STRIPE_PRICE_ID` | No | Existing recurring price. If empty, a $9/mo price is created inline at checkout |
| `ANTHROPIC_API_KEY` | No | When set, AI uses Claude; otherwise it uses Workers AI |
| `ANTHROPIC_MODEL` | No | Overrides the Claude model (default `claude-opus-5`). For example, `claude-haiku-4-5` is much cheaper per call |
| `AI_MOCK` | No | `true` returns canned AI output (local development only) |

**Bindings** (`wrangler.jsonc`): `DB` is D1, and `AI` is Workers AI.

---

## 3. Stripe (test mode)

1. Create a Stripe account and switch to **Test mode**. Copy the secret key into `STRIPE_SECRET_KEY`.
2. **Local testing:** checkout works without webhooks. When the user returns to `/app/billing?session_id=…`, the app confirms the session with Stripe directly and upgrades the account. To test webhooks (renewals and cancellations) as well:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Put the printed `whsec_…` into `.dev.vars`.
3. Pay with test card `4242 4242 4242 4242`, any future date, and any CVC.
4. **Production webhook:** Dashboard → Developers → Webhooks → add the endpoint `https://cvatsfriendly.com/api/stripe/webhook` with these events:
   `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
5. **Customer Portal:** in test mode, open Settings → Billing → Customer portal once and click **Save**. This enables the “Manage subscription” button.
6. To charge real money, swap in live keys and a live webhook secret. No code changes are needed.

---

## 4. Deploy to Cloudflare (free tier)

```bash
npx wrangler login

# 1) Create the production database, then paste the printed database_id into wrangler.jsonc
npx wrangler d1 create cvatsfriendly-db

# 2) Create tables
npm run db:migrate:remote

# 3) Secrets
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put ANTHROPIC_API_KEY      # optional; skip to use free Workers AI

# 4) Build & deploy
npm run deploy
```

The first deploy gives you a `https://cvatsfriendly.<your-subdomain>.workers.dev` URL.

### Connect cvatsfriendly.com

1. Add `cvatsfriendly.com` as a site in Cloudflare (the Free plan is fine) and change the nameservers at your registrar to the two Cloudflare gives you. Wait until the zone shows **Active**.
2. Uncomment the `routes` block at the bottom of `wrangler.jsonc`:
   ```jsonc
   "routes": [
     { "pattern": "cvatsfriendly.com", "custom_domain": true },
     { "pattern": "www.cvatsfriendly.com", "custom_domain": true }
   ]
   ```
3. Run `npm run deploy` again. Cloudflare creates the DNS records and TLS certificates automatically.
4. Update the Stripe webhook URL to `https://cvatsfriendly.com/api/stripe/webhook`.

### Deploy from Git (optional)

In Cloudflare Dashboard → Workers & Pages → your Worker → Settings → Build, connect the repository. Set the build command to `npm run build` and the deploy command to `npx wrangler deploy`.

---

## 5. Free-tier notes

| Resource | Free limit | How the app fits |
| --- | --- | --- |
| Workers requests | 100k/day | SSR pages and server functions |
| Worker CPU | 10 ms/request | Password hashing uses PBKDF2 at 60k iterations. PDFs are rendered in the browser, not the Worker. Waiting on AI/Stripe calls doesn't count as CPU |
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
  api/stripe/webhook   Stripe webhook (signature verified with WebCrypto)
  sitemap[.]xml        Dynamic sitemap
src/functions/         Server functions (auth, resumes & versions, AI, billing)
src/server/            Server-only code: D1/env, sessions, crypto, Stripe REST client, AI providers & prompts
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
