import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { db, env } from '~/server/env'
import { requireUser, toPublicUser } from '~/server/auth'
import { applySubscription, stripe, stripeConfigured } from '~/server/stripe'

const origin = () => new URL(getRequest().url).origin

export const getBillingConfig = createServerFn({ method: 'GET' }).handler(async () => ({
  enabled: stripeConfigured(),
  testMode: (env.STRIPE_SECRET_KEY ?? '').startsWith('sk_test_'),
}))

export const createCheckoutSession = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await requireUser()
  if (user.plan === 'pro') throw new Error('You are already on Pro.')

  let customerId = user.stripe_customer_id
  if (!customerId) {
    const customer = await stripe<{ id: string }>('POST', 'customers', {
      email: user.email,
      name: user.name || undefined,
      metadata: { user_id: user.id },
    })
    customerId = customer.id
    await db().prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').bind(customerId, user.id).run()
  }

  const lineItem = env.STRIPE_PRICE_ID
    ? { price: env.STRIPE_PRICE_ID, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Number(env.PRO_PRICE_CENTS || 900),
          recurring: { interval: 'month' },
          product_data: { name: `${env.APP_NAME} Pro` },
        },
      }

  const session = await stripe<{ url: string }>('POST', 'checkout/sessions', {
    mode: 'subscription',
    customer: customerId,
    client_reference_id: user.id,
    line_items: [lineItem],
    allow_promotion_codes: true,
    success_url: `${origin()}/app/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin()}/app/billing?canceled=1`,
    subscription_data: { metadata: { user_id: user.id } },
    metadata: { user_id: user.id },
  })
  return { url: session.url }
})

/**
 * Called when the user returns from Checkout. Confirms the session directly with
 * Stripe so upgrades work even before webhooks are configured (e.g. local dev).
 */
export const syncCheckoutSession = createServerFn({ method: 'POST' })
  .validator(z.object({ sessionId: z.string().startsWith('cs_').max(300) }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    const session = await stripe('GET', `checkout/sessions/${encodeURIComponent(data.sessionId)}`, { 'expand[]': 'subscription' } as any)
    if (session.client_reference_id !== user.id) throw new Error('This checkout session belongs to a different account.')
    if (session.subscription && typeof session.subscription === 'object') await applySubscription(session.subscription, user.id)
    const fresh = await requireUser()
    return toPublicUser(fresh)
  })

export const createPortalSession = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await requireUser()
  if (!user.stripe_customer_id) throw new Error('No billing account yet.')
  const portal = await stripe<{ url: string }>('POST', 'billing_portal/sessions', {
    customer: user.stripe_customer_id,
    return_url: `${origin()}/app/billing`,
  })
  return { url: portal.url }
})
