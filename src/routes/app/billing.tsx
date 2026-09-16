import { createFileRoute, useRouter } from '@tanstack/react-router'
import { CheckCircle2, KeyRound, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { z } from 'zod'
import { PricingCards } from '~/components/PricingCards'
import { ErrorNote, Spinner } from '~/components/ui'
import { getAiUsage } from '~/functions/ai.fn'
import { changePassword } from '~/functions/auth.fn'
import { confirmProPayment, getBillingConfig, previewOffer, startProPayment } from '~/functions/billing.fn'
import { readError } from '~/lib/errors'
import { rupees } from '~/lib/money'
import { PRO_PRICE_DISPLAY, limitsFor } from '~/lib/plans'
import { pageTitle } from '~/lib/site'

export const Route = createFileRoute('/app/billing')({
  validateSearch: z.object({
    link_id: z.string().optional().catch(undefined),
  }),
  loader: async () => {
    const [config, usage] = await Promise.all([getBillingConfig(), getAiUsage()])
    return { config, usage }
  },
  head: () => ({ meta: [{ title: pageTitle('Account & billing') }] }),
  component: Billing,
})

function Billing() {
  const { user } = Route.useRouteContext()
  const { config, usage } = Route.useLoaderData()
  const search = Route.useSearch()
  const router = useRouter()
  const [pending, setPending] = useState<'checkout' | 'confirm' | null>(search.link_id ? 'confirm' : null)
  const [error, setError] = useState<{ message: string; upgrade: boolean } | null>(null)
  const [outcome, setOutcome] = useState<'paid' | 'unpaid' | null>(null)
  const [offer, setOffer] = useState<{ code: string; amountPaise: number; discountPaise: number } | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)
  const confirmed = useRef(false)

  useEffect(() => {
    if (!search.link_id || confirmed.current) return
    confirmed.current = true
    confirmProPayment({ data: { linkId: search.link_id } })
      .then(async (res) => {
        setOutcome(res.paid ? 'paid' : 'unpaid')
        await router.navigate({ to: '/app/billing', search: {}, replace: true })
        await router.invalidate()
      })
      .catch((err) => setError(readError(err)))
      .finally(() => setPending(null))
  }, [search.link_id, router])

  async function upgrade(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const phone = String(new FormData(e.currentTarget).get('phone') ?? '')
    setPending('checkout')
    setError(null)
    try {
      const { url } = await startProPayment({ data: { phone, code: offer?.code } })
      window.location.href = url
    } catch (err) {
      setError(readError(err))
      setPending(null)
    }
  }

  async function applyCode(code: string) {
    setCodeError(null)
    if (!code.trim()) return setOffer(null)
    try {
      setOffer(await previewOffer({ data: { code } }))
    } catch (err) {
      setOffer(null)
      setCodeError(readError(err).message)
    }
  }

  const isPro = user.plan === 'pro'
  const limits = limitsFor(user.plan)

  return (
    <main className="container-page max-w-5xl space-y-8 py-8 sm:py-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Account & billing</h1>
        <p className="mt-1 text-sm text-slate-600">{user.email}</p>
      </div>

      {config.sandbox ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Cashfree is in <strong>sandbox mode</strong>. Payments are simulated and no money moves.
        </p>
      ) : null}
      {outcome === 'unpaid' ? (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">No payment was completed, so your plan is unchanged.</p>
      ) : null}
      {outcome === 'paid' ? (
        <p className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">
          <CheckCircle2 className="h-4 w-4" /> Welcome to Pro! All templates and higher AI limits are unlocked for {config.periodDays} days.
        </p>
      ) : null}
      <ErrorNote message={error?.message ?? null} />

      <section className="card grid gap-6 p-6 md:grid-cols-3">
        <div>
          <p className="text-[13px] font-bold text-ink">Current plan</p>
          <p className="mt-1 flex items-center gap-2 font-display text-2xl font-extrabold text-ink">
            {isPro ? (
              <>
                Pro <Sparkles className="h-5 w-5 text-ink" aria-hidden="true" />
              </>
            ) : (
              'Free'
            )}
          </p>
          {isPro && user.currentPeriodEnd ? (
            <p className="mt-1 text-sm text-slate-600">Active until {new Date(user.currentPeriodEnd * 1000).toLocaleDateString()} · no auto-renewal</p>
          ) : null}
        </div>
        <div>
          <p className="text-[13px] font-bold text-ink">AI credits today</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-ink">
            <span className="num">{usage.used}</span> <span className="num text-base font-medium text-slate-600">/ {usage.limit}</span>
          </p>
          <div className="mt-2 h-2 bg-slate-200">
            <div className="h-2 bg-ink" style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }} />
          </div>
        </div>
        <div>
          <p className="text-[13px] font-bold text-ink">Limits</p>
          <p className="mt-1 text-sm text-slate-700">
            {limits.maxResumes} resumes · {limits.maxVersionsPerResume} versions each · {limits.proTemplates ? 'all templates' : '2 templates'}
          </p>
        </div>
      </section>

      {pending === 'confirm' ? (
        <div className="card flex items-center gap-3 p-6 text-slate-700">
          <Spinner /> Confirming your payment…
        </div>
      ) : null}

      {!isPro ? (
        <section>
          <h2 className="mb-6 text-center font-display text-xl font-bold text-ink">Upgrade to Pro</h2>
          <PricingCards
            proAction={
              <form onSubmit={upgrade} className="space-y-2">
                <label className="label" htmlFor="phone">
                  Mobile number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  defaultValue={user.phone ?? ''}
                  placeholder="9876543210"
                  autoComplete="tel"
                  className="input"
                />
                <label className="label" htmlFor="code">
                  Discount code (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    id="code"
                    name="code"
                    maxLength={40}
                    placeholder="LAUNCH50"
                    autoCapitalize="characters"
                    className="input uppercase"
                    onBlur={(e) => applyCode(e.target.value)}
                  />
                  <button type="button" className="btn-outline shrink-0" onClick={(e) => applyCode((e.currentTarget.form?.elements.namedItem('code') as HTMLInputElement)?.value ?? '')}>
                    Apply
                  </button>
                </div>
                {codeError ? <p className="text-xs text-red-700">{codeError}</p> : null}
                {offer ? (
                  <p className="text-xs font-semibold text-brand-800">
                    {offer.code} applied — {rupees(offer.discountPaise)} off, you pay {rupees(offer.amountPaise)}.
                  </p>
                ) : null}
                <button className="btn-primary w-full py-2.5" disabled={!!pending || !config.enabled}>
                  {pending === 'checkout' ? <Spinner /> : <Sparkles className="h-4 w-4" />}
                  {config.enabled ? `Pay ${offer ? rupees(offer.amountPaise) : PRO_PRICE_DISPLAY} with Cashfree` : 'Payments not configured'}
                </button>
                <p className="text-xs leading-relaxed text-slate-600">
                  Cashfree needs a mobile number for the payment receipt. One payment unlocks Pro for {config.periodDays} days — nothing auto-renews.
                </p>
              </form>
            }
          />
        </section>
      ) : null}

      <PasswordCard />
    </main>
  )
}

function PasswordCard() {
  const [status, setStatus] = useState<{ ok?: string; error?: string; pending?: boolean }>({})
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setStatus({ pending: true })
    try {
      await changePassword({ data: { current: String(fd.get('current')), next: String(fd.get('next')) } })
      form.reset()
      setStatus({ ok: 'Password updated.' })
    } catch (err) {
      setStatus({ error: readError(err).message })
    }
  }
  return (
    <section className="card p-6">
      <h2 className="flex items-center gap-2 font-display font-bold text-ink">
        <KeyRound className="h-4 w-4" /> Change password
      </h2>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="label" htmlFor="current">
            Current password
          </label>
          <input id="current" name="current" type="password" required className="input" autoComplete="current-password" />
        </div>
        <div>
          <label className="label" htmlFor="next">
            New password
          </label>
          <input id="next" name="next" type="password" required minLength={8} className="input" autoComplete="new-password" />
        </div>
        <button className="btn-dark" disabled={status.pending}>
          {status.pending ? <Spinner /> : null} Update
        </button>
      </form>
      <div className="mt-3">
        <ErrorNote message={status.error ?? null} />
        {status.ok ? <p className="text-sm text-brand-700">{status.ok}</p> : null}
      </div>
    </section>
  )
}
