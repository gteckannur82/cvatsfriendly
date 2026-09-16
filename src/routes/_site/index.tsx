import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  FileDown,
  FileSearch,
  History,
  LayoutTemplate,
  ScanText,
  Sparkles,
  Target,
  Wand2,
  X,
} from 'lucide-react'
import { useMemo } from 'react'
import { PricingCards } from '~/components/PricingCards'
import { ScaledResume } from '~/components/preview/ResumeHtml'
import { sampleResume } from '~/lib/resume/schema'
import { getTheme, THEMES } from '~/lib/resume/themes'
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
    a: 'No — it is instructed to never invent employers, numbers or results. It rewrites what you give it for clarity and impact, and it tells you where adding a real metric would help. You review and accept every change.',
  },
  {
    q: 'How does tailoring to a job description work?',
    a: 'Paste the job posting. We instantly show which keywords you already match and which are missing. With one click, the AI rewrites your summary and bullets to foreground the most relevant experience, and you can save the result as a new version or a separate copy for that application.',
  },
  {
    q: 'Can I cancel Pro anytime?',
    a: 'Yes. Manage or cancel your subscription from the billing page at any time. You keep Pro until the end of the billing period, and your resumes stay available on the Free plan afterward.',
  },
  {
    q: 'Can I import an existing resume?',
    a: 'You can import a RenderCV-compatible YAML or JSON file, or start from our sample and edit it. Every resume can also be exported back to YAML so your data is never locked in.',
  },
]

