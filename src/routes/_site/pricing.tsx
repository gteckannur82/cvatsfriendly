import { createFileRoute } from '@tanstack/react-router'
import { PricingCards } from '~/components/PricingCards'
import { seo } from '~/lib/site'

export const Route = createFileRoute('/_site/pricing')({
  head: () =>
    seo({
      title: 'Pricing',
      description: 'Build an ATS-friendly resume free. Upgrade to Pro for all templates, more AI rewrites, job tailoring and unlimited versions.',
      path: '/pricing',
    }),
  component: Pricing,
})

function Pricing() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Pricing that fits a job search</h1>
          <p className="mt-4 text-lg text-slate-600">Start free. Upgrade for a month while you’re applying, and cancel when you land the role.</p>
        </div>
        <PricingCards />
        <div className="mx-auto mt-16 grid max-w-4xl gap-8 text-sm text-slate-600 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-ink">What counts as an AI credit?</h2>
            <p className="mt-2">Rewriting a bullet, improving a role or writing a summary uses 1 credit. Tailoring a whole resume to a job uses 3.</p>
          </div>
          <div>
            <h2 className="font-semibold text-ink">What happens if I cancel?</h2>
            <p className="mt-2">You keep Pro until the end of the period. Your resumes and versions stay safe on the Free plan.</p>
          </div>
          <div>
            <h2 className="font-semibold text-ink">Is payment secure?</h2>
            <p className="mt-2">Payments are processed by Stripe. We never see or store your card details.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
