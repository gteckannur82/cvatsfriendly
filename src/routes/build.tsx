import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Download, Eye, Lock, PencilLine, ScanText, Save, Sparkles, Target } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AccountGateProvider } from '~/components/editor/gate'
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
import { Logo } from '~/components/Logo'
import { ScaledResume } from '~/components/preview/ResumeHtml'
import { ErrorNote, Modal, Spinner } from '~/components/ui'
import { createResume } from '~/functions/resumes.fn'
import { clearDraft, readDraft, writeDraft, type Draft } from '~/lib/draft'
import { readError } from '~/lib/errors'
import { emptyResume } from '~/lib/resume/schema'
import { getTheme } from '~/lib/resume/themes'
import { seo } from '~/lib/site'

export const Route = createFileRoute('/build')({
  head: () =>
    seo({
      title: 'Build your resume',
      description: 'Start building an ATS-friendly resume straight away — no account needed until you download it.',
      path: '/build',
    }),
  component: BuildPage,
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

const BLANK: Draft = { title: 'Untitled resume', template: 'classic', data: emptyResume() }

function BuildPage() {
  const { user } = Route.useRouteContext()
  const router = useRouter()

  const [ready, setReady] = useState(false)
  const [draft, setDraft] = useState<Draft>(BLANK)
  const [step, setStep] = useState<StepId>('contact')
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')
  const [gateFor, setGateFor] = useState<string | null>(null)
  const [error, setError] = useState<{ message: string; upgrade: boolean } | null>(null)
  const claiming = useRef(false)

  // localStorage only exists after hydration, so the draft loads on mount.
  useEffect(() => {
    setDraft(readDraft() ?? BLANK)
    setReady(true)
  }, [])

  // A signed-in visitor has an account to keep this in, so move it there and continue in the real editor.
  useEffect(() => {
    if (!ready || !user || claiming.current) return
    claiming.current = true
    const local = readDraft()
    ;(async () => {
      if (!local) return router.navigate({ to: '/app' })
      try {
        const { id } = await createResume({ data: { source: 'import', data: local.data, title: local.title, template: local.template } })
        clearDraft()
        await router.navigate({ to: '/app/resume/$id', params: { id } })
      } catch (err) {
        setError(readError(err))
        claiming.current = false
      }
    })()
  }, [ready, user, router])

  useEffect(() => {
    if (ready && !user) writeDraft(draft)
  }, [draft, ready, user])

  const theme = getTheme(draft.template)
  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const stepProps: StepProps = {
    data: draft.data,
    setData: (d) => setDraft((p) => ({ ...p, data: typeof d === 'function' ? d(p.data) : d })),
    jobDescription: '',
  }

  /** Every gated action funnels through here, so the draft is never lost to a redirect. */
  function requireAccount(what: string) {
    setGateFor(what)
    return false
  }

  if (user) {
    return (
      <CenteredNotice>
        {error ? <ErrorNote message={error.message} upgrade={error.upgrade} /> : <p className="flex items-center gap-2 text-slate-600"><Spinner /> Saving your resume to your account…</p>}
      </CenteredNotice>
    )
  }

  if (!ready) return <CenteredNotice><p className="flex items-center gap-2 text-slate-600"><Spinner /> Loading your draft…</p></CenteredNotice>

  return (
    <AccountGateProvider gate={() => requireAccount('use AI')}>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <Logo to="/" />
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-slate-500 sm:inline">Saved in this browser</span>
              <Link to="/login" className="btn-ghost btn-sm">
                Log in
              </Link>
              <button className="btn-primary btn-sm" onClick={() => requireAccount('save this resume')}>
                <Save className="h-3.5 w-3.5" /> Save my resume
              </button>
            </div>
          </div>
        </header>

        <div className="border-b border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
            <div className="flex min-w-0 flex-1 basis-[11rem] items-center gap-2">
              <PencilLine className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
              <input
                className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 font-display font-bold text-ink hover:border-slate-200 focus:border-brand-600 focus:outline-none"
                value={draft.title}
                maxLength={120}
                onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                aria-label="Resume title"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button className="btn-outline btn-sm" onClick={() => requireAccount('run the ATS check')}>
                <ScanText className="h-4 w-4" />
                <Lock className="h-3 w-3 text-slate-400" />
              </button>
              <button className="btn-outline btn-sm" onClick={() => requireAccount('tailor this to a job')}>
                <Target className="h-4 w-4" /> <span className="hidden md:inline">Tailor to job</span>
                <Lock className="h-3 w-3 text-slate-400" />
              </button>
              <button className="btn-primary btn-sm" onClick={() => requireAccount('download your PDF')}>
                <Download className="h-4 w-4" /> PDF
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-slate-100 lg:hidden">
            {(['edit', 'preview'] as const).map((v) => (
              <button
                key={v}
                className={`flex items-center justify-center gap-1.5 py-2 text-sm font-semibold ${mobileView === v ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500'}`}
                onClick={() => setMobileView(v)}
              >
                {v === 'edit' ? <PencilLine className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {v === 'edit' ? 'Edit' : 'Preview'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <section className={`${mobileView === 'edit' ? 'block' : 'hidden'} min-w-0 border-r border-slate-200 bg-white lg:block`}>
            <nav className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 py-2 sm:px-5" aria-label="Resume sections">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`min-h-9 shrink-0 rounded-[3px] px-3 py-1.5 text-xs font-semibold transition-colors ${step === s.id ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100'}`}
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
              {step === 'design' && (
                <DesignStep {...stepProps} template={draft.template} setTemplate={(t) => setDraft((p) => ({ ...p, template: t }))} isPro={false} />
              )}

              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                <button className="btn-outline" disabled={stepIndex === 0} onClick={() => setStep(STEPS[stepIndex - 1].id)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                {stepIndex < STEPS.length - 1 ? (
                  <button className="btn-dark" onClick={() => setStep(STEPS[stepIndex + 1].id)}>
                    Next: {STEPS[stepIndex + 1].label} <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button className="btn-primary" onClick={() => requireAccount('download your PDF')}>
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className={`${mobileView === 'preview' ? 'block' : 'hidden'} min-w-0 bg-slate-100 lg:block`}>
            <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4 sm:p-6">
              <div className="mx-auto max-w-[816px]">
                <ScaledResume data={draft.data} theme={theme} />
                <p className="mt-3 text-center text-xs text-slate-500">
                  Live preview · {theme.name} template · {draft.data.pageSize === 'A4' ? 'A4' : 'US Letter'}
                </p>
              </div>
            </div>
          </section>
        </div>

        <Modal open={!!gateFor} onClose={() => setGateFor(null)} title="Create a free account">
          <p className="text-sm leading-relaxed text-slate-700">
            Your resume is saved in this browser. Create a free account to {gateFor} — it takes a moment, and everything you have written so far comes with
            you.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link to="/signup" search={{ redirect: '/build' }} className="btn-primary flex-1 py-2.5">
              <Sparkles className="h-4 w-4" /> Create free account
            </Link>
            <Link to="/login" search={{ redirect: '/build' }} className="btn-outline flex-1 py-2.5">
              I already have one
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-500">Free accounts include the ATS check, keyword match, PDF export and 5 AI credits a day.</p>
        </Modal>
      </div>
    </AccountGateProvider>
  )
}

function CenteredNotice({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">{children}</div>
}
