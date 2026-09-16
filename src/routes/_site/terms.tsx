import { Link, createFileRoute } from '@tanstack/react-router'
import { PRO_PRICE_DISPLAY } from '~/lib/plans'
import { SITE, seo } from '~/lib/site'

export const Route = createFileRoute('/_site/terms')({
  head: () => seo({ title: 'Terms of Service', path: '/terms' }),
  component: Terms,
})

function Terms() {
  return (
    <article className="container-page max-w-3xl space-y-5 py-16 leading-relaxed text-slate-700">
      <h1 className="font-display text-4xl font-extrabold text-ink">Terms of Service</h1>
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Template terms — have them reviewed by a lawyer before launch.</p>
      <h2 className="font-display text-xl font-bold text-ink">The service</h2>
      <p>{SITE.name} provides tools to write, format and export resumes. We don’t guarantee interviews or employment outcomes.</p>
      <h2 className="font-display text-xl font-bold text-ink">Your content</h2>
      <p>
        You own your resume content and are responsible for its accuracy. AI suggestions may contain errors; review every change before using it in an
        application.
      </p>
      <h2 className="font-display text-xl font-bold text-ink">Payments</h2>
      <p>
        Pro costs {PRO_PRICE_DISPLAY} for 30 days. It is a one-time payment: nothing auto-renews and no payment instrument is stored or charged again by us.
        When the 30 days end your account returns to the Free plan and your saved resumes remain accessible. Payments are collected in Indian Rupees by
        Cashfree Payments; refunds are handled under our{' '}
        <Link to="/refund-policy" className="text-brand-700 underline">
          Refund &amp; Cancellation Policy
        </Link>
        .
      </p>
      <h2 className="font-display text-xl font-bold text-ink">Acceptable use</h2>
      <p>Don’t misuse the service, attempt to circumvent usage limits, or use it to create fraudulent documents.</p>
      <h2 className="font-display text-xl font-bold text-ink">Governing law</h2>
      <p>These terms are governed by the laws of India, and the courts of India have exclusive jurisdiction over any dispute arising from them.</p>
      <h2 className="font-display text-xl font-bold text-ink">Contact</h2>
      <p>
        <a className="text-brand-700 underline" href={`mailto:${SITE.supportEmail}`}>
          {SITE.supportEmail}
        </a>
      </p>
    </article>
  )
}
