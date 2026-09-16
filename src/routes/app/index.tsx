import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Copy, FilePlus2, FileText, History, MoreVertical, Sparkles, Trash2, Upload, Wand2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { ErrorNote, Modal, Spinner } from '~/components/ui'
import { createResume, deleteResume, duplicateResume, listResumes } from '~/functions/resumes.fn'
import { readError } from '~/lib/errors'
import { limitsFor } from '~/lib/plans'
import { fromRenderCvYaml } from '~/lib/resume/rendercv-yaml'
import { getTheme } from '~/lib/resume/themes'
import { pageTitle } from '~/lib/site'

export const Route = createFileRoute('/app/')({
  loader: () => listResumes(),
  head: () => ({ meta: [{ title: pageTitle('My resumes') }] }),
  component: Dashboard,
})

const timeAgo = (ts: number) => {
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function Dashboard() {
  const resumes = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const router = useRouter()
  const limits = limitsFor(user.plan)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<{ message: string; upgrade: boolean } | null>(null)
  const [menu, setMenu] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function create(source: 'blank' | 'sample' | 'import', data?: unknown) {
    setBusy(source)
    setError(null)
    try {
      const { id } = await createResume({ data: { source, data } })
      await router.navigate({ to: '/app/resume/$id', params: { id } })
    } catch (err) {
      setError(readError(err))
      setBusy(null)
    }
  }

  async function onImport(file: File) {
    try {
      const text = await file.text()
      const data = file.name.endsWith('.json') ? JSON.parse(text) : fromRenderCvYaml(text)
      await create('import', data)
    } catch (err) {
      setError({ message: `Could not import this file: ${readError(err).message}`, upgrade: false })
    }
  }

  async function act(id: string, action: 'duplicate' | 'delete') {
    setMenu(null)
    if (action === 'delete' && !confirm('Delete this resume and all its saved versions? This cannot be undone.')) return
    setBusy(id)
    setError(null)
    try {
      if (action === 'duplicate') await duplicateResume({ data: { id } })
      else await deleteResume({ data: { id } })
      await router.invalidate()
    } catch (err) {
      setError(readError(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className="container-page py-8 sm:py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">My resumes</h1>
          <p className="mt-1 text-sm text-slate-600">
            {resumes.length} of {limits.maxResumes} resumes used · keep a tailored copy for each application.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <FilePlus2 className="h-4 w-4" /> New resume
        </button>
      </div>

      <div className="mt-6">
        <ErrorNote message={error?.message ?? null} upgrade={error?.upgrade} />
      </div>

      {resumes.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <FileText className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-ink">Create your first resume</h2>
          <p className="mt-2 max-w-md text-slate-600">Start from a blank guided form, or explore the editor with a filled-in sample.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="btn-primary" disabled={!!busy} onClick={() => create('blank')}>
              {busy === 'blank' ? <Spinner /> : <FilePlus2 className="h-4 w-4" />} Start from scratch
            </button>
            <button className="btn-outline" disabled={!!busy} onClick={() => create('sample')}>
              {busy === 'sample' ? <Spinner /> : <Wand2 className="h-4 w-4" />} Try with sample data
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <div key={r.id} className="card relative flex flex-col p-5 transition hover:shadow-md">
              <Link to="/app/resume/$id" params={{ id: r.id }} className="absolute inset-0 rounded-2xl" aria-label={`Open ${r.title}`} />
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="relative z-10">
                  <button className="btn-ghost btn-sm" onClick={() => setMenu(menu === r.id ? null : r.id)} aria-label="Resume actions">
                    {busy === r.id ? <Spinner /> : <MoreVertical className="h-4 w-4" />}
                  </button>
                  {menu === r.id ? (
                    <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                      <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50" onClick={() => act(r.id, 'duplicate')}>
                        <Copy className="h-4 w-4" /> Duplicate
                      </button>
                      <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50" onClick={() => act(r.id, 'delete')}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              <h2 className="mt-4 truncate font-display text-lg font-bold text-ink">{r.title}</h2>
              <p className="truncate text-sm text-slate-600">{r.headline || 'No headline yet'}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>{getTheme(r.template).name} template</span>
                <span className="inline-flex items-center gap-1">
                  <History className="h-3.5 w-3.5" /> {r.versionCount} versions
                </span>
                <span>Edited {timeAgo(r.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {user.plan !== 'pro' ? (
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display font-bold text-ink">
              <Sparkles className="h-4 w-4 text-brand-600" /> Applying to lots of jobs?
            </h2>
            <p className="mt-1 text-sm text-slate-600">Pro unlocks all templates, 150 AI credits a day, and up to 50 tailored resumes.</p>
          </div>
          <Link to="/app/billing" className="btn-primary">
            See Pro
          </Link>
        </div>
      ) : null}

      <Modal open={creating} onClose={() => setCreating(false)} title="New resume">
        <div className="grid gap-3">
          {[
            { key: 'blank' as const, icon: FilePlus2, title: 'Start from scratch', text: 'A guided, step-by-step form.' },
            { key: 'sample' as const, icon: Wand2, title: 'Start from sample', text: 'A complete example you can overwrite.' },
          ].map((o) => (
            <button key={o.key} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-brand-500 hover:bg-brand-50/40" disabled={!!busy} onClick={() => create(o.key)}>
              {busy === o.key ? <Spinner className="h-5 w-5" /> : <o.icon className="h-5 w-5 text-brand-700" />}
              <span>
                <span className="block font-semibold text-ink">{o.title}</span>
                <span className="text-sm text-slate-600">{o.text}</span>
              </span>
            </button>
          ))}
          <button className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 p-4 text-left hover:border-brand-500" disabled={!!busy} onClick={() => fileRef.current?.click()}>
            {busy === 'import' ? <Spinner className="h-5 w-5" /> : <Upload className="h-5 w-5 text-brand-700" />}
            <span>
              <span className="block font-semibold text-ink">Import a file</span>
              <span className="text-sm text-slate-600">RenderCV YAML (.yaml) or a JSON export from this app.</span>
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".yaml,.yml,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onImport(f)
              e.target.value = ''
            }}
          />
          <ErrorNote message={error?.message ?? null} upgrade={error?.upgrade} />
        </div>
      </Modal>
    </main>
  )
}
