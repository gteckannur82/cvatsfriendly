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
    <section className="bg-desk py-16 sm:py-20">
      <div className="container-page">
        <div className="mx-auto mb-12 max-w-4xl">
          <h1 className="font-display text-[clamp(2.6rem,5vw,4rem)] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance text-ink">
            Pricing that fits a job search
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">Start free. Upgrade for a month while you’re applying, and cancel when you land the role.</p>
        </div>
        <PricingCards headingLevel={2} />
        <div className="mx-auto mt-16 grid max-w-4xl gap-x-12 border-t border-ink md:grid-cols-2">
          <div className="border-b border-slate-300 py-5">
            <h2 className="font-bold text-ink">What happens if I cancel?</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">You keep Pro until the end of the period. Your resumes and versions stay safe on the Free plan.</p>
          </div>
          <div className="border-b border-slate-300 py-5">
            <h2 className="font-bold text-ink">Is payment secure?</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">Payments are processed by Stripe. We never see or store your card details.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
