import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { PLAN_FEATURES, PRO_PRICE_DISPLAY } from '~/lib/plans'

export function PricingCards({ proAction }: { proAction?: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      <div className="card flex flex-col p-7">
        <h3 className="font-display text-lg font-bold text-ink">Free</h3>
        <p className="mt-1 text-sm text-slate-600">Everything you need for one strong resume.</p>
        <p className="mt-5 font-display text-4xl font-extrabold text-ink">
          $0<span className="text-base font-medium text-slate-500"> / forever</span>
        </p>
        <ul className="mt-6 flex-1 space-y-3 text-sm">
          {PLAN_FEATURES.free.map((f) => (
            <li key={f} className="flex gap-2">
              <Check className="h-5 w-5 shrink-0 text-brand-600" /> {f}
            </li>
          ))}
        </ul>
        <Link to="/signup" className="btn-outline mt-8 w-full py-2.5">
          Start free
        </Link>
      </div>
      <div className="relative flex flex-col rounded-2xl border-2 border-brand-600 bg-white p-7 shadow-lg shadow-brand-600/10">
        <span className="absolute -top-3 right-6 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">Most popular</span>
        <h3 className="font-display text-lg font-bold text-ink">Pro</h3>
        <p className="mt-1 text-sm text-slate-600">For an active job search with many applications.</p>
        <p className="mt-5 font-display text-4xl font-extrabold text-ink">
          {PRO_PRICE_DISPLAY}
          <span className="text-base font-medium text-slate-500"> / month</span>
        </p>
        <ul className="mt-6 flex-1 space-y-3 text-sm">
          {PLAN_FEATURES.pro.map((f) => (
            <li key={f} className="flex gap-2">
              <Check className="h-5 w-5 shrink-0 text-brand-600" /> {f}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          {proAction ?? (
            <Link to="/signup" search={{ plan: 'pro' }} className="btn-primary w-full py-2.5">
              Get Pro
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
