import { createFileRoute } from '@tanstack/react-router'
import { PRO_PRICE_DISPLAY } from '~/lib/plans'
import { SITE, seo } from '~/lib/site'

export const Route = createFileRoute('/_site/refund-policy')({
  head: () =>
    seo({
      title: 'Refund & Cancellation Policy',
      description: `How refunds and cancellations work for ${SITE.name} Pro, including how to request one and how long it takes.`,
      path: '/refund-policy',
    }),
  component: RefundPolicy,
})

function RefundPolicy() {
  return (
    <article className="container-page max-w-3xl space-y-5 py-16 leading-relaxed text-slate-700">
      <h1 className="font-display text-4xl font-extrabold text-ink">Refund &amp; Cancellation Policy</h1>
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Template policy — have it reviewed by a lawyer before launch.</p>

      <h2 className="font-display text-xl font-bold text-ink">What you are buying</h2>
      <p>
        {SITE.name} Pro costs {PRO_PRICE_DISPLAY} and unlocks the Pro limits and templates for 30 days. It is a single payment, not a subscription: nothing
        auto-renews, and we never charge a saved payment method again.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">Cancellation</h2>
      <p>
        Because there is no recurring charge, there is nothing to cancel. If you do nothing, Pro simply ends after 30 days and your account returns to the Free
        plan. Your resumes and saved versions stay in your account and remain editable and exportable on Free, subject to the Free plan limits.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">Refunds</h2>
      <p>We will refund your payment in full if:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>you were charged more than once for the same 30-day period, or</li>
        <li>money left your account but Pro was not unlocked, or</li>
        <li>you ask within 7 days of payment and have used no more than 5 AI credits in that time.</li>
      </ul>
      <p>
        After 7 days, or once more than 5 AI credits have been used, the payment is non-refundable except where refund is required by law. We do not refund on
        the basis of job-search outcomes: {SITE.name} formats and improves your resume, and cannot guarantee interviews or offers.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">How to request a refund</h2>
      <p>
        Email{' '}
        <a className="text-brand-700 underline" href={`mailto:${SITE.supportEmail}`}>
          {SITE.supportEmail}
        </a>{' '}
        from the address on your account, with the date of payment. We reply to refund requests within 2 business days.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">How refunds are paid</h2>
      <p>
        Approved refunds are returned through Cashfree Payments to the original payment method. Cashfree typically settles a refund within 5–7 business days,
        after which your bank or card issuer may take a further few days to show it.
      </p>
    </article>
  )
}
