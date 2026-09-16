import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { AI_CREDIT_NOTE, PLAN_FEATURES, PRO_PRICE_DISPLAY } from '~/lib/plans'

/** Both plans as one rate sheet: two ruled columns, prices in tabular figures, features derived from PLAN_LIMITS. */
export function PricingCards({ proAction, headingLevel = 3 }: { proAction?: ReactNode; headingLevel?: 2 | 3 }) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="sheet grid md:grid-cols-2">
        <Plan
          name="Free"
          headingLevel={headingLevel}
          blurb="Everything you need for one strong resume."
          price="₹0"
          period="forever"
          features={PLAN_FEATURES.free}
          action={
            <Link to="/signup" className="btn-outline w-full py-3">
              Build my resume
            </Link>
          }
        />
        <Plan
          name="Pro"
          headingLevel={headingLevel}
          blurb="For an active search with many applications."
          price={PRO_PRICE_DISPLAY}
          period="for 30 days"
          features={PLAN_FEATURES.pro}
          markDifferences
          action={
            proAction ?? (
              <Link to="/signup" search={{ plan: 'pro' }} className="btn-primary w-full py-3">
                Get Pro
              </Link>
            )
          }
          divided
        />
      </div>
      <p className="mt-5 text-sm leading-relaxed text-ink-soft">{AI_CREDIT_NOTE}</p>
    </div>
  )
}

function Plan({
  name,
  blurb,
  price,
  period,
  features,
  action,
  divided,
  markDifferences,
  headingLevel,
}: {
  name: string
  blurb: string
  price: string
  period: string
  features: string[]
  action: ReactNode
  divided?: boolean
  /** Set the first figure in each feature in heavy ink, e.g. the "150" in "150 AI credits a day". Highlighter colours stay reserved for keyword marks. */
  markDifferences?: boolean
  headingLevel: 2 | 3
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <div className={`flex flex-col p-6 sm:p-8 ${divided ? 'border-t border-slate-200 md:border-t-0 md:border-l' : ''}`}>
      <Heading className="font-display text-2xl font-extrabold tracking-[-0.02em] text-ink">{name}</Heading>
      <p className="mt-1 text-[15px] text-ink-soft">{blurb}</p>
      <p className="mt-6 flex items-baseline gap-2 border-b border-ink pb-5">
        <span className="num text-5xl font-medium text-ink">{price}</span>
        <span className="text-[15px] text-ink-soft">{period}</span>
      </p>
      <ul className="flex-1 text-[15px] text-ink">
        {features.map((f) => (
          <li key={f} className="border-b border-slate-200 py-2.5">
            {markDifferences ? markFirstFigure(f) : f}
          </li>
        ))}
      </ul>
      <div className="mt-6">{action}</div>
    </div>
  )
}

function markFirstFigure(text: string): ReactNode {
  const m = text.match(/\b(All \d+|\d+)\b/)
  if (!m || m.index === undefined) return text
  return (
    <>
      {text.slice(0, m.index)}
      <strong className="font-extrabold">{m[0]}</strong>
      {text.slice(m.index + m[0].length)}
    </>
  )
}