function Landing() {
  const sample = useMemo(() => sampleResume(), [])
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="container-page relative grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> AI resume builder for job seekers
            </span>
            <h1 className="mt-5 font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              A resume that gets past the ATS <span className="text-brand-600">and</span> impresses the recruiter.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Fill in a guided form, let AI turn duties into measurable achievements, tailor it to any job description in seconds, and
              download a clean PDF that applicant tracking systems read perfectly.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="btn-primary px-6 py-3 text-base">
                Build my resume — free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/templates" className="btn-outline px-6 py-3 text-base">
                See templates
              </Link>
            </div>
            <ul className="mt-8 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              {['No credit card required', 'Text-based PDF export', 'AI that never invents facts', 'Keyword match score'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-brand-600" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rotate-1 overflow-hidden rounded-lg">
              <ScaledResume data={sample} theme={getTheme('classic')} />
            </div>
            <div className="absolute -bottom-5 -left-3 hidden w-60 rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">ATS score</span>
                <span className="font-display text-2xl font-extrabold text-brand-600">92</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[92%] rounded-full bg-brand-500" />
              </div>
              <p className="mt-2 text-xs text-slate-500">18 of 21 job keywords matched</p>
            </div>
            <div className="absolute -top-4 -right-2 hidden w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xl sm:block">
              <div className="flex items-center gap-1.5 font-semibold text-brand-700">
                <Wand2 className="h-3.5 w-3.5" /> AI rewrite
              </div>
              <p className="mt-1.5 text-slate-400 line-through">Responsible for the billing system</p>
              <p className="mt-1 text-slate-800">Designed usage-based billing that grew expansion revenue 18% in two quarters</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-slate-200 bg-slate-50 py-14">
        <div className="container-page grid gap-8 md:grid-cols-3">
          {[
            { stat: 'Parsed first', text: 'Most mid-size and large employers run applications through an ATS before a person sees them.' },
            { stat: 'Seconds', text: 'That is roughly how long a recruiter skims a resume before deciding to read on.' },
            { stat: 'Keywords', text: 'Resumes are searched and ranked by the skills and titles in the job description.' },
          ].map((s) => (
            <div key={s.stat}>
              <p className="font-display text-2xl font-extrabold text-ink">{s.stat}</p>
              <p className="mt-2 text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20" id="features">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Everything between a blank page and an interview</h2>
            <p className="mt-4 text-lg text-slate-600">Built around how hiring actually works: software filters first, humans skim second.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: LayoutTemplate, title: 'Guided resume form', text: 'Step through contact, summary, experience, education and skills. The preview updates as you type.' },
              { icon: Wand2, title: 'AI bullet rewriter', text: 'Turn “responsible for…” into outcome-first achievements. Pick from three rewrites or improve a whole role at once.' },
              { icon: Target, title: 'Tailor to any job', text: 'Paste a job description to see matched and missing keywords, then let AI align your summary and bullets.' },
              { icon: ScanText, title: 'ATS health check', text: 'Ten checks for contact info, metrics, action verbs, length and pronouns — each with a fix.' },
              { icon: History, title: 'Versions & copies', text: 'Save a named version before big edits and keep a tailored copy for every application.' },
              { icon: FileDown, title: 'Clean PDF export', text: 'Text-based, single-column PDFs in Letter or A4 that parse cleanly in Workday, Greenhouse and Lever.' },
            ].map((f) => (
              <div key={f.title} className="card p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink py-20 text-white">
        <div className="container-page">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Three steps to a better resume</h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              { n: '01', title: 'Fill in the guided form', text: 'Start from scratch, from a sample, or import a RenderCV YAML file.' },
              { n: '02', title: 'Improve and tailor with AI', text: 'Rewrite bullets for impact and match the wording of the job you want.' },
              { n: '03', title: 'Download and apply', text: 'Choose a template, run the ATS check, and export a polished PDF.' },
            ].map((s) => (
              <div key={s.n}>
                <span className="font-display text-5xl font-extrabold text-brand-500/80">{s.n}</span>
                <h3 className="mt-3 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-slate-300">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-20">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Recruiter-approved templates</h2>
              <p className="mt-3 max-w-xl text-lg text-slate-600">Single-column layouts with standard fonts and headings. Switch anytime without retyping.</p>
            </div>
            <Link to="/templates" className="btn-outline">
              All templates <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-4">
            {THEMES.map((t) => (
              <div key={t.id} className="w-60 shrink-0 snap-start sm:w-64">
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <ScaledResume data={sample} theme={t} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-ink">{t.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.pro ? 'bg-amber-100 text-amber-800' : 'bg-brand-50 text-brand-700'}`}>
                    {t.pro ? 'Pro' : 'Free'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-slate-50 py-20">
        <div className="container-page">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Why fancy resume designs get filtered out</h2>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-display font-bold text-red-700">
                <X className="h-5 w-5" /> Common design-heavy resumes
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {['Two columns that parse out of order', 'Skills shown as graphics or rating bars', 'Contact details in headers or text boxes', 'Creative headings the ATS doesn’t recognise', 'Text flattened into an image'].map((t) => (
                  <li key={t} className="flex gap-2">
                    <X className="h-4 w-4 shrink-0 text-red-500" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card border-brand-200 p-6">
              <h3 className="flex items-center gap-2 font-display font-bold text-brand-700">
                <Check className="h-5 w-5" /> CV ATS Friendly resumes
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {['Single-column, top-to-bottom reading order', 'Skills as plain, searchable keywords', 'Contact info in the document body', 'Standard headings: Experience, Education, Skills', 'Real, selectable text in every PDF'].map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-brand-600" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-8 text-center">
            <Link to="/ats-resume-guide" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
              <FileSearch className="h-4 w-4" /> Read the full ATS resume guide
            </Link>
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20" id="pricing">
        <div className="container-page">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Simple pricing</h2>
            <p className="mt-3 text-lg text-slate-600">Start free. Upgrade when you’re applying to lots of roles.</p>
          </div>
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 py-20">
        <div className="container-page max-w-3xl">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                  {f.q}
                  <span className="text-xl text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-slate-600">{f.a}</p>
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

      {/* CTA */}
      <section className="pb-20">
        <div className="container-page">
          <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center text-white sm:px-12">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Your next application deserves a better resume</h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-100">Build it in minutes. Free to start, no credit card.</p>
            <Link to="/signup" className="btn mt-8 bg-white px-6 py-3 text-base text-brand-800 hover:bg-brand-50">
              Create my resume <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
