import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Plus } from 'lucide-react'
import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { RollingNumber, renderRuns, Swipe } from '~/components/marks'
import { PricingCards } from '~/components/PricingCards'
import { ScaledResume } from '~/components/preview/ResumeHtml'
import { AI_CREDIT_COST, PLAN_LIMITS } from '~/lib/plans'
import { keywordMatch } from '~/lib/resume/ats'
import { formatDateRange } from '~/lib/resume/format'
import { markKeywords, type MarkKind } from '~/lib/resume/highlight'
import { SAMPLE_POSTING, samplePostingText } from '~/lib/resume/sample-posting'
import { sampleResume, type ResumeData } from '~/lib/resume/schema'
import { THEMES } from '~/lib/resume/themes'
import { seo } from '~/lib/site'

export const Route = createFileRoute('/_site/')({
  head: () => seo({ path: '/' }),
  component: Landing,
})

const FAQ = [
  {
    q: 'What is an ATS-friendly resume?',
    a: 'Most companies filter applications through an applicant tracking system (ATS) such as Workday, Greenhouse, Lever or Taleo. These systems extract text from your resume to build a candidate profile and rank it against the job. An ATS-friendly resume uses a single column, standard section headings, real selectable text and common fonts so nothing gets lost in parsing.',
  },
  {
    q: 'Are the PDFs really readable by applicant tracking systems?',
    a: 'Yes. Every template exports a text-based PDF using standard fonts, a single-column reading order and plain section titles like “Experience” and “Education”. There are no tables, text boxes, icons or images that commonly break parsers.',
  },
  {
    q: 'Will the AI make things up?',
    a: 'It is instructed never to add employers, tools, numbers or results that are not already in what you wrote. If a bullet has no number, the rewrite will not make one up, so add the real figure yourself. You choose which suggestions to keep before anything changes.',
  },
  {
    q: 'How does tailoring to a job description work?',
    a: 'Paste the job posting. You see which of its keywords your resume already contains and which are missing. The AI can then rewrite your summary and bullets to put your most relevant experience first. Tick the changes you want, then save them as a new version or as a separate copy for that application.',
  },
  {
    q: 'Can I cancel Pro anytime?',
    a: 'Yes. Manage or cancel your subscription from the billing page at any time. You keep Pro until the end of the billing period, and your resumes stay available on the Free plan afterward.',
  },
  {
    q: 'Can I import my existing resume?',
    a: 'Not from PDF or Word yet. You can import a YAML or JSON resume file (the open RenderCV format), or start from a filled-in sample and replace the details. Every resume exports back to YAML or JSON, so your data is never locked in.',
  },
]

