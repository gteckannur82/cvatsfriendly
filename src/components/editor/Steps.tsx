import { Link } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, Check, Lock, Sparkles } from 'lucide-react'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { aiWriteSummary } from '~/functions/ai.fn'
import { readError } from '~/lib/errors'
import { formatDateRange } from '~/lib/resume/format'
import {
  emptyCertification,
  emptyEducation,
  emptyExperience,
  emptyProject,
  emptySkill,
  SECTION_TITLES,
  type ResumeData,
} from '~/lib/resume/schema'
import { THEMES } from '~/lib/resume/themes'
import { ErrorNote, Spinner } from '../ui'
import { BulletsEditor } from './BulletsEditor'
import { AddButton, DateField, ItemCard, moveItem, StepIntro, TextArea, TextField } from './Fields'

export interface StepProps {
  data: ResumeData
  setData: Dispatch<SetStateAction<ResumeData>>
  jobDescription: string
}

type ListKey = 'experience' | 'education' | 'projects' | 'skills' | 'certifications'

function useList<K extends ListKey>(setData: StepProps['setData'], key: K) {
  type Item = ResumeData[K][number]
  return {
    patch: (id: string, patch: Partial<Item>) =>
      setData((d) => ({ ...d, [key]: (d[key] as Item[]).map((it) => (it.id === id ? { ...it, ...patch } : it)) })),
    add: (item: Item) => setData((d) => ({ ...d, [key]: [...(d[key] as Item[]), item] })),
    remove: (id: string) => setData((d) => ({ ...d, [key]: (d[key] as Item[]).filter((it) => it.id !== id) })),
    move: (index: number, dir: -1 | 1) => setData((d) => ({ ...d, [key]: moveItem(d[key] as Item[], index, dir) })),
  }
}

