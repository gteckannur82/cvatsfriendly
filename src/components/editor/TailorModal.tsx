import { Check, Copy, Plus, Sparkles, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import { aiTailorResume } from '~/functions/ai.fn'
import type { TailorResult } from '~/server/ai'
import { readError } from '~/lib/errors'
import { AI_CREDIT_COST } from '~/lib/plans'
import { keywordMatch } from '~/lib/resume/ats'
import { uid, type ResumeData } from '~/lib/resume/schema'
import { Swipe } from '../marks'
import { ErrorNote, Modal, Spinner } from '../ui'

interface Props {
  open: boolean
  onClose: () => void
  data: ResumeData
  jobDescription: string
  setJobDescription: (v: string) => void
  onApply: (next: ResumeData, label: string) => Promise<void>
  onSaveCopy: (next: ResumeData, label: string) => Promise<void>
}

export function applyTailoring(data: ResumeData, result: TailorResult, pick: { summary: boolean; roles: Set<string>; skills: Set<string> }): ResumeData {
  const next: ResumeData = structuredClone(data)
  if (pick.summary && result.summary) next.summary = result.summary
  for (const r of result.experience) {
    if (!pick.roles.has(r.id)) continue
    const exp = next.experience.find((e) => e.id === r.id)
    if (exp && r.highlights.length) exp.highlights = r.highlights
  }
  const skills = result.skillsToAdd.filter((s) => pick.skills.has(s))
  if (skills.length) {
    const existing = next.skills.find((s) => /additional|other|tools/i.test(s.label))
    if (existing) existing.details = [existing.details, ...skills].filter(Boolean).join(', ')
    else next.skills.push({ id: uid(), label: 'Additional', details: skills.join(', ') })
  }
  return next
}

export function TailorModal({ open, onClose, data, jobDescription, setJobDescription, onApply, onSaveCopy }: Props) {
  const [result, setResult] = useState<TailorResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<'apply' | 'copy' | null>(null)
  const [error, setError] = useState<{ message: string; upgrade: boolean } | null>(null)
  const [pickSummary, setPickSummary] = useState(true)
  const [roles, setRoles] = useState<Set<string>>(new Set())
  const [skills, setSkills] = useState<Set<string>>(new Set())
  const [label, setLabel] = useState('')

  const match = useMemo(() => (jobDescription.trim().length > 40 ? keywordMatch(data, jobDescription) : null), [data, jobDescription])
  const tailoredMatch = useMemo(() => {
    if (!result || !match) return null
    return keywordMatch(applyTailoring(data, result, { summary: pickSummary, roles, skills }), jobDescription)
  }, [result, match, data, pickSummary, roles, skills, jobDescription])

  async function tailor() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await aiTailorResume({ data: { resume: data, jobDescription } })
      setResult(res)
      setPickSummary(!!res.summary)
      setRoles(new Set(res.experience.map((e) => e.id)))
      setSkills(new Set(res.skillsToAdd))
    } catch (err) {
      setError(readError(err))
    } finally {
      setLoading(false)
    }
  }

  async function finish(kind: 'apply' | 'copy') {
    if (!result) return
    setSaving(kind)
    setError(null)
    try {
      const next = applyTailoring(data, result, { summary: pickSummary, roles, skills })
      const name = label.trim() || 'Tailored resume'
      await (kind === 'apply' ? onApply(next, name) : onSaveCopy(next, name))
      setResult(null)
      onClose()
    } catch (err) {
      setError(readError(err))
    } finally {
      setSaving(null)
    }
  }

  const toggle = (set: Set<string>, v: string) => {
    const n = new Set(set)
    n.has(v) ? n.delete(v) : n.add(v)
    return n
  }

  return (
    <Modal open={open} onClose={onClose} title="Tailor to a job description" wide>
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="jd">
            Paste the job description
          </label>
          <textarea
            id="jd"
            rows={result ? 4 : 9}
            className="input resize-y text-sm"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full posting: responsibilities, requirements and nice-to-haves…"
          />
          <p className="mt-1 text-xs text-slate-500">It’s also used to guide AI bullet rewrites while this editor is open.</p>
        </div>

        {match ? (
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Target className="h-4 w-4 text-brand-600" /> Keyword match
              </span>
              <span className="font-display text-xl font-extrabold text-ink">
                {match.score}%{tailoredMatch ? <span className="ml-2 text-sm font-semibold text-brand-700">→ {tailoredMatch.score}% after tailoring</span> : null}
              </span>
            </div>
            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-ink">
              {match.matched.slice(0, 18).map((k) => (
                <Swipe key={k}>{k}</Swipe>
              ))}
              {match.missing.slice(0, 18).map((k) => (
                <Swipe key={k} kind="missing">
                  {k}
                </Swipe>
              ))}
            </p>
            <p className="mt-2 text-[13px] text-slate-600">Yellow: already in your resume. Pink: missing, add only if true.</p>
          </div>
        ) : null}

        <ErrorNote message={error?.message ?? null} upgrade={error?.upgrade} />

        {!result ? (
          <button className="btn-primary w-full py-2.5" disabled={loading || jobDescription.trim().length < 50} onClick={tailor}>
            {loading ? <Spinner /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Tailoring your resume…' : `Tailor with AI (${AI_CREDIT_COST.tailorResume} credits)`}
          </button>
        ) : (
          <div className="space-y-4">
            {result.summary ? (
              <label className="flex gap-3 rounded-xl border border-slate-200 p-3">
                <input type="checkbox" className="mt-1 accent-brand-600" checked={pickSummary} onChange={(e) => setPickSummary(e.target.checked)} />
                <span>
                  <span className="block text-[13px] font-bold text-ink">New summary</span>
                  <span className="text-sm text-slate-800">{result.summary}</span>
                </span>
              </label>
            ) : null}
            {result.experience.map((r) => {
              const exp = data.experience.find((e) => e.id === r.id)
              if (!exp) return null
              return (
                <label key={r.id} className="flex gap-3 rounded-xl border border-slate-200 p-3">
                  <input type="checkbox" className="mt-1 accent-brand-600" checked={roles.has(r.id)} onChange={() => setRoles((s) => toggle(s, r.id))} />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold text-ink">
                      {exp.position} · {exp.company}
                    </span>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-800">
                      {r.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </span>
                </label>
              )
            })}
            {result.skillsToAdd.length ? (
              <div className="rounded-xl border border-slate-200 p-3">
                <span className="block text-[13px] font-bold text-ink">Add to skills</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.skillsToAdd.map((s) => (
                    <label key={s} className={`inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-[3px] border px-2.5 text-xs ${skills.has(s) ? 'border-ink bg-mark-tint text-ink' : 'border-slate-300 text-slate-700'}`}>
                      <input type="checkbox" className="sr-only" checked={skills.has(s)} onChange={() => setSkills((x) => toggle(x, s))} />
                      {skills.has(s) ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            {result.missingKeywords.length || result.notes.length ? (
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-ink">
                {result.missingKeywords.length ? (
                  <p>
                    <strong>Not evidenced in your resume:</strong>{' '}
                    {result.missingKeywords.map((k, i) => (
                      <span key={k}>
                        {i ? ', ' : null}
                        <Swipe kind="missing">{k}</Swipe>
                      </span>
                    ))}
                    . Add them only if they’re true.
                  </p>
                ) : null}
                {result.notes.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {result.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
            <div>
              <label className="label" htmlFor="tailor-label">
                Name this version
              </label>
              <input id="tailor-label" className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Acme – Senior Engineer" />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button className="btn-primary flex-1" disabled={!!saving} onClick={() => finish('apply')}>
                {saving === 'apply' ? <Spinner /> : <Sparkles className="h-4 w-4" />} Apply here (backup saved)
              </button>
              <button className="btn-outline flex-1" disabled={!!saving} onClick={() => finish('copy')}>
                {saving === 'copy' ? <Spinner /> : <Copy className="h-4 w-4" />} Save as new copy
              </button>
            </div>
            <button className="btn-ghost btn-sm w-full" onClick={() => setResult(null)}>
              Start over
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
