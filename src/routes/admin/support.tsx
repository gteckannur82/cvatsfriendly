import { createFileRoute } from '@tanstack/react-router'
import { Check, Mail, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { ErrorNote, Spinner } from '~/components/ui'
import { listEnquiries, resolveEnquiry } from '~/functions/admin.fn'
import { readError } from '~/lib/errors'
import { shortDate } from '~/lib/money'
import { pageTitle } from '~/lib/site'

type Status = 'open' | 'resolved' | 'all'

export const Route = createFileRoute('/admin/support')({
  loader: () => listEnquiries({ data: { status: 'open' } }),
  head: () => ({ meta: [{ title: pageTitle('Admin support') }] }),
  component: SupportPage,
})

function SupportPage() {
  const initial = Route.useLoaderData()
  const [items, setItems] = useState(initial)
  const [status, setStatus] = useState<Status>('open')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  async function reload(next: Status) {
    setStatus(next)
    setBusy('list')
    setError(null)
    try {
      setItems(await listEnquiries({ data: { status: next } }))
    } catch (err) {
      setError(readError(err).message)
    } finally {
      setBusy(null)
    }
  }

  async function toggle(id: string, resolved: boolean) {
    setBusy(id)
    setError(null)
    try {
      await resolveEnquiry({ data: { id, note: notes[id] ?? '', resolved } })
      setItems(await listEnquiries({ data: { status } }))
    } catch (err) {
      setError(readError(err).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-extrabold text-ink">Support enquiries</h1>

      <div className="flex gap-1.5">
        {(['open', 'resolved', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => reload(s)}
            className={`btn-sm rounded-[3px] px-3 py-1.5 text-xs font-semibold capitalize ${status === s ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {s}
          </button>
        ))}
        {busy === 'list' ? <Spinner className="ml-2 h-4 w-4 self-center text-slate-400" /> : null}
      </div>

      <ErrorNote message={error} />

      {items.length ? (
        <div className="space-y-3">
          {items.map((e) => (
            <article key={e.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-ink">{e.subject}</h2>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {e.name} ·{' '}
                    <a className="text-brand-700 underline" href={`mailto:${e.email}`}>
                      {e.email}
                    </a>{' '}
                    · {shortDate(e.createdAt)}
                    {e.hasAccount ? ' · has an account' : ' · no account'}
                  </p>
                </div>
                {e.status === 'resolved' ? (
                  <span className="rounded-[3px] bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800">Resolved</span>
                ) : (
                  <span className="rounded-[3px] border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">Open</span>
                )}
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{e.message}</p>

              {e.status === 'resolved' && e.adminNote ? (
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-semibold">Resolution note: </span>
                  {e.adminNote}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-end gap-2">
                <a className="btn-outline btn-sm" href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.subject}`)}`}>
                  <Mail className="h-3.5 w-3.5" /> Reply by email
                </a>
                {e.status === 'open' ? (
                  <>
                    <input
                      className="input h-9 max-w-xs flex-1 py-1"
                      placeholder="Resolution note (optional)"
                      value={notes[e.id] ?? ''}
                      onChange={(ev) => setNotes((n) => ({ ...n, [e.id]: ev.target.value }))}
                      aria-label={`Resolution note for ${e.subject}`}
                    />
                    <button className="btn-primary btn-sm" disabled={busy === e.id} onClick={() => toggle(e.id, true)}>
                      {busy === e.id ? <Spinner className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />} Mark resolved
                    </button>
                  </>
                ) : (
                  <button className="btn-outline btn-sm" disabled={busy === e.id} onClick={() => toggle(e.id, false)}>
                    {busy === e.id ? <Spinner className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />} Reopen
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="card p-6 text-sm text-slate-600">Nothing here — no {status === 'all' ? '' : status} enquiries.</p>
      )}
    </div>
  )
}
