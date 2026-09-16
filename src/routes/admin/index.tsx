import { createFileRoute } from '@tanstack/react-router'
import { getAdminOverview } from '~/functions/admin.fn'
import { rupees, shortDate } from '~/lib/money'
import { pageTitle } from '~/lib/site'

export const Route = createFileRoute('/admin/')({
  loader: () => getAdminOverview(),
  head: () => ({ meta: [{ title: pageTitle('Admin overview') }] }),
  component: Overview,
})

function Overview() {
  const o = Route.useLoaderData()

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-extrabold text-ink">Overview</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue, all time" value={rupees(o.revenueAll)} sub={`${o.paidCount} payments`} />
        <Stat label="Revenue, last 30 days" value={rupees(o.revenue30d)} />
        <Stat label="Pro accounts" value={String(o.proUsers)} sub={`of ${o.users} users`} />
        <Stat label="Open enquiries" value={String(o.enquiriesOpen)} sub={`${o.resumes} resumes built`} />
      </div>

      <section className="card p-5">
        <h2 className="font-display font-bold text-ink">Revenue, last 14 days</h2>
        <RevenueChart daily={o.daily} />
      </section>

      <section className="card p-5">
        <h2 className="font-display font-bold text-ink">Recent payments</h2>
        {o.recent.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="py-2 font-semibold">Account</th>
                  <th className="py-2 font-semibold">Paid</th>
                  <th className="py-2 font-semibold">Code</th>
                  <th className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {o.recent.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{p.email}</td>
                    <td className="py-2 pr-3 text-slate-600">{shortDate(p.paidAt * 1000)}</td>
                    <td className="py-2 pr-3 text-slate-600">
                      {p.offerCode ? (
                        <span className="rounded-[3px] bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-800">
                          {p.offerCode} −{rupees(p.discountPaise)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="num py-2 text-right font-semibold">{rupees(p.amountPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No payments yet.</p>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="text-[13px] font-bold text-ink">{label}</p>
      <p className="num mt-1 font-display text-2xl font-extrabold text-ink">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-slate-500">{sub}</p> : null}
    </div>
  )
}

/** Fills the gaps: the query only returns days that had a payment. */
function RevenueChart({ daily }: { daily: { day: string; paise: number; payments: number }[] }) {
  const byDay = new Map(daily.map((d) => [d.day, d.paise]))
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400_000)
    const key = d.toISOString().slice(0, 10)
    return { key, label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), paise: byDay.get(key) ?? 0 }
  })
  const max = Math.max(...days.map((d) => d.paise), 1)

  return (
    <div className="mt-4 flex items-end gap-1.5" style={{ height: 120 }}>
      {days.map((d) => (
        <div key={d.key} className="flex flex-1 flex-col items-center gap-1" title={`${d.label}: ${rupees(d.paise)}`}>
          <div
            className={`w-full rounded-t-[2px] ${d.paise ? 'bg-ink' : 'bg-slate-200'}`}
            style={{ height: `${Math.max(2, (d.paise / max) * 100)}%` }}
          />
          <span className="text-[10px] whitespace-nowrap text-slate-400">{d.label.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  )
}
