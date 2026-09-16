import { createFileRoute } from '@tanstack/react-router'
import { reconcilePayment, reconcileUserPayments, verifyWebhookSignature } from '~/server/cashfree'

export const Route = createFileRoute('/api/cashfree/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text()
        const valid = await verifyWebhookSignature(raw, request.headers.get('x-webhook-signature'), request.headers.get('x-webhook-timestamp'))
        if (!valid) return new Response('Invalid signature', { status: 400 })

        const event = JSON.parse(raw) as {
          type?: string
          data?: { link?: { link_id?: string }; order?: { order_tags?: { link_id?: string } }; customer_details?: { customer_id?: string } }
        }
        if (!event.type?.startsWith('PAYMENT_SUCCESS')) return Response.json({ received: true })

        // The link id sits in different places depending on payment method, so
        // fall back to reconciling every open payment for the customer. Either
        // way the link is re-fetched from Cashfree before Pro is granted.
        const linkId = event.data?.link?.link_id ?? event.data?.order?.order_tags?.link_id
        const userId = event.data?.customer_details?.customer_id
        try {
          if (linkId) await reconcilePayment(linkId)
          else if (userId) await reconcileUserPayments(userId)
        } catch (err) {
          console.error('Cashfree webhook handling failed', event.type, err)
          return new Response('Webhook handler error', { status: 500 })
        }
        return Response.json({ received: true })
      },
    },
  },
})
