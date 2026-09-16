import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '~/server/env'
import { requireAdmin } from '~/server/auth'
import { PRO_PERIOD_DAYS } from '~/server/cashfree'
import { normalizeCode } from '~/server/offers'

const num = (v: { n: number } | null) => v?.n ?? 0
const count = (sql: string, ...bind: unknown[]) => db().prepare(sql).bind(...bind).first<{ n: number }>().then(num)

// ---------------------------------------------------------------------------
// Overview & revenue
// ---------------------------------------------------------------------------

export const getAdminOverview = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const dayAgo = (d: number) => Math.floor((Date.now() - d * 86400_000) / 1000)

  const [users, proUsers, newUsers7d, resumes, enquiriesOpen, revenueAll, revenue30d, paidCount] = await Promise.all([
    count('SELECT COUNT(*) AS n FROM users'),
    count(`SELECT COUNT(*) AS n FROM users WHERE plan = 'pro'`),
    count('SELECT COUNT(*) AS n FROM users WHERE created_at >= ?', Date.now() - 7 * 86400_000),
    count('SELECT COUNT(*) AS n FROM resumes'),
    count(`SELECT COUNT(*) AS n FROM support_enquiries WHERE status = 'open'`),
    count(`SELECT COALESCE(SUM(amount_paise), 0) AS n FROM payments WHERE status = 'paid'`),
    count(`SELECT COALESCE(SUM(amount_paise), 0) AS n FROM payments WHERE status = 'paid' AND paid_at >= ?`, dayAgo(30)),
    count(`SELECT COUNT(*) AS n FROM payments WHERE status = 'paid'`),
  ])

  const { results: daily } = await db()
    .prepare(
      `SELECT date(paid_at, 'unixepoch') AS day, SUM(amount_paise) AS paise, COUNT(*) AS payments
       FROM payments WHERE status = 'paid' AND paid_at >= ? GROUP BY day ORDER BY day`,
    )
    .bind(dayAgo(14))
    .all<{ day: string; paise: number; payments: number }>()

  const { results: recent } = await db()
    .prepare(
      `SELECT p.id, p.amount_paise, p.discount_paise, p.offer_code, p.paid_at, u.email
       FROM payments p LEFT JOIN users u ON u.id = p.user_id
       WHERE p.status = 'paid' ORDER BY p.paid_at DESC LIMIT 10`,
    )
    .all<{ id: string; amount_paise: number; discount_paise: number; offer_code: string | null; paid_at: number; email: string | null }>()

  return {
    users,
    proUsers,
    newUsers7d,
    resumes,
    enquiriesOpen,
    revenueAll,
    revenue30d,
    paidCount,
    daily,
    recent: recent.map((r) => ({
      id: r.id,
      email: r.email ?? 'deleted account',
      amountPaise: r.amount_paise,
      discountPaise: r.discount_paise,
      offerCode: r.offer_code,
      paidAt: r.paid_at,
    })),
  }
})

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const listUsers = createServerFn({ method: 'POST' })
  .validator(z.object({ q: z.string().trim().max(200).default('') }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const like = `%${data.q.toLowerCase()}%`
    const { results } = await db()
      .prepare(
        `SELECT u.id, u.email, u.name, u.plan, u.current_period_end, u.created_at,
                (SELECT COUNT(*) FROM resumes r WHERE r.user_id = u.id) AS resumes,
                (SELECT COALESCE(SUM(p.amount_paise), 0) FROM payments p WHERE p.user_id = u.id AND p.status = 'paid') AS paid_paise
         FROM users u
         WHERE (?1 = '' OR lower(u.email) LIKE ?2 OR lower(u.name) LIKE ?2)
         ORDER BY u.created_at DESC LIMIT 100`,
      )
      .bind(data.q.toLowerCase(), like)
      .all<{
        id: string
        email: string
        name: string
        plan: string
        current_period_end: number | null
        created_at: number
        resumes: number
        paid_paise: number
      }>()
    return results.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      plan: u.plan,
      currentPeriodEnd: u.current_period_end,
      createdAt: u.created_at,
      resumes: u.resumes,
      paidPaise: u.paid_paise,
    }))
  })

/** Comps a Pro period without a payment — used for support fixes and refunded upgrades. */
export const setUserPlan = createServerFn({ method: 'POST' })
  .validator(z.object({ userId: z.string().max(64), plan: z.enum(['free', 'pro']) }))
  .handler(async ({ data }) => {
    await requireAdmin()
    if (data.plan === 'free') {
      await db().prepare(`UPDATE users SET plan = 'free', subscription_status = 'revoked', current_period_end = NULL WHERE id = ?`).bind(data.userId).run()
      return { ok: true }
    }
    const now = Math.floor(Date.now() / 1000)
    const row = await db().prepare('SELECT current_period_end FROM users WHERE id = ?').bind(data.userId).first<{ current_period_end: number | null }>()
    const until = Math.max(now, row?.current_period_end ?? 0) + PRO_PERIOD_DAYS * 86400
    await db().prepare(`UPDATE users SET plan = 'pro', subscription_status = 'comped', current_period_end = ? WHERE id = ?`).bind(until, data.userId).run()
    return { ok: true }
  })

