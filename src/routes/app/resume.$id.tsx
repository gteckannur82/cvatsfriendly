import { createFileRoute, Link, useBlocker, useRouter } from '@tanstack/react-router'
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudOff,
  Download,
  Eye,
  FileCode2,
  FileJson,
  History,
  PencilLine,
  ScanText,
  Target,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AtsModal, scoreColor, useAtsScore } from '~/components/editor/AtsPanel'
import {
  CertificationsStep,
  ContactStep,
  DesignStep,
  EducationStep,
  ExperienceStep,
  ProjectsStep,
  SkillsStep,
  SummaryStep,
  type StepProps,
} from '~/components/editor/Steps'
import { TailorModal } from '~/components/editor/TailorModal'
import { VersionsModal } from '~/components/editor/VersionsModal'
import { ScaledResume } from '~/components/preview/ResumeHtml'
import { ErrorNote, Spinner } from '~/components/ui'
import { duplicateResume, getResume, saveResume, saveVersion } from '~/functions/resumes.fn'
import { downloadResumePdf, safeFilename, saveBlob } from '~/lib/download'
import { readError } from '~/lib/errors'
import { toRenderCvYaml } from '~/lib/resume/rendercv-yaml'
import type { ResumeData } from '~/lib/resume/schema'
import { getTheme } from '~/lib/resume/themes'
import { pageTitle } from '~/lib/site'

export const Route = createFileRoute('/app/resume/$id')({
  loader: ({ params }) => getResume({ data: { id: params.id } }),
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.title ?? 'Editor') }] }),
  component: EditorPage,
  errorComponent: ({ error }) => (
    <div className="container-page py-16 text-center">
      <p className="text-slate-700">{readError(error).message}</p>
      <Link to="/app" className="btn-outline mt-4">
        Back to resumes
      </Link>
    </div>
  ),
})

const STEPS = [
  { id: 'contact', label: 'Contact' },
  { id: 'summary', label: 'Summary' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'design', label: 'Template' },
] as const
type StepId = (typeof STEPS)[number]['id']

type SaveState = 'saved' | 'dirty' | 'saving' | 'error'

