import { createFileRoute, Link } from '@tanstack/react-router'
import { seo } from '~/lib/site'

export const Route = createFileRoute('/_site/ats-resume-guide')({
  head: () =>
    seo({
      title: 'How to Write an ATS-Friendly Resume (2026 Guide)',
      description:
        'What applicant tracking systems look for, which formatting breaks parsing, how to use job description keywords, and how to write bullet points that get interviews.',
      path: '/ats-resume-guide',
    }),
  component: Guide,
})

const sections = [
  {
    h: 'What an ATS actually does',
    p: [
      'An applicant tracking system (ATS) stores every application a company receives. When you upload a resume, the ATS extracts the text and tries to split it into fields: your name, contact details, job titles, employers, dates, education and skills.',
      'Recruiters then search and filter that database — for example “product manager” with “SQL” in the last five years. If your resume was parsed badly, or doesn’t use the words they search for, you can be invisible even when you are qualified.',
    ],
  },
  {
    h: 'Formatting rules that keep parsing clean',
    list: [
      'Use a single-column layout. Two-column designs are often read left-to-right across both columns, scrambling your content.',
      'Use standard section headings: Summary, Experience, Education, Skills, Projects, Certifications.',
      'Keep contact details in the main body, not in the page header or footer.',
      'Avoid tables, text boxes, icons, charts and skill-rating bars.',
      'Use common fonts (Helvetica, Arial, Times, Calibri) at 10–12pt.',
      'Export a text-based PDF — if you can highlight the text in a PDF viewer, an ATS can read it.',
      'Write dates consistently, e.g. “Mar 2021 – Present”.',
    ],
  },
  {
    h: 'Use the job description’s keywords — honestly',
    p: [
      'Recruiters search for the skills, tools and titles listed in the job posting. Mirror that exact wording where it’s true: if the posting says “stakeholder management” and you wrote “worked with partners”, use their phrase.',
      'Put hard skills in a dedicated Skills section and also show them in context inside your bullet points. Never paste hidden keywords or claim skills you don’t have — recruiters and interviews will catch it.',
    ],
  },
  {
    h: 'Write bullet points that show impact',
    p: ['Hiring managers skim. Each bullet should answer “so what?” Use the XYZ pattern: accomplished X, as measured by Y, by doing Z.'],
    examples: [
      { bad: 'Responsible for managing social media accounts', good: 'Grew Instagram following 3.2× in 9 months by launching a weekly creator series' },
      { bad: 'Worked on the checkout page', good: 'Redesigned checkout flow, lifting mobile conversion from 2.1% to 2.9%' },
      { bad: 'Helped new hires', good: 'Onboarded and mentored 6 engineers, cutting ramp-up time from 8 to 5 weeks' },
    ],
  },
  {
    h: 'Length and structure',
    list: [
      'One page for under ~7 years of experience; two pages is fine for senior roles.',
      'Lead with a 2–3 sentence summary aimed at the role you want.',
      'List experience in reverse-chronological order with 2–6 bullets per role.',
      'Tailor your resume for each application — keep a separate version per role type.',
    ],
  },
]

function Guide() {
  return (
    <article className="py-16 sm:py-20">
      <div className="container-page max-w-3xl">
        <p className="text-sm font-semibold text-brand-700">Guide</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">How to write an ATS-friendly resume</h1>
        <p className="mt-5 text-lg text-slate-600">
          A practical guide to getting your resume parsed correctly, ranked for the right searches, and read by a human.
        </p>
        <div className="mt-12 space-y-12">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-2xl font-bold text-ink">{s.h}</h2>
              {s.p?.map((t) => (
                <p key={t} className="mt-4 leading-relaxed text-slate-700">
                  {t}
                </p>
              ))}
              {s.list ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
                  {s.list.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : null}
              {s.examples ? (
                <div className="mt-5 space-y-3">
                  {s.examples.map((e) => (
                    <div key={e.bad} className="grid gap-2 rounded-xl border border-slate-200 p-4 text-sm sm:grid-cols-2">
                      <p className="text-slate-500">
                        <span className="font-semibold text-red-700">Before: </span>
                        {e.bad}
                      </p>
                      <p className="text-slate-800">
                        <span className="font-semibold text-brand-700">After: </span>
                        {e.good}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
        <div className="mt-16 rounded-2xl bg-brand-50 p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-ink">Skip the formatting work</h2>
          <p className="mt-2 text-slate-600">Every CV ATS Friendly template follows these rules, and the built-in ATS check flags what to fix.</p>
          <Link to="/signup" className="btn-primary mt-6 px-6 py-3">
            Build my ATS-friendly resume
          </Link>
        </div>
      </div>
    </article>
  )
}