function Landing() {
  const sample = useMemo(() => sampleResume(), [])
  return (
    <>
      <Hero sample={sample} />
      <ParseSection sample={sample} />
      <RewriteSection />
      <EditorSection />
      <TemplatesSection sample={sample} />

      <section className="border-t border-desk-rule bg-desk py-20 sm:py-24" id="pricing">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance text-ink">
              Start free. Pay for the months you’re applying.
            </h2>
            <p className="mt-4 text-lg text-ink-soft">Cancel from the billing page whenever you land the role.</p>
          </div>
          <PricingCards />
        </div>
      </section>

      <section className="border-t border-desk-rule bg-desk py-16 sm:py-20">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
          <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-ink">Questions</h2>
          <div className="sheet min-w-0 px-6 sm:px-9">
            {FAQ.map((f) => (
              <details key={f.q} className="group border-b border-slate-200 last:border-b-0">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-lg font-bold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Plus className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="max-w-[65ch] pb-6 leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
            }),
          }}
        />
      </section>

      <section className="border-t border-desk-rule bg-desk py-20 sm:py-32">
        <div className="container-page">
          <h2 className="max-w-4xl font-display text-[clamp(2.4rem,5vw,4.25rem)] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance text-ink">
            Paste the posting. See what’s <Swipe kind="missing" announce={false}>missing</Swipe>. Add only what’s true.
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to="/build" className="btn-primary px-6 py-3.5 text-base">
              Build my resume <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="text-ink-soft">Free plan. No credit card.</p>
          </div>
        </div>
      </section>
    </>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Hero: the sample posting, marked by the real keyword matcher                              */
/* ------------------------------------------------------------------------------------------ */

function Hero({ sample }: { sample: ResumeData }) {
  return (
    <section className="overflow-hidden bg-desk">
      <div className="container-page grid grid-cols-1 items-start gap-12 pt-10 pb-16 sm:pt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14 lg:pt-16 lg:pb-24">
        <div className="lg:pt-4">
          <h1 className="font-display text-[clamp(2.5rem,5.2vw,4.4rem)] leading-[0.97] font-extrabold tracking-[-0.035em] text-balance text-ink">
            A resume that gets{' '}
            <Swipe draw index={0}>
              past the ATS
            </Swipe>{' '}
            and impresses the recruiter.
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-soft">
            Most employers screen applications with an applicant tracking system (ATS) before a recruiter reads them. Build yours in a guided form, tailor it
            to each posting, and export a PDF the ATS can read.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link to="/build" className="btn-primary px-6 py-3.5 text-base">
              Build my resume <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/templates" className="inline-flex min-h-11 items-center font-bold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              See the templates
            </Link>
          </div>
          <p className="mt-7 text-sm text-ink-soft">Free plan, no credit card · Text-based PDF · You approve every AI edit</p>
        </div>
        <PostingSheet sample={sample} />
      </div>
    </section>
  )
}

function PostingSheet({ sample }: { sample: ResumeData }) {
  const match = useMemo(() => keywordMatch(sample, samplePostingText()), [sample])
  const [isolate, setIsolate] = useState<MarkKind | null>(null)
  const toggle = (k: MarkKind) => setIsolate((cur) => (cur === k ? null : k))

  const mark = (text: string, startIndex: number) => renderRuns(markKeywords(text, match.matched, match.missing), { draw: true, startIndex, isolate })
  const title = mark(SAMPLE_POSTING.title, 1)
  let next = 1 + title.count
  const lines = SAMPLE_POSTING.lines.map((l) => {
    const r = mark(l, next)
    next += r.count
    return r.nodes
  })

  return (
    <figure className="mx-auto w-full max-w-[33rem] min-w-0 lg:mt-2">
      <div className="relative flex flex-col gap-4 lg:block">
        <Tally found={match.matched.length} missing={match.missing.length} total={match.keywords.length} score={match.score} isolate={isolate} onToggle={toggle} />
        <div className="sheet relative px-6 pt-4 pb-8 font-document sm:px-9 lg:rotate-[0.7deg] lg:pb-60">
          <div className="flex items-baseline justify-between gap-4 border-b border-slate-200 pb-2 text-[13px] text-slate-600">
            <span className="truncate">{SAMPLE_POSTING.url}</span>
            <span className="shrink-0">Sample posting, fictional</span>
          </div>
          <h2 className="mt-6 text-xl leading-tight font-bold text-black">{title.nodes}</h2>
          <p className="mt-1 text-[15px] text-slate-600">{SAMPLE_POSTING.company}</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-[1.5] text-black marker:text-slate-400">
            {lines.map((nodes, i) => (
              <li key={i}>{nodes}</li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="mt-4 text-center text-[13px] text-ink-soft lg:text-right">
        Matched against the sample resume with the same keyword check the editor runs.
      </figcaption>
    </figure>
  )
}

function Tally({
  found,
  missing,
  total,
  score,
  isolate,
  onToggle,
}: {
  found: number
  missing: number
  total: number
  score: number
  isolate: MarkKind | null
  onToggle: (k: MarkKind) => void
}) {
  return (
    <div className="sheet z-10 flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 lg:absolute lg:bottom-6 lg:-left-12 lg:-rotate-[1.4deg] lg:flex-col lg:items-stretch lg:gap-2 lg:px-4 lg:py-3.5">
      <div>
        <p className="flex items-baseline gap-2 text-ink">
          <span className="text-[2rem] leading-none font-medium">
            <RollingNumber value={found} />
            <span className="num text-slate-400">/</span>
            <span className="num">{total}</span>
          </span>
          <span className="num text-base">
            <RollingNumber value={score} start={500} />%
          </span>
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">keywords matched</p>
      </div>
      <div className="flex flex-wrap gap-1.5 lg:flex-col" role="group" aria-label="Show highlights">
        <KeyButton kind="found" label="In the resume" count={found} active={isolate === 'found'} onClick={() => onToggle('found')} />
        <KeyButton kind="missing" label="Missing, add if true" count={missing} active={isolate === 'missing'} onClick={() => onToggle('missing')} />
      </div>
    </div>
  )
}

function KeyButton({ kind, label, count, active, onClick }: { kind: MarkKind; label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex min-h-11 items-center gap-2 rounded-[3px] border px-2 text-left text-[13px] transition-colors lg:min-h-9 ${
        active ? 'border-ink bg-ink text-white' : 'border-transparent text-ink hover:border-slate-300'
      }`}
    >
      <span aria-hidden="true" className={`h-3 w-5 rounded-[2px] ${kind === 'found' ? 'bg-mark' : 'bg-miss'}`} />
      <span className="flex-1">{label}</span>
      <span className="num">{count}</span>
    </button>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* What a parser extracts                                                                     */
/* ------------------------------------------------------------------------------------------ */

function ParseSection({ sample }: { sample: ResumeData }) {
  const b = sample.basics
  const job = sample.experience[0]
  const edu = sample.education[0]
  const firstBullet = job.highlights[0].replace(/\*\*/g, '')
  const range = formatDateRange(job.startDate, job.endDate)

  // What a left-to-right read across a two-column layout commonly produces.
  const scrambled: { text: string; bad?: boolean; head?: boolean }[] = [
    { text: b.name.toUpperCase() },
    { text: `CONTACT ${b.headline}`, bad: true },
    { text: `${b.email} EXPERIENCE`, bad: true },
    { text: `${b.phone} ${job.position}`, bad: true },
    { text: `SKILLS ${job.company} ${range}`, bad: true },
    { text: `${sample.skills[0].details} ${firstBullet.slice(0, 44)}`, bad: true },
    { text: `EDUCATION ${firstBullet.slice(44, 92)}…`, bad: true },
  ]
  const clean: { text: string; head?: boolean }[] = [
    { text: b.name },
    { text: b.headline },
    { text: [b.location, b.email, b.phone].join(' · ') },
    { text: 'EXPERIENCE', head: true },
    { text: `${job.position}, ${job.company}, ${range}` },
    { text: `${firstBullet.slice(0, 70)}…` },
    { text: 'SKILLS', head: true },
    { text: `${sample.skills[0].label}: ${sample.skills[0].details}` },
    { text: 'EDUCATION', head: true },
    { text: `${edu.degree} ${edu.area}, ${edu.institution}` },
  ]

  return (
    <section className="border-t border-desk-rule bg-desk py-20 sm:py-24">
      <div className="container-page">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
          <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance text-ink">
            What an ATS pulls out of your resume
          </h2>
          <p className="text-lg leading-relaxed text-ink-soft">
            Parsers read the text layer of your PDF. Two columns often come out interleaved. One column comes out in order.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <ExtractPanel
            title="Two-column design"
            caption="Illustration of a common parsing failure"
            notes={['Sidebar and main column read across each other', 'Headings land mid-line, so fields get misfiled', 'Skills bars and icons carry no text at all']}
            tone="missing"
          >
            {scrambled.map((l, i) => (
              <li key={i}>{l.bad ? <Swipe kind="missing">{l.text}</Swipe> : l.text}</li>
            ))}
          </ExtractPanel>
          <ExtractPanel
            title="CV ATS Friendly template"
            caption="The sample resume’s text, in reading order"
            notes={['One column, top to bottom', 'Standard headings a parser recognizes', 'Contact details in the body, skills as plain words']}
            tone="found"
          >
            {clean.map((l, i) => (
              <li key={i}>{l.head ? <Swipe>{l.text}</Swipe> : l.text}</li>
            ))}
          </ExtractPanel>
        </div>

        <p className="mt-8">
          <Link to="/ats-resume-guide" className="inline-flex min-h-11 items-center font-bold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
            Read the full ATS resume guide
          </Link>
        </p>
      </div>
    </section>
  )
}

function ExtractPanel({
  title,
  caption,
  notes,
  tone,
  children,
}: {
  title: string
  caption: string
  notes: string[]
  tone: MarkKind
  children: ReactNode
}) {
  return (
    <div className="sheet flex min-w-0 flex-col px-5 py-5 sm:px-7 sm:py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink pb-3">
        <h3 className="text-xl font-bold text-ink">{title}</h3>
        <p className="text-[13px] text-ink-soft">{caption}</p>
      </div>
      <ol aria-label="Extracted text" className="num mt-4 space-y-1.5 overflow-x-auto text-[13px] leading-[1.45] break-words text-ink">
        {children}
      </ol>
      <ul className="mt-5 space-y-1.5 border-t border-slate-200 pt-4 text-[15px] text-ink-soft">
        {notes.map((n) => (
          <li key={n} className="flex gap-2.5">
            <span aria-hidden="true" className={`mt-[0.55em] h-1.5 w-3 shrink-0 ${tone === 'found' ? 'bg-mark' : 'bg-miss'}`} />
            {n}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Rewrites that keep the facts                                                               */
/* ------------------------------------------------------------------------------------------ */

function RewriteSection() {
  return (
    <section className="border-t border-desk-rule bg-desk py-20 sm:py-28">
      <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance text-ink">
            AI rewrites that keep your facts
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            The AI rewrites for impact but is told never to add numbers, tools or results you didn’t give it. Every highlighted fact in a suggestion traces back
            to your own words.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">You pick which suggestion to keep. Nothing changes until you do.</p>
          <Link to="/build" className="btn-primary mt-8 px-6 py-3.5 text-base">
            Build my resume <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <figure className="min-w-0">
          <div className="sheet px-6 pb-6 sm:px-9 sm:pb-8">
            <RewriteRow
              before={
                <>
                  Worked on <Swipe>Stripe usage-based billing</Swipe>, <Swipe>expansion revenue</Swipe> up <Swipe>18%</Swipe> over{' '}
                  <Swipe>2 quarters</Swipe>
                </>
              }
              after={
                <>
                  Designed <Swipe>usage-based billing on Stripe</Swipe> that grew <Swipe>expansion revenue 18%</Swipe> in <Swipe>two quarters</Swipe>
                </>
              }
            />
            <RewriteRow
              before={<>Helped new engineers get up to speed</>}
              after={<>Mentored new engineers through their first months on the team</>}
              note={
                <>
                  <Swipe kind="missing">No number given, so none added.</Swipe> How many engineers? Add it if you know it.
                </>
              }
            />
          </div>
          <figcaption className="mt-4 text-[13px] text-ink-soft">Illustrative examples of suggested rewrites.</figcaption>
        </figure>
      </div>
    </section>
  )
}

function RewriteRow({ before, after, note }: { before: ReactNode; after: ReactNode; note?: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 border-b border-slate-200 pt-6 pb-6 font-document last:border-b-0 last:pb-0 sm:grid-cols-2 sm:gap-8">
      <div>
        <p className="font-sans text-[13px] font-bold text-ink-soft">What you wrote</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">{before}</p>
      </div>
      <div>
        <p className="font-sans text-[13px] font-bold text-ink-soft">Suggested rewrite</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-black">{after}</p>
        {note ? <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-soft">{note}</p> : null}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* The editor, as a plain spec list                                                           */
/* ------------------------------------------------------------------------------------------ */

const MOBILE_FEATURES = 4

function EditorSection() {
  const [showAll, setShowAll] = useState(false)
  const free = PLAN_LIMITS.free
  const credits = (n: number) => `${n} credit${n === 1 ? '' : 's'}`
  const items: { term: string; text: string; cost: string }[] = [
    { term: 'Guided form', text: 'Contact, summary, experience, education and skills, with a live preview as you type.', cost: 'Free' },
    { term: 'Keyword match', text: 'Paste a posting to see which of its keywords your resume has and which are missing.', cost: 'Free' },
    { term: 'ATS content check', text: 'Ten checks for contact details, metrics, action verbs, length and pronouns, each with a fix.', cost: 'Free' },
    { term: 'PDF export', text: 'Text-based, single-column PDF in Letter or A4.', cost: 'Free' },
    { term: 'Bullet rewriter', text: 'Three rewrites of one bullet, outcome first, no invented numbers.', cost: credits(AI_CREDIT_COST.rewriteBullet) },
    { term: 'Role improver', text: 'Rewrites every bullet in a role at once and removes repeated ideas.', cost: credits(AI_CREDIT_COST.improveRole) },
    { term: 'Summary writer', text: 'Two summary options drawn from what your resume already says.', cost: credits(AI_CREDIT_COST.writeSummary) },
    { term: 'Tailor to a job', text: 'Rewrites your summary and bullets toward one posting; you tick the changes to keep.', cost: credits(AI_CREDIT_COST.tailorResume) },
    { term: 'Versions and copies', text: 'Save a named version before big edits, or keep a tailored copy per application.', cost: `${free.maxVersionsPerResume} free` },
    { term: 'Import and export', text: 'YAML or JSON in the open RenderCV format, so your data is never locked in.', cost: 'Free' },
  ]
  return (
    <section className="border-t border-desk-rule bg-desk py-20 sm:py-24">
      <div className="container-page">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
          <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance text-ink">
            What’s in the editor
          </h2>
          <p className="text-lg leading-relaxed text-ink-soft">
            Free covers the whole resume. AI features spend credits: {free.aiPerDay} a day on Free, {PLAN_LIMITS.pro.aiPerDay} on Pro.
          </p>
        </div>
        <dl id="editor-features" className="sheet mt-12 grid grid-cols-1 px-6 sm:px-9 md:grid-cols-2 md:gap-x-12">
          {items.map((it, i) => (
            <div
              key={it.term}
              className={`grid-cols-[minmax(0,1fr)_auto] gap-x-6 border-b border-slate-200 py-5 md:grid ${showAll || i < MOBILE_FEATURES ? 'grid' : 'hidden'}`}
            >
              <dt className="font-bold text-ink">{it.term}</dt>
              <dd className={`num row-span-2 pt-0.5 text-right text-[13px] ${it.cost === 'Free' ? 'text-ink-soft' : 'text-ink'}`}>{it.cost}</dd>
              <dd className="mt-1 text-[15px] leading-relaxed text-ink-soft">{it.text}</dd>
            </div>
          ))}
        </dl>
        {showAll ? null : (
          <button
            type="button"
            aria-expanded={showAll}
            aria-controls="editor-features"
            onClick={() => setShowAll(true)}
            className="btn-outline mt-4 w-full py-3 md:hidden"
          >
            Show all {items.length} features
          </button>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Templates: pick one, read it at a real size                                                */
/* ------------------------------------------------------------------------------------------ */

function TemplatesSection({ sample }: { sample: ResumeData }) {
  const [activeId, setActiveId] = useState(THEMES[0].id)
  const active = THEMES.find((t) => t.id === activeId) ?? THEMES[0]
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = THEMES.findIndex((t) => t.id === active.id)
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: THEMES.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    const t = THEMES[(next + THEMES.length) % THEMES.length]
    setActiveId(t.id)
    document.getElementById(`template-tab-${t.id}`)?.focus()
  }
  return (
    <section className="overflow-hidden border-t border-desk-rule bg-desk py-20 sm:py-28">
      <div className="container-page">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
          <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance text-ink">
            Five templates, all single-column
          </h2>
          <p className="text-lg leading-relaxed text-ink-soft">Standard fonts and headings in every one. Switch at any time without retyping.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            <div
              role="tablist"
              aria-label="Templates"
              onKeyDown={onTabKey}
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-ink lg:px-0 lg:pb-0"
            >
              {THEMES.map((t) => {
                const selected = t.id === active.id
                return (
                  <button
                    key={t.id}
                    id={`template-tab-${t.id}`}
                    role="tab"
                    tabIndex={selected ? 0 : -1}
                    aria-selected={selected}
                    aria-controls="template-preview"
                    onClick={() => setActiveId(t.id)}
                    className={`min-h-11 shrink-0 rounded-[3px] border px-3 py-2 text-left transition-colors lg:rounded-none lg:border-0 lg:border-b lg:border-slate-300 lg:px-0 lg:py-3.5 ${
                      selected ? 'border-ink bg-white lg:bg-transparent' : 'border-slate-300 hover:bg-white/60 lg:hover:bg-transparent'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-4">
                      <span className={`font-bold ${selected ? 'text-ink lg:underline lg:decoration-2 lg:underline-offset-4' : 'text-ink-soft'}`}>{t.name}</span>
                      <span className="num text-[13px] text-ink-soft">{t.pro ? 'Pro' : 'Free'}</span>
                    </span>
                    <span className="mt-1 hidden text-[15px] leading-snug text-ink-soft lg:block">{t.description}</span>
                  </button>
                )
              })}
            </div>
            <Link to="/build" className="btn-primary mt-8 hidden px-6 py-3.5 text-base lg:inline-flex">
              Build my resume <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div id="template-preview" role="tabpanel" aria-labelledby={`template-tab-${active.id}`} tabIndex={0} className="relative min-w-0">
            <div className="-mx-4 h-[30rem] overflow-x-auto overflow-y-hidden px-4 sm:mx-0 sm:h-[36rem] sm:overflow-hidden sm:px-0 lg:h-[40rem]">
              <div className="mx-auto w-full max-w-[46rem] min-w-[34rem] sm:min-w-0">
                <ScaledResume data={sample} theme={active} />
              </div>
            </div>
            <p className="mt-4 text-[13px] text-ink-soft">
              {active.name}, first page, shown with the sample resume ·{' '}
              <Link to="/templates" className="font-bold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                Compare all templates
              </Link>
            </p>
            <Link to="/build" className="btn-primary mt-6 w-full px-6 py-3.5 text-base lg:hidden">
              Build my resume <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
