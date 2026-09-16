import { createFileRoute } from '@tanstack/react-router'
import { Search, Sparkles, Undo2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ErrorNote, Spinner } from '~/components/ui'
import { listUsers, setUserPlan } from '~/functions/admin.fn'
import { readError } from '~/lib/errors'
import { rupees, shortDate } from '~/lib/money'
import { pageTitle } from '~/lib/site'

export const Route = createFileRoute('/admin/users')({
  loader: () => listUsers({ data: { q: '' } }),
  head: () => ({ meta: [{ title: pageTitle('Admin users') }] }),
  component: UsersPage,
})

function UsersPage() {
  const initial = Route.useLoaderData()
  const [users, setUsers] = useState(initial)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = String(new FormData(e.currentTarget).get('q') ?? '')
    setBusy('search')
    setError(null)
    try {
      setUsers(await listUsers({ data: { q } }))
    } catch (err) {
      setError(readError(err).message)
    } finally {
      setBusy(null)
    }
  }

  async function changePlan(userId: string, plan: 'free' | 'pro') {
    setBusy(userId)
    setError(null)
    try {
      await setUserPlan({ data: { userId, plan } })
      setUsers(await listUsers({ data: { q: '' } }))
    } catch (err) {
      setError(readError(err).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-extrabold text-ink">Users</h1>

      <form onSubmit={search} className="flex gap-2">
        <input name="q" placeholder="Search by email or name" className="input max-w-sm" aria-label="Search users" />
        <button className="btn-outline" disabled={busy === 'search'}>
          {busy === 'search' ? <Spinner /> : <Search className="h-4 w-4" />} Search
        </button>
      </form>

      <ErrorNote message={error} />

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-2.5 font-semibold">Account</th>
              <th className="px-4 py-2.5 font-semibold">Plan</th>
              <th className="px-4 py-2.5 font-semibold">Joined</th>
              <th className="px-4 py-2.5 text-right font-semibold">Resumes</th>
              <th className="px-4 py-2.5 text-right font-semibold">Paid</th>
              <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5">
                  <div className="font-medium text-ink">{u.email}</div>
                  {u.name ? <div className="text-xs text-slate-500">{u.name}</div> : null}
                </td>
                <td className="px-4 py-2.5">
                  {u.plan === 'pro' ? (
                    <span className="rounded-[3px] border border-ink px-1.5 py-0.5 text-xs font-bold text-ink">Pro</span>
                  ) : (
                    <span className="text-slate-500">Free</span>
                  )}
                  {u.plan === 'pro' && u.currentPeriodEnd ? (
                    <div className="text-xs text-slate-500">until {shortDate(u.currentPeriodEnd * 1000)}</div>
                  ) : null}
                </td>
                <td className="px-4 py-2.5 text-slate-600">{shortDate(u.createdAt)}</td>
                <td className="num px-4 py-2.5 text-right">{u.resumes}</td>
                <td className="num px-4 py-2.5 text-right">{u.paidPaise ? rupees(u.paidPaise) : '—'}</td>
                <td className="px-4 py-2.5 text-right">
                  {u.plan === 'pro' ? (
                    <button className="btn-outline btn-sm" disabled={busy === u.id} onClick={() => changePlan(u.id, 'free')}>
                      {busy === u.id ? <Spinner className="h-3.5 w-3.5" /> : <Undo2 className="h-3.5 w-3.5" />} Revoke
                    </button>
                  ) : (
                    <button className="btn-outline btn-sm" disabled={busy === u.id} onClick={() => changePlan(u.id, 'pro')}>
                      {busy === u.id ? <Spinner className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />} Give 30 days
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length ? null : <p className="px-4 py-6 text-sm text-slate-600">No users match that search.</p>}
      </div>
    </div>
  )
}
