import { createFileRoute } from '@tanstack/react-router'
import { SITE, seo } from '~/lib/site'

export const Route = createFileRoute('/_site/shipping')({
  head: () =>
    seo({
      title: 'Delivery Policy',
      description: `${SITE.name} is a digital service. How and when access is delivered after payment.`,
      path: '/shipping',
    }),
  component: Shipping,
})

function Shipping() {
  return (
    <article className="container-page max-w-3xl space-y-5 py-16 leading-relaxed text-slate-700">
      <h1 className="font-display text-4xl font-extrabold text-ink">Delivery Policy</h1>
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Template policy — have it reviewed by a lawyer before launch.</p>

      <h2 className="font-display text-xl font-bold text-ink">No physical shipment</h2>
      <p>
        {SITE.name} is a digital service delivered entirely over the web. Nothing is shipped, and no shipping address or delivery charge applies to any order.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">How access is delivered</h2>
      <p>
        Pro is delivered to the {SITE.name} account that paid for it. As soon as Cashfree confirms the payment — normally within a few seconds of completing it
        — the Pro limits and templates are active on that account, and the billing page shows the date Pro runs until.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">If access does not appear</h2>
      <p>
        Payment confirmation can occasionally lag. Reload the billing page first; if Pro is still not active a few minutes after a successful payment, email{' '}
        <a className="text-brand-700 underline" href={`mailto:${SITE.supportEmail}`}>
          {SITE.supportEmail}
        </a>{' '}
        with the date of payment and we will fix it or refund you.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">Your resume files</h2>
      <p>
        Resume PDFs are generated in your own browser and download directly to your device on both Free and Pro. They are not emailed or posted to you.
      </p>
    </article>
  )
}
