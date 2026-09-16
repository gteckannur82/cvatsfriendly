import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Plus, Power, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ErrorNote, Spinner } from '~/components/ui'
import { createOffer, deleteOffer, listOffers, setOfferActive } from '~/functions/admin.fn'
import { readError } from '~/lib/errors'
import { rupees, shortDate } from '~/lib/money'
import { PRO_PRICE_DISPLAY } from '~/lib/plans'
import { pageTitle } from '~/lib/site'

export const Route = createFileRoute('/admin/offers')({
  loader: () => listOffers(),
  head: () => ({ meta: [{ title: pageTitle('Admin offers') }] }),
  component: OffersPage,
})

function OffersPage() {
  const offers = Route.useLoaderData()
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusy(key)
    setError(null)
    try {
      await fn()
      await router.invalidate()
    } catch (err) {
      setError(readError(err).message)
    } finally {
      setBusy(null)
    }
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const expiry = String(fd.get('expiresAt') ?? '')
    const max = String(fd.get('maxRedemptions') ?? '')
    await run('create', async () => {
      await createOffer({
        data: {
          code: String(fd.get('code') ?? ''),
          kind: String(fd.get('kind') ?? 'percent') as 'percent' | 'flat',
          value: Number(fd.get('value') ?? 0),
          expiresAt: expiry ? new Date(expiry).getTime() : undefined,
          maxRedemptions: max ? Number(max) : undefined,
        },
      })
      form.reset()
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">Offers</h1>
        <p className="mt-1 text-sm text-slate-600">Discount codes customers enter at checkout. Pro normally costs {PRO_PRICE_DISPLAY} for 30 days.</p>
      </div>

      <form onSubmit={onCreate} className="card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <label className="label" htmlFor="code">
            Code
          </label>
          <input id="code" name="code" required maxLength={40} placeholder="LAUNCH50" className="input uppercase" />
        </div>
        <div>
          <label className="label" htmlFor="kind">
            Type
          </label>
          <select id="kind" name="kind" className="input">
            <option value="percent">Percent off</option>
            <option value="flat">Rupees off</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="value">
            Amount
          </label>
          <input id="value" name="value" type="number" min={1} required placeholder="50" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="expiresAt">
            Expires (optional)
          </label>
          <input id="expiresAt" name="expiresAt" type="date" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="maxRedemptions">
            Max uses (optional)
          </label>
          <input id="maxRedemptions" name="maxRedemptions" type="number" min={1} placeholder="100" className="input" />
        </div>
        <div className="sm:col-span-2 lg:col-span-5">
          <ErrorNote message={error} />
          <button className="btn-primary mt-1" disabled={busy === 'create'}>
            {busy === 'create' ? <Spinner /> : <Plus className="h-4 w-4" />} Create code
          </button>
        </div>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-2.5 font-semibold">Code</th>
              <th className="px-4 py-2.5 font-semibold">Discount</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 font-semibold">Expires</th>
              <th className="px-4 py-2.5 text-right font-semibold">Used</th>
              <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.code} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 font-mono font-semibold text-ink">{o.code}</td>
                <td className="px-4 py-2.5">{o.kind === 'percent' ? `${o.value}% off` : `${rupees(o.value)} off`}</td>
                <td className="px-4 py-2.5">
                  {o.active ? (
                    <span className="rounded-[3px] bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-800">Active</span>
                  ) : (
                    <span className="text-slate-500">Paused</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-600">{o.expiresAt ? shortDate(o.expiresAt) : '—'}</td>
                <td className="num px-4 py-2.5 text-right">
                  {o.timesRedeemed}
                  {o.maxRedemptions ? ` / ${o.maxRedemptions}` : ''}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      className="btn-outline btn-sm"
                      disabled={busy === o.code}
                      onClick={() => run(o.code, () => setOfferActive({ data: { code: o.code, active: !o.active } }))}
                    >
                      <Power className="h-3.5 w-3.5" /> {o.active ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      className="btn-ghost btn-sm text-slate-400 hover:text-red-600"
                      disabled={busy === o.code}
                      aria-label={`Delete ${o.code}`}
                      onClick={() => confirm(`Delete ${o.code}? Payments already made keep their discount.`) && run(o.code, () => deleteOffer({ data: { code: o.code } }))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {offers.length ? null : <p className="px-4 py-6 text-sm text-slate-600">No codes yet. Create one above.</p>}
      </div>
    </div>
  )
}
