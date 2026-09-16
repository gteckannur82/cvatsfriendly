import { Eye, History, RotateCcw, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { deleteVersion, getVersion, listVersions, type VersionSummary } from '~/functions/resumes.fn'
import { readError } from '~/lib/errors'
import type { ResumeData } from '~/lib/resume/schema'
import { getTheme } from '~/lib/resume/themes'
import { ScaledResume } from '../preview/ResumeHtml'
import { ErrorNote, Modal, Spinner } from '../ui'

interface Props {
  open: boolean
  onClose: () => void
  resumeId: string
  onSave: (label: string) => Promise<void>
  onRestore: (data: ResumeData, template: string, label: string) => Promise<void>
}

export function VersionsModal({ open, onClose, resumeId, onSave, onRestore }: Props) {
  const [versions, setVersions] = useState<VersionSummary[] | null>(null)
  const [label, setLabel] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<{ message: string; upgrade: boolean } | null>(null)
  const [preview, setPreview] = useState<{ id: string; label: string; data: ResumeData; template: string } | null>(null)

  const refresh = () =>
    listVersions({ data: { resumeId } })
      .then(setVersions)
      .catch((err) => setError(readError(err)))

  useEffect(() => {
    if (open) {
      setPreview(null)
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resumeId])

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusy(key)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(readError(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={preview ? `Preview: ${preview.label}` : 'Saved versions'} wide={!!preview}>
      {preview ? (
        <div className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto rounded-lg bg-slate-100 p-3">
            <ScaledResume data={preview.data} theme={getTheme(preview.template)} />
          </div>
          <div className="flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!!busy}
              onClick={() =>
                run('restore', async () => {
                  await onRestore(preview.data, preview.template, preview.label)
                  onClose()
                })
              }
            >
              {busy === 'restore' ? <Spinner /> : <RotateCcw className="h-4 w-4" />} Restore this version
            </button>
            <button className="btn-outline" onClick={() => setPreview(null)}>
              Back
            </button>
          </div>
          <ErrorNote message={error?.message ?? null} upgrade={error?.upgrade} />
        </div>
      ) : (
        <div className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!label.trim()) return
              run('save', async () => {
                await onSave(label.trim())
                setLabel('')
                await refresh()
              })
            }}
          >
            <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Version name, e.g. Before Google application" maxLength={120} />
            <button className="btn-dark shrink-0" disabled={!label.trim() || !!busy}>
              {busy === 'save' ? <Spinner /> : <Save className="h-4 w-4" />} Save
            </button>
          </form>
          <ErrorNote message={error?.message ?? null} upgrade={error?.upgrade} />
          {versions === null ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center text-sm text-slate-500">
              <History className="mb-2 h-6 w-6" />
              No saved versions yet. Save a snapshot before big changes or before tailoring for a job.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {versions.map((v) => (
                <li key={v.id} className="flex items-center gap-2 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{v.label}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(v.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} · {getTheme(v.template).name}
                    </p>
                  </div>
                  <button
                    className="btn-ghost btn-sm"
                    title="Preview"
                    aria-label="Preview"
                    disabled={!!busy}
                    onClick={() =>
                      run(v.id, async () => {
                        const full = await getVersion({ data: { id: v.id } })
                        setPreview(full)
                      })
                    }
                  >
                    {busy === v.id ? <Spinner className="h-3.5 w-3.5" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    className="btn-ghost btn-sm text-red-600"
                    title="Delete"
                    aria-label="Delete version"
                    disabled={!!busy}
                    onClick={() => {
                      if (confirm(`Delete version “${v.label}”?`))
                        run(`del-${v.id}`, async () => {
                          await deleteVersion({ data: { id: v.id } })
                          await refresh()
                        })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  )
}
