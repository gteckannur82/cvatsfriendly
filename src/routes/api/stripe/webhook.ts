import { createFileRoute } from '@tanstack/react-router'
import { env } from '~/server/env'
import { applySubscription, stripe, verifyStripeSignature } from '~/server/stripe'

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = env.STRIPE_WEBHOOK_SECRET
        if (!secret) return new Response('Webhook secret not configured', { status: 500 })
        const payload = await request.text()
        if (!(await verifyStripeSignature(payload, request.headers.get('stripe-signature'), secret)))
          return new Response('Invalid signature', { status: 400 })

        const event = JSON.parse(payload) as { type: string; data: { object: any } }
        const obj = event.data.object
        try {
          switch (event.type) {
            case 'checkout.session.completed':
              if (obj.mode === 'subscription' && obj.subscription) {
                const sub = await stripe('GET', `subscriptions/${obj.subscription}`)
                await applySubscription(sub, obj.client_reference_id ?? obj.metadata?.user_id)
              }
              break
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
              await applySubscription(obj)
              break
          }
        } catch (err) {
          console.error('Stripe webhook handling failed', event.type, err)
          return new Response('Webhook handler error', { status: 500 })
        }
        return Response.json({ received: true })
      },
    },
  },
})
