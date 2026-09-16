import { db, env } from './env'
import { hmacSha256Base64, timingSafeEqual } from './crypto'
import { redeemOffer } from './offers'

/**
 * Cashfree Payments (PG) client, built on Payment Links so the upgrade stays a
 * plain redirect. Pro is sold as a one-time payment granting a fixed period, so
 * there is no mandate to manage; Cashfree remains the source of truth and every
 * payment is confirmed by fetching the link before Pro is granted.
 */

const API_VERSION = '2026-01-01'

/** Days of Pro granted per successful payment. */
export const PRO_PERIOD_DAYS = 30

export function cashfreeConfigured() {
  return !!(env.CASHFREE_APP_ID && env.CASHFREE_SECRET_KEY)
}

export function cashfreeSandbox() {
  return env.CASHFREE_ENV !== 'production'
}

export function proPricePaise() {
  return Number(env.PRO_PRICE_PAISE || 49900)
}

async function cashfree<T = any>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  if (!cashfreeConfigured()) throw new Error('Payments are not configured yet.')
  const base = cashfreeSandbox() ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg'
  const res = await fetch(`${base}/${path}`, {
    method,
    headers: {
      'x-client-id': env.CASHFREE_APP_ID!,
      'x-client-secret': env.CASHFREE_SECRET_KEY!,
      'x-api-version': API_VERSION,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const json = (await res.json().catch(() => null)) as any
  if (!res.ok) throw new Error(json?.message ?? `Cashfree error ${res.status}`)
  return json as T
}

interface LinkResponse {
  link_id: string
  cf_link_id?: string
  link_url: string
  link_status: string
}

export async function createProPaymentLink(input: {
  linkId: string
  userId: string
  email: string
  name: string
  phone: string
  amountPaise: number
  returnUrl: string
  notifyUrl: string
}) {
  const link = await cashfree<LinkResponse>('POST', 'links', {
    link_id: input.linkId,
    link_amount: input.amountPaise / 100,
    link_currency: 'INR',
    link_purpose: `${env.APP_NAME} Pro — ${PRO_PERIOD_DAYS} days`,
    customer_details: {
      customer_id: input.userId,
      customer_email: input.email,
      customer_name: input.name || undefined,
      customer_phone: input.phone,
    },
    link_meta: { return_url: input.returnUrl, notify_url: input.notifyUrl },
    link_notify: { send_email: false, send_sms: false },
    link_expiry_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  })
  return link
}

/** Cashfree signs `x-webhook-timestamp` + the raw body with the client secret, base64-encoded. */
export async function verifyWebhookSignature(rawBody: string, signature: string | null, timestamp: string | null) {
  if (!signature || !timestamp || !env.CASHFREE_SECRET_KEY) return false
  const expected = await hmacSha256Base64(env.CASHFREE_SECRET_KEY, `${timestamp}${rawBody}`)
  const enc = new TextEncoder()
  return timingSafeEqual(enc.encode(signature), enc.encode(expected))
}

/**
 * Confirms a payment link against Cashfree and grants the Pro period exactly
 * once. Safe to call from both the return URL and the webhook, in any order.
 */
export async function reconcilePayment(linkId: string): Promise<boolean> {
  const row = await db()
    .prepare('SELECT user_id, status, offer_code FROM payments WHERE id = ?')
    .bind(linkId)
    .first<{ user_id: string; status: string; offer_code: string | null }>()
  if (!row) return false
  if (row.status === 'paid') return true

  const link = await cashfree<LinkResponse>('GET', `links/${encodeURIComponent(linkId)}`)
  if (link.link_status !== 'PAID') return false

  const now = Math.floor(Date.now() / 1000)
  const claimed = await db().prepare(`UPDATE payments SET status = 'paid', paid_at = ? WHERE id = ? AND status != 'paid'`).bind(now, linkId).run()
  if (!claimed.meta.changes) return true

  const user = await db().prepare('SELECT current_period_end FROM users WHERE id = ?').bind(row.user_id).first<{ current_period_end: number | null }>()
  const until = Math.max(now, user?.current_period_end ?? 0) + PRO_PERIOD_DAYS * 86400
  await db().prepare(`UPDATE users SET plan = 'pro', subscription_status = 'active', current_period_end = ? WHERE id = ?`).bind(until, row.user_id).run()
  if (row.offer_code) await redeemOffer(row.offer_code)
  return true
}

/** Reconciles every still-open payment for a user. Used by the webhook, whose payload shape varies by payment method. */
export async function reconcileUserPayments(userId: string) {
  const { results } = await db()
    .prepare(`SELECT id FROM payments WHERE user_id = ? AND status != 'paid' ORDER BY created_at DESC LIMIT 5`)
    .bind(userId)
    .all<{ id: string }>()
  for (const row of results) await reconcilePayment(row.id)
}