function EditorPage() {
  const doc = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const router = useRouter()
  const isPro = user.plan === 'pro'

  const [data, setData] = useState<ResumeData>(doc.data)
  const [title, setTitle] = useState(doc.title)
  const [template, setTemplate] = useState(doc.template)
  const [step, setStep] = useState<StepId>('contact')
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')
  const [jobDescription, setJobDescription] = useState('')
  const [modal, setModal] = useState<'tailor' | 'versions' | 'ats' | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [error, setError] = useState<{ message: string; upgrade: boolean } | null>(null)

  // Reset local state when navigating between resumes.
  useEffect(() => {
    setData(doc.data)
    setTitle(doc.title)
    setTemplate(doc.template)
    lastSaved.current = JSON.stringify({ data: doc.data, title: doc.title, template: doc.template })
    setSaveState('saved')
  }, [doc.id])

  // ---- Autosave -----------------------------------------------------------
  const lastSaved = useRef(JSON.stringify({ data: doc.data, title: doc.title, template: doc.template }))
  const latest = useRef({ data, title, template })
  latest.current = { data, title, template }

  const flush = useCallback(async () => {
    const snapshot = latest.current
    const json = JSON.stringify(snapshot)
    if (json === lastSaved.current) return
    setSaveState('saving')
    try {
      await saveResume({ data: { id: doc.id, title: snapshot.title.trim() || 'Untitled resume', template: snapshot.template, data: snapshot.data } })
      lastSaved.current = json
      setSaveState(JSON.stringify(latest.current) === json ? 'saved' : 'dirty')
    } catch (err) {
      const e = readError(err)
      setError(e)
      setSaveState('error')
      if (e.upgrade) setTemplate(JSON.parse(lastSaved.current).template)
      throw err
    }
  }, [doc.id])

  useEffect(() => {
    if (JSON.stringify({ data, title, template }) === lastSaved.current) return
    setSaveState('dirty')
    const t = setTimeout(() => flush().catch(() => {}), 1200)
    return () => clearTimeout(t)
  }, [data, title, template, flush])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(latest.current) !== lastSaved.current) e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  useBlocker({
    shouldBlockFn: async () => {
      if (JSON.stringify(latest.current) === lastSaved.current) return false
      try {
        await flush()
        return false
      } catch {
        return !confirm('Your latest changes could not be saved. Leave anyway?')
      }
    },
  })

  // ---- Actions ------------------------------------------------------------
  const theme = getTheme(template)
  const ats = useAtsScore(data)
  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const stepProps: StepProps = { data, setData, jobDescription }

  async function exportAs(kind: 'pdf' | 'yaml' | 'json') {
    setExportOpen(false)
    setExporting(true)
    setError(null)
    try {
      const base = safeFilename(data.basics.name || title)
      if (kind === 'pdf') await downloadResumePdf(data, theme, title)
      else if (kind === 'yaml') saveBlob(new Blob([toRenderCvYaml(data)], { type: 'text/yaml' }), `${base}_Resume.yaml`)
      else saveBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `${base}_Resume.json`)
    } catch (err) {
      setError({ message: `Export failed: ${readError(err).message}`, upgrade: false })
    } finally {
      setExporting(false)
    }
  }

  const snapshot = (label: string, d = data, t = template) => saveVersion({ data: { resumeId: doc.id, label, data: d, template: t } })

  return (
    <div className="flex flex-1 flex-col">
      {/* Toolbar */}
      <div className="sticky top-14 z-30 border-b border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
          <Link to="/app" className="btn-ghost btn-sm" aria-label="Back to resumes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex min-w-0 flex-1 basis-[11rem] items-center gap-2">
            <PencilLine className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
            <input
              className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 font-display font-bold text-ink hover:border-slate-200 focus:border-brand-600 focus:outline-none"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Resume title"
            />
            <SaveBadge state={saveState} />
          </div>
          <div className="flex items-center gap-1.5">
            <button className="btn-outline btn-sm" onClick={() => setModal('ats')} title="ATS check">
              <ScanText className="h-4 w-4" />
              <span className={`font-bold ${scoreColor(ats.score)}`}>{ats.score}</span>
            </button>
            <button className="btn-outline btn-sm" onClick={() => setModal('tailor')}>
              <Target className="h-4 w-4" /> <span className="hidden md:inline">Tailor to job</span>
            </button>
            <button className="btn-outline btn-sm" onClick={() => setModal('versions')}>
              <History className="h-4 w-4" /> <span className="hidden md:inline">Versions</span>
            </button>
            <div className="relative">
              <div className="flex">
                <button className="btn-primary btn-sm rounded-r-none" onClick={() => exportAs('pdf')} disabled={exporting}>
                  {exporting ? <Spinner /> : <Download className="h-4 w-4" />} PDF
                </button>
                <button className="btn-primary btn-sm rounded-l-none border-l border-brand-700 px-1.5" onClick={() => setExportOpen((o) => !o)} aria-label="More export options">
                  <ChevronRight className={`h-3.5 w-3.5 transition ${exportOpen ? 'rotate-90' : ''}`} />
                </button>
              </div>
              {exportOpen ? (
                <div className="absolute right-0 z-40 mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50" onClick={() => exportAs('pdf')}>
                    <Download className="h-4 w-4" /> PDF (ATS-friendly)
                  </button>
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50" onClick={() => exportAs('yaml')}>
                    <FileCode2 className="h-4 w-4" /> YAML (RenderCV format)
                  </button>
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50" onClick={() => exportAs('json')}>
                    <FileJson className="h-4 w-4" /> JSON backup
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {error ? (
          <div className="px-3 pb-2 sm:px-4">
            <ErrorNote message={error.message} upgrade={error.upgrade} />
          </div>
        ) : null}
        {/* Mobile edit/preview switch */}
        <div className="grid grid-cols-2 border-t border-slate-100 lg:hidden">
          {(['edit', 'preview'] as const).map((v) => (
            <button key={v} className={`flex items-center justify-center gap-1.5 py-2 text-sm font-semibold ${mobileView === v ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500'}`} onClick={() => setMobileView(v)}>
              {v === 'edit' ? <PencilLine className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {v === 'edit' ? 'Edit' : 'Preview'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* Form */}
        <section className={`${mobileView === 'edit' ? 'block' : 'hidden'} min-w-0 border-r border-slate-200 bg-white lg:block`}>
          <nav className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 py-2 sm:px-5" aria-label="Resume sections">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${step === s.id ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <span className="mr-1 opacity-60">{i + 1}</span>
                {s.label}
              </button>
            ))}
          </nav>
          <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
            {step === 'contact' && <ContactStep {...stepProps} />}
            {step === 'summary' && <SummaryStep {...stepProps} />}
            {step === 'experience' && <ExperienceStep {...stepProps} />}
            {step === 'education' && <EducationStep {...stepProps} />}
            {step === 'skills' && <SkillsStep {...stepProps} />}
            {step === 'projects' && <ProjectsStep {...stepProps} />}
            {step === 'certifications' && <CertificationsStep {...stepProps} />}
            {step === 'design' && <DesignStep {...stepProps} template={template} setTemplate={setTemplate} isPro={isPro} />}

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <button className="btn-outline" disabled={stepIndex === 0} onClick={() => setStep(STEPS[stepIndex - 1].id)}>
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              {stepIndex < STEPS.length - 1 ? (
                <button className="btn-dark" onClick={() => setStep(STEPS[stepIndex + 1].id)}>
                  Next: {STEPS[stepIndex + 1].label} <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button className="btn-primary" onClick={() => exportAs('pdf')} disabled={exporting}>
                  {exporting ? <Spinner /> : <Download className="h-4 w-4" />} Download PDF
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Preview */}
        <section className={`${mobileView === 'preview' ? 'block' : 'hidden'} min-w-0 bg-slate-100 lg:block`}>
          <div className="sticky top-[6.75rem] max-h-[calc(100vh-6.75rem)] overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-[816px]">
              <ScaledResume data={data} theme={theme} />
              <p className="mt-3 text-center text-xs text-slate-500">
                Live preview · {theme.name} template · {data.pageSize === 'A4' ? 'A4' : 'US Letter'} · the PDF may paginate slightly differently
              </p>
            </div>
          </div>
        </section>
      </div>

      <TailorModal
        open={modal === 'tailor'}
        onClose={() => setModal(null)}
        data={data}
        jobDescription={jobDescription}
        setJobDescription={setJobDescription}
        onApply={async (next, label) => {
          await snapshot(`Before tailoring: ${label}`)
          setData(next)
        }}
        onSaveCopy={async (next, label) => {
          await flush().catch(() => {})
          const { id } = await duplicateResume({ data: { id: doc.id, title: label, data: next } })
          await router.navigate({ to: '/app/resume/$id', params: { id } })
        }}
      />
      <VersionsModal
        open={modal === 'versions'}
        onClose={() => setModal(null)}
        resumeId={doc.id}
        onSave={async (label) => {
          await snapshot(label)
        }}
        onRestore={async (d, t) => {
          setData(d)
          const target = getTheme(t)
          if (!target.pro || isPro) setTemplate(target.id)
        }}
      />
      <AtsModal open={modal === 'ats'} onClose={() => setModal(null)} data={data} />
    </div>
  )
}

function SaveBadge({ state }: { state: SaveState }) {
  if (state === 'saving' || state === 'dirty')
    return (
      <span className="hidden shrink-0 items-center gap-1 text-xs text-slate-400 sm:flex">
        <Spinner className="h-3 w-3" /> Saving
      </span>
    )
  if (state === 'error')
    return (
      <span className="flex shrink-0 items-center gap-1 text-xs text-red-600">
        <CloudOff className="h-3.5 w-3.5" /> Not saved
      </span>
    )
  return (
    <span className="hidden shrink-0 items-center gap-1 text-xs text-slate-400 sm:flex">
      <Check className="h-3.5 w-3.5" /> Saved
    </span>
  )
}