// ---------------------------------------------------------------------------
// Offers
// ---------------------------------------------------------------------------

export const listOffers = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const { results } = await db().prepare('SELECT * FROM offers ORDER BY created_at DESC').all<{
    code: string
    kind: string
    value: number
    active: number
    expires_at: number | null
    max_redemptions: number | null
    times_redeemed: number
    created_at: number
  }>()
  return results.map((o) => ({
    code: o.code,
    kind: o.kind as 'percent' | 'flat',
    value: o.value,
    active: !!o.active,
    expiresAt: o.expires_at,
    maxRedemptions: o.max_redemptions,
    timesRedeemed: o.times_redeemed,
    createdAt: o.created_at,
  }))
})

export const createOffer = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      code: z
        .string()
        .trim()
        .min(3, 'Codes need at least 3 characters.')
        .max(40)
        .regex(/^[A-Za-z0-9_-]+$/, 'Use letters, numbers, hyphens and underscores only.'),
      kind: z.enum(['percent', 'flat']),
      /** Percent 1-100, or rupees off for a flat code. */
      value: z.coerce.number().int().positive(),
      expiresAt: z.coerce.number().int().optional(),
      maxRedemptions: z.coerce.number().int().positive().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    if (data.kind === 'percent' && data.value > 100) throw new Error('A percentage code cannot exceed 100.')
    const code = normalizeCode(data.code)
    const existing = await db().prepare('SELECT code FROM offers WHERE code = ?').bind(code).first()
    if (existing) throw new Error('That code already exists.')
    await db()
      .prepare('INSERT INTO offers (code, kind, value, active, expires_at, max_redemptions, created_at) VALUES (?, ?, ?, 1, ?, ?, ?)')
      .bind(code, data.kind, data.kind === 'percent' ? data.value : data.value * 100, data.expiresAt ?? null, data.maxRedemptions ?? null, Date.now())
      .run()
    return { code }
  })

export const setOfferActive = createServerFn({ method: 'POST' })
  .validator(z.object({ code: z.string().max(40), active: z.boolean() }))
  .handler(async ({ data }) => {
    await requireAdmin()
    await db().prepare('UPDATE offers SET active = ? WHERE code = ?').bind(data.active ? 1 : 0, normalizeCode(data.code)).run()
    return { ok: true }
  })

export const deleteOffer = createServerFn({ method: 'POST' })
  .validator(z.object({ code: z.string().max(40) }))
  .handler(async ({ data }) => {
    await requireAdmin()
    await db().prepare('DELETE FROM offers WHERE code = ?').bind(normalizeCode(data.code)).run()
    return { ok: true }
  })

// ---------------------------------------------------------------------------
// Support enquiries
// ---------------------------------------------------------------------------

export const listEnquiries = createServerFn({ method: 'POST' })
  .validator(z.object({ status: z.enum(['open', 'resolved', 'all']).default('open') }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const { results } = await db()
      .prepare(
        `SELECT id, user_id, name, email, subject, message, status, admin_note, created_at, resolved_at
         FROM support_enquiries WHERE (?1 = 'all' OR status = ?1) ORDER BY created_at DESC LIMIT 200`,
      )
      .bind(data.status)
      .all<{
        id: string
        user_id: string | null
        name: string
        email: string
        subject: string
        message: string
        status: string
        admin_note: string
        created_at: number
        resolved_at: number | null
      }>()
    return results.map((e) => ({
      id: e.id,
      hasAccount: !!e.user_id,
      name: e.name,
      email: e.email,
      subject: e.subject,
      message: e.message,
      status: e.status as 'open' | 'resolved',
      adminNote: e.admin_note,
      createdAt: e.created_at,
      resolvedAt: e.resolved_at,
    }))
  })

export const resolveEnquiry = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().max(64), note: z.string().trim().max(2000).default(''), resolved: z.boolean().default(true) }))
  .handler(async ({ data }) => {
    await requireAdmin()
    await db()
      .prepare('UPDATE support_enquiries SET status = ?, admin_note = ?, resolved_at = ? WHERE id = ?')
      .bind(data.resolved ? 'resolved' : 'open', data.note, data.resolved ? Date.now() : null, data.id)
      .run()
    return { ok: true }
  })
