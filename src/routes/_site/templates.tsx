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
    <section className="bg-desk py-16 sm:py-20">
      <div className="container-page">
        <div className="max-w-3xl">
          <h1 className="font-display text-[clamp(2.6rem,5vw,4rem)] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance text-ink">ATS-friendly resume templates</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Every template is single-column, uses standard fonts and headings, and exports as real text. Pick a look; your content stays the same.
          </p>
        </div>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((t) => (
            <article key={t.id}>
              <ScaledResume data={sample} theme={t} />
              <div className="mt-4 flex items-start justify-between gap-3 border-t border-ink pt-3">
                <div>
                  <h2 className="font-display text-xl font-extrabold tracking-[-0.02em] text-ink">{t.name}</h2>
                  <p className="mt-1 text-[15px] leading-snug text-ink-soft">{t.description}</p>
                </div>
                <span className="num shrink-0 pt-1 text-[13px] text-ink">{t.pro ? 'Pro' : 'Free'}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-16">
          <Link to="/signup" className="btn-primary px-6 py-3 text-base">
            Build my resume
          </Link>
        </div>
      </div>
    </section>
  )
}
