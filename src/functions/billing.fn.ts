import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { db } from '~/server/env'
import { requireUser, toPublicUser } from '~/server/auth'
import { newId } from '~/server/crypto'
import { PRO_PERIOD_DAYS, cashfreeConfigured, cashfreeSandbox, createProPaymentLink, proPricePaise, reconcilePayment } from '~/server/cashfree'
import { applyOffer } from '~/server/offers'

const origin = () => new URL(getRequest().url).origin

export const getBillingConfig = createServerFn({ method: 'GET' }).handler(async () => ({
  enabled: cashfreeConfigured(),
  sandbox: cashfreeSandbox(),
  periodDays: PRO_PERIOD_DAYS,
}))

/** Cashfree requires a customer phone number on every payment link. */
const phoneSchema = z
  .string()
  .transform((v) => v.replace(/[\s()-]/g, '').replace(/^\+/, ''))
  .pipe(z.string().regex(/^[0-9]{8,15}$/, 'Enter a valid mobile number.'))

/** Checks a discount code and shows what Pro would cost, without starting a payment. */
export const previewOffer = createServerFn({ method: 'POST' })
  .validator(z.object({ code: z.string().trim().min(1).max(40) }))
  .handler(async ({ data }) => {
    await requireUser()
    return applyOffer(data.code, proPricePaise())
  })

export const startProPayment = createServerFn({ method: 'POST' })
  .validator(z.object({ phone: phoneSchema, code: z.string().trim().max(40).optional() }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (user.plan === 'pro') throw new Error('You are already on Pro.')

    const base = proPricePaise()
    const applied = data.code ? await applyOffer(data.code, base) : null
    const amountPaise = applied?.amountPaise ?? base

    const linkId = `cvaf_${newId().replace(/-/g, '')}`
    await db()
      .prepare(
        'INSERT INTO payments (id, user_id, amount_paise, currency, status, offer_code, discount_paise, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(linkId, user.id, amountPaise, 'INR', 'created', applied?.code ?? null, applied?.discountPaise ?? 0, Math.floor(Date.now() / 1000))
      .run()
    await db().prepare('UPDATE users SET phone = ? WHERE id = ?').bind(data.phone, user.id).run()

    const link = await createProPaymentLink({
      linkId,
      userId: user.id,
      email: user.email,
      name: user.name,
      phone: data.phone,
      amountPaise,
      returnUrl: `${origin()}/app/billing?link_id=${linkId}`,
      notifyUrl: `${origin()}/api/cashfree/webhook`,
    })
    if (link.cf_link_id) await db().prepare('UPDATE payments SET cf_link_id = ? WHERE id = ?').bind(link.cf_link_id, linkId).run()
    return { url: link.link_url }
  })

/**
 * Called when the user returns from Cashfree. Confirms the link with Cashfree
 * directly so the upgrade lands even if the webhook is slow or unconfigured.
 */
export const confirmProPayment = createServerFn({ method: 'POST' })
  .validator(z.object({ linkId: z.string().max(64) }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    const owner = await db().prepare('SELECT user_id FROM payments WHERE id = ?').bind(data.linkId).first<{ user_id: string }>()
    if (!owner || owner.user_id !== user.id) throw new Error('This payment belongs to a different account.')
    const paid = await reconcilePayment(data.linkId)
    return { paid, user: toPublicUser(await requireUser()) }
  })
