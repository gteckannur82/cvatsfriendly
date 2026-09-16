import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { ScaledResume } from '~/components/preview/ResumeHtml'
import { sampleResume } from '~/lib/resume/schema'
import { THEMES } from '~/lib/resume/themes'
import { seo } from '~/lib/site'

export const Route = createFileRoute('/_site/templates')({
  head: () =>
    seo({
      title: 'ATS-Friendly Resume Templates',
      description: 'Free and Pro ATS-friendly resume templates: Classic, Harvard, Engineer, Modern and Compact. Single-column, standard fonts, text-based PDF.',
      path: '/templates',
    }),
  component: Templates,
})

function Templates() {
  const sample = useMemo(() => sampleResume(), [])
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">ATS-friendly resume templates</h1>
          <p className="mt-4 text-lg text-slate-600">
            Every template is single-column, uses standard fonts and headings, and exports as real text. Pick a look — the content stays the same.
          </p>
        </div>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((t) => (
            <article key={t.id} className="group">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 transition group-hover:shadow-lg">
                <ScaledResume data={sample} theme={t} />
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">{t.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{t.description}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${t.pro ? 'bg-amber-100 text-amber-800' : 'bg-brand-50 text-brand-700'}`}>
                  {t.pro ? 'Pro' : 'Free'}
                </span>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link to="/signup" className="btn-primary px-6 py-3 text-base">
            Use a template — free
          </Link>
        </div>
      </div>
    </section>
  )
}
