import { db } from './env'

export interface OfferRow {
  code: string
  kind: 'percent' | 'flat'
  value: number
  active: number
  expires_at: number | null
  max_redemptions: number | null
  times_redeemed: number
  created_at: number
}

export const normalizeCode = (code: string) => code.trim().toUpperCase()

/** Cashfree rejects payment links below ₹1, so a 100%-off code still charges this. */
const MIN_CHARGE_PAISE = 100

export interface AppliedOffer {
  code: string
  discountPaise: number
  amountPaise: number
}

/** Validates a code against the live offer row. Throws with a user-facing reason if unusable. */
export async function applyOffer(code: string, basePaise: number): Promise<AppliedOffer> {
  const row = await db().prepare('SELECT * FROM offers WHERE code = ?').bind(normalizeCode(code)).first<OfferRow>()
  if (!row || !row.active) throw new Error('That code is not valid.')
  if (row.expires_at && row.expires_at < Date.now()) throw new Error('That code has expired.')
  if (row.max_redemptions !== null && row.times_redeemed >= row.max_redemptions) throw new Error('That code has been fully redeemed.')

  const raw = row.kind === 'percent' ? Math.round((basePaise * row.value) / 100) : row.value
  const amountPaise = Math.max(MIN_CHARGE_PAISE, basePaise - raw)
  return { code: row.code, discountPaise: basePaise - amountPaise, amountPaise }
}

/** Counted only once a payment is confirmed, so abandoned checkouts don't burn a redemption. */
export async function redeemOffer(code: string) {
  await db().prepare('UPDATE offers SET times_redeemed = times_redeemed + 1 WHERE code = ?').bind(code).run()
}
