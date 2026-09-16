import { Link, createFileRoute } from '@tanstack/react-router'
import { SITE, seo } from '~/lib/site'

export const Route = createFileRoute('/_site/contact')({
  head: () =>
    seo({
      title: 'Contact us',
      description: `How to reach the ${SITE.name} team about your account, a payment or a refund.`,
      path: '/contact',
    }),
  component: Contact,
})

function Contact() {
  return (
    <article className="container-page max-w-3xl space-y-5 py-16 leading-relaxed text-slate-700">
      <h1 className="font-display text-4xl font-extrabold text-ink">Contact us</h1>
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        Before going live with payments: add the registered business name, address and phone number below. Cashfree checks this page during merchant review and
        will ask for them.
      </p>

      <p>
        {SITE.name} is run by a small team. Email is the fastest way to reach a human, and the same address handles accounts, payments and refunds.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">Email</h2>
      <p>
        <a className="text-brand-700 underline" href={`mailto:${SITE.supportEmail}`}>
          {SITE.supportEmail}
        </a>
      </p>
      <p>
        We reply within 2 business days. For a payment or refund question, send the email from the address on your account and include the date of payment — see
        the{' '}
        <Link className="text-brand-700 underline" to="/refund-policy">
          Refund &amp; Cancellation Policy
        </Link>
        .
      </p>

      <h2 className="font-display text-xl font-bold text-ink">Registered address</h2>
      <p className="text-slate-500 italic">To be added before payments go live.</p>

      <h2 className="font-display text-xl font-bold text-ink">Phone</h2>
      <p className="text-slate-500 italic">To be added before payments go live.</p>

      <h2 className="font-display text-xl font-bold text-ink">What we can help with</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Account access, email changes and account deletion</li>
        <li>Payments, invoices and refunds</li>
        <li>Bugs in the editor, ATS check or PDF export</li>
      </ul>
      <p>
        We can’t review your resume, apply to jobs for you, or tell you whether a specific employer’s ATS will accept a document — the ATS check and keyword
        match in the app are the tools we offer for that.
      </p>
    </article>
  )
}
