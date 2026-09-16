import { Check, Plus, Sparkles, Trash2, Wand2, X } from 'lucide-react'
import { useState } from 'react'
import { aiImproveRole, aiRewriteBullet } from '~/functions/ai.fn'
import { readError } from '~/lib/errors'
import { ErrorNote, Spinner } from '../ui'
import { useAccountGate } from './gate'

interface Props {
  bullets: string[]
  onChange: (next: string[]) => void
  position: string
  company: string
  jobDescription?: string
  placeholder?: string
  label?: string
}

export function BulletsEditor({ bullets, onChange, position, company, jobDescription, placeholder, label = 'Achievements (bullet points)' }: Props) {
  const [variants, setVariants] = useState<{ index: number; options: string[] } | null>(null)
  const [improved, setImproved] = useState<string[] | null>(null)
  const [loading, setLoading] = useState<number | 'all' | null>(null)
  const [error, setError] = useState<{ message: string; upgrade: boolean } | null>(null)
  const allowAi = useAccountGate()

  const set = (i: number, v: string) => onChange(bullets.map((b, j) => (j === i ? v : b)))
  const remove = (i: number) => onChange(bullets.filter((_, j) => j !== i))
  const nonEmpty = bullets.filter((b) => b.trim().length > 2)

  async function rewrite(i: number) {
    if (bullets[i].trim().length < 3) return setError({ message: 'Write a rough version first — AI will polish it.', upgrade: false })
    if (!allowAi()) return
    setLoading(i)
    setError(null)
    setImproved(null)
    try {
      const res = await aiRewriteBullet({ data: { bullet: bullets[i], position, company, jobDescription: jobDescription || undefined } })
      setVariants({ index: i, options: res.options })
    } catch (err) {
      setError(readError(err))
    } finally {
      setLoading(null)
    }
  }

  async function improveAll() {
    if (!nonEmpty.length) return setError({ message: 'Add at least one bullet first.', upgrade: false })
    if (!allowAi()) return
    setLoading('all')
    setError(null)
    setVariants(null)
    try {
      const res = await aiImproveRole({ data: { bullets: nonEmpty, position, company, jobDescription: jobDescription || undefined } })
      setImproved(res.bullets)
    } catch (err) {
      setError(readError(err))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="label mb-0">{label}</span>
        <button type="button" className="btn-ghost btn-sm text-brand-700" onClick={improveAll} disabled={loading !== null}>
          {loading === 'all' ? <Spinner className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />} Improve all with AI
        </button>
      </div>
      <div className="mt-2 space-y-2">
        {bullets.map((b, i) => (
          <div key={i}>
            <div className="flex items-start gap-1.5">
              <span className="mt-2.5 text-slate-400">•</span>
              <textarea
                rows={2}
                className="input min-h-[2.75rem] flex-1 resize-y py-2 leading-snug"
                value={b}
                placeholder={placeholder ?? 'e.g. Reduced onboarding time 40% by rebuilding the signup flow'}
                onChange={(e) => set(i, e.target.value)}
              />
              <div className="flex flex-col">
                <button type="button" className="btn-ghost btn-sm text-brand-700" title="Rewrite with AI" aria-label="Rewrite with AI" disabled={loading !== null} onClick={() => rewrite(i)}>
                  {loading === i ? <Spinner className="h-3.5 w-3.5" /> : <Wand2 className="h-3.5 w-3.5" />}
                </button>
                <button type="button" className="btn-ghost btn-sm text-slate-400 hover:text-red-600" title="Remove" aria-label="Remove bullet" onClick={() => remove(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {variants?.index === i ? (
              <div className="mt-2 ml-4 rounded-xl border border-brand-200 bg-brand-50/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-800">Pick a rewrite</span>
                  <button type="button" className="text-slate-500 hover:text-slate-800" onClick={() => setVariants(null)} aria-label="Dismiss">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {variants.options.map((o, k) => (
                    <button
                      type="button"
                      key={k}
                      className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-sm hover:border-brand-500"
                      onClick={() => {
                        set(i, o)
                        setVariants(null)
                      }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <button type="button" className="btn-ghost btn-sm mt-2" onClick={() => onChange([...bullets, ''])}>
        <Plus className="h-3.5 w-3.5" /> Add bullet
      </button>

      {improved ? (
        <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50/60 p-3">
          <p className="text-xs font-semibold text-brand-800">AI-improved bullets — review before accepting</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-800">
            {improved.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-brand-600">•</span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => {
                onChange(improved)
                setImproved(null)
              }}
            >
              <Check className="h-3.5 w-3.5" /> Replace bullets
            </button>
            <button type="button" className="btn-outline btn-sm" onClick={() => setImproved(null)}>
              Discard
            </button>
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="mt-2">
          <ErrorNote message={error.message} upgrade={error.upgrade} />
        </div>
      ) : null}
    </div>
  )
}