export function ContactStep({ data, setData }: StepProps) {
  const set = (k: keyof ResumeData['basics']) => (v: string) => setData((d) => ({ ...d, basics: { ...d.basics, [k]: v } }))
  const b = data.basics
  return (
    <>
      <StepIntro title="Contact details">Recruiters and applicant tracking systems read this first. Keep it simple — no photo needed.</StepIntro>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField label="Full name" value={b.name} onChange={set('name')} placeholder="Jordan Rivera" autoComplete="name" />
        </div>
        <div className="sm:col-span-2">
          <TextField label="Target job title / headline" value={b.headline} onChange={set('headline')} placeholder="Senior Product Engineer" hint="Match the title of the roles you’re applying for." />
        </div>
        <TextField label="Email" type="email" value={b.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
        <TextField label="Phone" type="tel" value={b.phone} onChange={set('phone')} placeholder="+1 555 014 2290" autoComplete="tel" />
        <TextField label="Location" value={b.location} onChange={set('location')} placeholder="Austin, TX" hint="City and state/country is enough." />
        <TextField label="Website / portfolio" value={b.website} onChange={set('website')} placeholder="jordanrivera.dev" />
        <TextField label="LinkedIn" value={b.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/jordanrivera" />
        <TextField label="GitHub" value={b.github} onChange={set('github')} placeholder="github.com/jordanrivera" />
      </div>
    </>
  )
}

export function SummaryStep({ data, setData, jobDescription }: StepProps) {
  const [options, setOptions] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ message: string; upgrade: boolean } | null>(null)
  const words = data.summary.trim() ? data.summary.trim().split(/\s+/).length : 0

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await aiWriteSummary({ data: { resume: data, jobDescription: jobDescription || undefined } })
      setOptions(res.options)
    } catch (err) {
      setError(readError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <StepIntro title="Professional summary">2–3 sentences on who you are, your strongest results, and the role you want. Tip: fill in experience first, then let AI draft this.</StepIntro>
      <TextArea
        label="Summary"
        rows={6}
        value={data.summary}
        onChange={(v) => setData((d) => ({ ...d, summary: v }))}
        placeholder="Product-minded full-stack engineer with 7+ years building B2B SaaS…"
        hint={<span className={words > 80 ? 'text-amber-700' : ''}>{words} words · aim for 25–80</span>}
        action={
          <button type="button" className="btn-ghost btn-sm text-brand-700" onClick={generate} disabled={loading}>
            {loading ? <Spinner className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />} Write with AI
          </button>
        }
      />
      {options ? (
        <div className="mt-3 space-y-2 rounded-xl border border-brand-200 bg-brand-50/60 p-3">
          <p className="text-xs font-semibold text-brand-800">Choose a summary</p>
          {options.map((o, i) => (
            <button
              type="button"
              key={i}
              className="block w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm hover:border-brand-500"
              onClick={() => {
                setData((d) => ({ ...d, summary: o }))
                setOptions(null)
              }}
            >
              {o}
            </button>
          ))}
        </div>
      ) : null}
      {error ? (
        <div className="mt-3">
          <ErrorNote message={error.message} upgrade={error.upgrade} />
        </div>
      ) : null}
    </>
  )
}

export function ExperienceStep({ data, setData, jobDescription }: StepProps) {
  const list = useList(setData, 'experience')
  return (
    <>
      <StepIntro title="Work experience">Most recent first. Focus bullets on results — use the wand to rewrite any bullet for impact.</StepIntro>
      <div className="space-y-3">
        {data.experience.map((e, i) => (
          <ItemCard
            key={e.id}
            index={i}
            count={data.experience.length}
            title={e.position || e.company ? [e.position, e.company].filter(Boolean).join(' · ') : 'New position'}
            subtitle={formatDateRange(e.startDate, e.endDate)}
            onMove={(dir) => list.move(i, dir)}
            onRemove={() => list.remove(e.id)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Job title" value={e.position} onChange={(v) => list.patch(e.id, { position: v })} placeholder="Software Engineer" />
              <TextField label="Company" value={e.company} onChange={(v) => list.patch(e.id, { company: v })} placeholder="Northwind Analytics" />
              <TextField label="Location" value={e.location} onChange={(v) => list.patch(e.id, { location: v })} placeholder="Remote" />
              <div className="grid grid-cols-2 gap-3">
                <DateField label="Start" value={e.startDate} onChange={(v) => list.patch(e.id, { startDate: v })} />
                <DateField label="End" value={e.endDate} onChange={(v) => list.patch(e.id, { endDate: v })} allowPresent />
              </div>
            </div>
            <BulletsEditor
              bullets={e.highlights}
              onChange={(h) => list.patch(e.id, { highlights: h })}
              position={e.position}
              company={e.company}
              jobDescription={jobDescription}
            />
          </ItemCard>
        ))}
        <AddButton onClick={() => list.add(emptyExperience())}>Add position</AddButton>
      </div>
    </>
  )
}

export function EducationStep({ data, setData }: StepProps) {
  const list = useList(setData, 'education')
  return (
    <>
      <StepIntro title="Education">Degrees, bootcamps or relevant programs. Add honours or a thesis as bullets if they help.</StepIntro>
      <div className="space-y-3">
        {data.education.map((e, i) => (
          <ItemCard
            key={e.id}
            index={i}
            count={data.education.length}
            title={e.institution || 'New education'}
            subtitle={[e.degree, e.area].filter(Boolean).join(' in ')}
            onMove={(dir) => list.move(i, dir)}
            onRemove={() => list.remove(e.id)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField label="School / institution" value={e.institution} onChange={(v) => list.patch(e.id, { institution: v })} placeholder="University of Texas at Austin" />
              </div>
              <TextField label="Degree" value={e.degree} onChange={(v) => list.patch(e.id, { degree: v })} placeholder="BS" />
              <TextField label="Field of study" value={e.area} onChange={(v) => list.patch(e.id, { area: v })} placeholder="Computer Science" />
              <TextField label="Location" value={e.location} onChange={(v) => list.patch(e.id, { location: v })} />
              <div className="grid grid-cols-2 gap-3">
                <DateField label="Start" value={e.startDate} onChange={(v) => list.patch(e.id, { startDate: v })} />
                <DateField label="End" value={e.endDate} onChange={(v) => list.patch(e.id, { endDate: v })} allowPresent />
              </div>
            </div>
            <BulletsEditor
              label="Details (optional)"
              bullets={e.highlights}
              onChange={(h) => list.patch(e.id, { highlights: h })}
              position={[e.degree, e.area].join(' ')}
              company={e.institution}
              placeholder="e.g. GPA 3.8/4.0, Dean’s List (6 semesters)"
            />
          </ItemCard>
        ))}
        <AddButton onClick={() => list.add(emptyEducation())}>Add education</AddButton>
      </div>
    </>
  )
}

export function SkillsStep({ data, setData }: StepProps) {
  const list = useList(setData, 'skills')
  return (
    <>
      <StepIntro title="Skills">Group keywords by category. Use the exact names employers use (e.g. “PostgreSQL”, not “databases”).</StepIntro>
      <div className="space-y-3">
        {data.skills.map((s, i) => (
          <div key={s.id} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
            <TextField label="Category" value={s.label} onChange={(v) => list.patch(s.id, { label: v })} placeholder="Languages" />
            <TextField label="Skills (comma separated)" value={s.details} onChange={(v) => list.patch(s.id, { details: v })} placeholder="TypeScript, Python, SQL" />
            <div className="flex">
              <button type="button" className="btn-ghost btn-sm" disabled={i === 0} onClick={() => list.move(i, -1)} aria-label="Move up">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="btn-ghost btn-sm" disabled={i === data.skills.length - 1} onClick={() => list.move(i, 1)} aria-label="Move down">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="btn-ghost btn-sm text-red-600" onClick={() => list.remove(s.id)} aria-label="Remove">
                ×
              </button>
            </div>
          </div>
        ))}
        <AddButton onClick={() => list.add(emptySkill())}>Add skill category</AddButton>
      </div>
    </>
  )
}

export function ProjectsStep({ data, setData, jobDescription }: StepProps) {
  const list = useList(setData, 'projects')
  return (
    <>
      <StepIntro title="Projects">Optional. Great for career changers, students and engineers with open-source work.</StepIntro>
      <div className="space-y-3">
        {data.projects.map((p, i) => (
          <ItemCard key={p.id} index={i} count={data.projects.length} title={p.name || 'New project'} subtitle={p.url} onMove={(dir) => list.move(i, dir)} onRemove={() => list.remove(p.id)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Project name" value={p.name} onChange={(v) => list.patch(p.id, { name: v })} />
              <TextField label="Link" value={p.url} onChange={(v) => list.patch(p.id, { url: v })} placeholder="github.com/you/project" />
              <DateField label="Start" value={p.startDate} onChange={(v) => list.patch(p.id, { startDate: v })} />
              <DateField label="End" value={p.endDate} onChange={(v) => list.patch(p.id, { endDate: v })} allowPresent />
            </div>
            <TextArea label="One-line description (optional)" rows={2} value={p.summary} onChange={(v) => list.patch(p.id, { summary: v })} />
            <BulletsEditor label="Highlights" bullets={p.highlights} onChange={(h) => list.patch(p.id, { highlights: h })} position="Project" company={p.name} jobDescription={jobDescription} />
          </ItemCard>
        ))}
        <AddButton onClick={() => list.add(emptyProject())}>Add project</AddButton>
      </div>
    </>
  )
}

export function CertificationsStep({ data, setData }: StepProps) {
  const list = useList(setData, 'certifications')
  return (
    <>
      <StepIntro title="Certifications & awards">Optional. Licences, certifications and notable awards.</StepIntro>
      <div className="space-y-3">
        {data.certifications.map((c) => (
          <div key={c.id} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_1fr_9rem_auto] sm:items-end">
            <TextField label="Name" value={c.name} onChange={(v) => list.patch(c.id, { name: v })} placeholder="AWS Solutions Architect" />
            <TextField label="Issuer" value={c.issuer} onChange={(v) => list.patch(c.id, { issuer: v })} placeholder="Amazon Web Services" />
            <DateField label="Date" value={c.date} onChange={(v) => list.patch(c.id, { date: v })} />
            <button type="button" className="btn-ghost btn-sm text-red-600" onClick={() => list.remove(c.id)} aria-label="Remove">
              ×
            </button>
          </div>
        ))}
        <AddButton onClick={() => list.add(emptyCertification())}>Add certification</AddButton>
      </div>
    </>
  )
}

export function DesignStep({
  data,
  setData,
  template,
  setTemplate,
  isPro,
}: StepProps & { template: string; setTemplate: (t: string) => void; isPro: boolean }) {
  return (
    <>
      <StepIntro title="Template & layout">All templates are single-column and ATS-safe. Switching never changes your content.</StepIntro>
      <div className="grid gap-3 sm:grid-cols-2">
        {THEMES.map((t) => {
          const locked = t.pro && !isPro
          const active = template === t.id
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => !locked && setTemplate(t.id)}
              className={`relative rounded-xl border p-4 text-left transition ${active ? 'border-brand-600 ring-2 ring-brand-600/20' : 'border-slate-200 hover:border-slate-300'} ${locked ? 'opacity-75' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink" style={{ fontFamily: t.font === 'serif' ? 'Times New Roman, serif' : undefined }}>
                  {t.name}
                </span>
                {active ? <Check className="h-4 w-4 text-brand-600" /> : locked ? <Lock className="h-4 w-4 text-slate-400" /> : null}
              </div>
              <p className="mt-1 text-xs text-slate-600">{t.description}</p>
              <div className="mt-3 h-1.5 w-16 rounded" style={{ background: t.accent }} />
              {locked ? (
                <Link to="/app/billing" className="mt-2 inline-block text-xs font-semibold text-brand-700 underline">
                  Unlock with Pro
                </Link>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="mt-8">
        <span className="label">Page size</span>
        <div className="inline-flex rounded-lg border border-slate-300 p-0.5">
          {(['LETTER', 'A4'] as const).map((s) => (
            <button
              type="button"
              key={s}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${data.pageSize === s ? 'bg-ink text-white' : 'text-slate-700'}`}
              onClick={() => setData((d) => ({ ...d, pageSize: s }))}
            >
              {s === 'LETTER' ? 'US Letter' : 'A4'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <span className="label">Section order</span>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {data.sectionOrder.map((key, i) => (
            <li key={key} className="flex items-center justify-between px-3 py-2 text-sm">
              <span>{SECTION_TITLES[key]}</span>
              <span className="flex">
                <button type="button" className="btn-ghost btn-sm" disabled={i === 0} onClick={() => setData((d) => ({ ...d, sectionOrder: moveItem(d.sectionOrder, i, -1) }))} aria-label={`Move ${SECTION_TITLES[key]} up`}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="btn-ghost btn-sm" disabled={i === data.sectionOrder.length - 1} onClick={() => setData((d) => ({ ...d, sectionOrder: moveItem(d.sectionOrder, i, 1) }))} aria-label={`Move ${SECTION_TITLES[key]} down`}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">Empty sections are hidden automatically.</p>
      </div>
    </>
  )
}
