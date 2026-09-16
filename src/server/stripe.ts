import { env, db } from './env'
import { hmacSha256Hex, timingSafeEqual } from './crypto'

/**
 * Minimal Stripe REST client over fetch (keeps the Worker bundle small and
 * avoids Node-only SDK code paths).
 */
type Params = Record<string, string | number | boolean | undefined | null>

function flatten(obj: Record<string, unknown>, prefix = '', out: Params = {}): Params {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k
    if (v === undefined || v === null) continue
    if (Array.isArray(v)) v.forEach((item, i) => (typeof item === 'object' ? flatten(item as any, `${key}[${i}]`, out) : (out[`${key}[${i}]`] = item as any)))
    else if (typeof v === 'object') flatten(v as Record<string, unknown>, key, out)
    else out[key] = v as string | number | boolean
  }
  return out
}

export function stripeConfigured() {
  return !!env.STRIPE_SECRET_KEY
}

export async function stripe<T = any>(method: 'GET' | 'POST', path: string, body?: Record<string, unknown>): Promise<T> {
  if (!env.STRIPE_SECRET_KEY) throw new Error('Stripe is not configured (STRIPE_SECRET_KEY missing).')
  const form = body ? new URLSearchParams(Object.entries(flatten(body)).map(([k, v]) => [k, String(v)])) : undefined
  const url = `https://api.stripe.com/v1/${path}${method === 'GET' && form ? `?${form}` : ''}`
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2024-06-20',
    },
    body: method === 'POST' ? form : undefined,
  })
  const json = (await res.json()) as any
  if (!res.ok) throw new Error(json?.error?.message ?? `Stripe error ${res.status}`)
  return json as T
}

/** Verifies the `Stripe-Signature` header (v1 scheme, 5-minute tolerance). */
export async function verifyStripeSignature(payload: string, header: string | null, secret: string) {
  if (!header) return false
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const i = p.indexOf('=')
      return [p.slice(0, i), p.slice(i + 1)]
    }),
  )
  const t = parts.t
  const signatures = header
    .split(',')
    .filter((p) => p.startsWith('v1='))
    .map((p) => p.slice(3))
  if (!t || !signatures.length) return false
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false
  const expected = await hmacSha256Hex(secret, `${t}.${payload}`)
  const enc = new TextEncoder()
  return signatures.some((s) => timingSafeEqual(enc.encode(s), enc.encode(expected)))
}

const ACTIVE = new Set(['active', 'trialing', 'past_due'])

/** Persists subscription state onto the user row. Idempotent. */
export async function applySubscription(sub: any, userIdHint?: string | null) {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
  const userId = userIdHint ?? sub.metadata?.user_id ?? null
  const plan = ACTIVE.has(sub.status) ? 'pro' : 'free'
  const periodEnd = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end ?? null
  const stmt = userId
    ? db()
        .prepare(
          `UPDATE users SET plan = ?, stripe_customer_id = ?, stripe_subscription_id = ?, subscription_status = ?, current_period_end = ? WHERE id = ?`,
        )
        .bind(plan, customerId, sub.id, sub.status, periodEnd, userId)
    : db()
        .prepare(
          `UPDATE users SET plan = ?, stripe_subscription_id = ?, subscription_status = ?, current_period_end = ? WHERE stripe_customer_id = ?`,
        )
        .bind(plan, sub.id, sub.status, periodEnd, customerId)
  await stmt.run()
}
