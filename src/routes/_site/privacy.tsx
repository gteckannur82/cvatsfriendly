import { createFileRoute } from '@tanstack/react-router'
import { SITE, seo } from '~/lib/site'

export const Route = createFileRoute('/_site/privacy')({
  head: () => seo({ title: 'Privacy Policy', path: '/privacy' }),
  component: Privacy,
})

function Privacy() {
  return (
    <article className="container-page max-w-3xl space-y-5 py-16 leading-relaxed text-slate-700">
      <h1 className="font-display text-4xl font-extrabold text-ink">Privacy Policy</h1>
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        Template policy — have it reviewed for your jurisdiction (e.g. GDPR, CCPA) before launch.
      </p>
      <h2 className="font-display text-xl font-bold text-ink">What we collect</h2>
      <p>Your email address, a salted password hash, the resume content you enter, and — if you buy Pro — your mobile number and payment status from our payment processor.</p>
      <h2 className="font-display text-xl font-bold text-ink">How we use it</h2>
      <p>
        To provide the service: storing your resumes, generating PDFs, and running AI features. When you use an AI feature, the relevant resume text and job
        description are sent to our AI provider solely to generate the response.
      </p>
      <h2 className="font-display text-xl font-bold text-ink">Processors</h2>
      <p>Cloudflare (hosting and database), Cashfree Payments (payments), and our AI model provider. We do not sell your personal data.</p>
      <h2 className="font-display text-xl font-bold text-ink">Cookies</h2>
      <p>We use one essential, HttpOnly session cookie to keep you logged in. No advertising cookies.</p>
      <h2 className="font-display text-xl font-bold text-ink">Your rights</h2>
      <p>
        You can edit or delete your resumes at any time. To delete your account or export your data, contact{' '}
        <a className="text-brand-700 underline" href={`mailto:${SITE.supportEmail}`}>
          {SITE.supportEmail}
        </a>
        .
      </p>
    </article>
  )
}
