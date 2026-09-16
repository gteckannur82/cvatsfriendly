import { Link, createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ErrorNote, Spinner } from '~/components/ui'
import { submitEnquiry } from '~/functions/support.fn'
import { readError } from '~/lib/errors'
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
        {SITE.name} is run by a small team. Send us a message below and we will reply by email — the same address handles accounts, payments and refunds.
      </p>

      <EnquiryForm />

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

function EnquiryForm() {
  const { user } = Route.useRouteContext()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setStatus('sending')
    setError(null)
    try {
      await submitEnquiry({
        data: {
          name: String(fd.get('name') ?? ''),
          email: String(fd.get('email') ?? ''),
          subject: String(fd.get('subject') ?? ''),
          message: String(fd.get('message') ?? ''),
        },
      })
      setStatus('sent')
    } catch (err) {
      setError(readError(err).message)
      setStatus('idle')
    }
  }

  if (status === 'sent')
    return (
      <div className="card flex items-start gap-3 p-5 not-prose">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
        <div>
          <p className="font-bold text-ink">Message sent</p>
          <p className="mt-1 text-sm text-slate-600">We reply within 2 business days, to the email address you gave.</p>
        </div>
      </div>
    )

  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Your name
          </label>
          <input id="name" name="name" required maxLength={100} defaultValue={user?.name ?? ''} className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required maxLength={200} defaultValue={user?.email ?? ''} className="input" autoComplete="email" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="subject">
          Subject
        </label>
        <input id="subject" name="subject" required maxLength={150} placeholder="Refund for a duplicate payment" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="message">
          How can we help?
        </label>
        <textarea id="message" name="message" required rows={5} maxLength={4000} className="input resize-y" />
      </div>
      <ErrorNote message={error} />
      <button className="btn-primary" disabled={status === 'sending'}>
        {status === 'sending' ? <Spinner /> : <Send className="h-4 w-4" />} Send message
      </button>
    </form>
  )
}
