import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { ResumeData, SectionKey } from '~/lib/resume/schema'
import { SECTION_TITLES } from '~/lib/resume/schema'
import { contactItems, formatDate, formatDateRange, hasText, parseInline } from '~/lib/resume/format'
import type { ResumeTheme } from '~/lib/resume/themes'

export const PAGE_PX = { LETTER: { w: 816, h: 1056 }, A4: { w: 794, h: 1123 } } as const
const PT = 96 / 72 // CSS px per PDF point

const fontStack = (t: ResumeTheme) =>
  t.font === 'serif' ? `'Times New Roman', Times, 'Liberation Serif', serif` : `Helvetica, Arial, 'Liberation Sans', sans-serif`

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((s, i) => (s.bold ? <strong key={i}>{s.text}</strong> : <span key={i}>{s.text}</span>))}
    </>
  )
}

function SectionTitle({ theme, children }: { theme: ResumeTheme; children: string }) {
  const title = theme.uppercaseTitles ? children.toUpperCase() : children
  const base: CSSProperties = {
    color: theme.accent,
    fontSize: theme.sectionTitleSize * PT,
    fontWeight: 700,
    letterSpacing: theme.uppercaseTitles ? '0.06em' : undefined,
    margin: `${theme.sectionGap * PT}px 0 ${4 * PT}px`,
    lineHeight: 1.2,
  }
  const line = <div style={{ flex: 1, height: 1, background: theme.accent, opacity: 0.8 }} />
  switch (theme.sectionTitle) {
    case 'partial-line':
      return (
        <div style={{ ...base, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{title}</span>
          {line}
        </div>
      )
    case 'centered-line':
      return (
        <div style={{ ...base, display: 'flex', alignItems: 'center', gap: 8 }}>
          {line}
          <span>{title}</span>
          {line}
        </div>
      )
    case 'full-line':
      return <div style={{ ...base, borderBottom: `1px solid ${theme.accent}`, paddingBottom: 2 }}>{title}</div>
    default:
      return <div style={base}>{title}</div>
  }
}

function EntryHeader({ left, leftSub, right, rightSub }: { left: ReactNode; leftSub?: ReactNode; right?: string; rightSub?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div>{left}</div>
        {leftSub ? <div>{leftSub}</div> : null}
      </div>
      {right || rightSub ? (
        <div style={{ textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {right ? <div>{right}</div> : null}
          {rightSub ? <div>{rightSub}</div> : null}
        </div>
      ) : null}
    </div>
  )
}

function Bullets({ items }: { items: string[] }) {
  const list = items.filter((b) => b.trim())
  if (!list.length) return null
  return (
    <ul style={{ margin: `${2 * PT}px 0 0`, paddingLeft: 16, listStyleType: 'disc' }}>
      {list.map((b, i) => (
        <li key={i} style={{ marginTop: 1 }}>
          <Inline text={b} />
        </li>
      ))}
    </ul>
  )
}

export function ResumeHtml({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
  const page = PAGE_PX[data.pageSize]
  const b = data.basics
  const contacts = contactItems(b)
  const gap = theme.entryGap * PT

  const sections: Record<SectionKey, ReactNode> = {
    summary: hasText(data.summary) ? (
      <p style={{ margin: 0, textAlign: 'justify' }}>
        <Inline text={data.summary} />
      </p>
    ) : null,
    experience: data.experience.some((e) => hasText(e.company, e.position)) ? (
      data.experience
        .filter((e) => hasText(e.company, e.position))
        .map((e) => (
          <div key={e.id} style={{ marginTop: gap }}>
            <EntryHeader
              left={<strong>{e.company}</strong>}
              leftSub={e.position ? <em>{e.position}</em> : undefined}
              right={formatDateRange(e.startDate, e.endDate)}
              rightSub={e.location}
            />
            <Bullets items={e.highlights} />
          </div>
        ))
    ) : null,
    education: data.education.some((e) => hasText(e.institution)) ? (
      data.education
        .filter((e) => hasText(e.institution))
        .map((e) => (
          <div key={e.id} style={{ marginTop: gap }}>
            <EntryHeader
              left={<strong>{e.institution}</strong>}
              leftSub={[e.degree, e.area].filter(Boolean).join(' in ') || undefined}
              right={formatDateRange(e.startDate, e.endDate)}
              rightSub={e.location}
            />
            <Bullets items={e.highlights} />
          </div>
        ))
    ) : null,
    projects: data.projects.some((p) => hasText(p.name)) ? (
      data.projects
        .filter((p) => hasText(p.name))
        .map((p) => (
          <div key={p.id} style={{ marginTop: gap }}>
            <EntryHeader left={<strong>{p.name}</strong>} leftSub={p.url || undefined} right={formatDateRange(p.startDate, p.endDate)} />
            {p.summary ? (
              <div>
                <Inline text={p.summary} />
              </div>
            ) : null}
            <Bullets items={p.highlights} />
          </div>
        ))
    ) : null,
    skills: data.skills.some((s) => hasText(s.details)) ? (
      <div style={{ marginTop: 2 }}>
        {data.skills
          .filter((s) => hasText(s.details))
          .map((s) => (
            <div key={s.id} style={{ marginTop: 2 }}>
              {s.label ? <strong>{s.label}: </strong> : null}
              {s.details}
            </div>
          ))}
      </div>
    ) : null,
    certifications: data.certifications.some((c) => hasText(c.name)) ? (
      <div style={{ marginTop: 2 }}>
        {data.certifications
          .filter((c) => hasText(c.name))
          .map((c) => (
            <EntryHeader key={c.id} left={<><strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ''}</>} right={formatDate(c.date)} />
          ))}
      </div>
    ) : null,
  }

  return (
    <div
      className="resume-paper"
      style={{
        width: page.w,
        minHeight: page.h,
        padding: theme.margin * PT,
        fontFamily: fontStack(theme),
        fontSize: theme.bodySize * PT,
        lineHeight: theme.lineHeight,
        boxSizing: 'border-box',
      }}
    >
      <header style={{ textAlign: theme.headerAlign }}>
        <div style={{ fontSize: theme.nameSize * PT, fontWeight: theme.nameBold ? 700 : 400, color: theme.accent, lineHeight: 1.1 }}>
          {b.name || 'Your Name'}
        </div>
        {b.headline ? <div style={{ marginTop: 4 * PT, fontSize: (theme.bodySize + 1) * PT }}>{b.headline}</div> : null}
        {contacts.length ? (
          <div style={{ marginTop: 4 * PT, fontSize: (theme.bodySize - 0.5) * PT }}>{contacts.join(`  ${theme.separator}  `)}</div>
        ) : null}
      </header>
      {data.sectionOrder.map((key) =>
        sections[key] ? (
          <section key={key}>
            <SectionTitle theme={theme}>{SECTION_TITLES[key]}</SectionTitle>
            {sections[key]}
          </section>
        ) : null,
      )}
    </div>
  )
}

/** Scales a fixed-size resume page to fit its container width. */
export function ScaledResume({ data, theme, maxScale = 1 }: { data: ResumeData; theme: ResumeTheme; maxScale?: number }) {
  const wrap = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  const [height, setHeight] = useState<number>(PAGE_PX[data.pageSize].h)
  const page = PAGE_PX[data.pageSize]

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const update = () => {
      setScale(Math.min(maxScale, el.clientWidth / page.w))
      if (inner.current) setHeight(inner.current.offsetHeight)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (inner.current) ro.observe(inner.current)
    return () => ro.disconnect()
  }, [page.w, maxScale])

  return (
    <div ref={wrap} style={{ width: '100%', height: height * scale, position: 'relative' }}>
      <div ref={inner} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: page.w, position: 'absolute', left: 0, top: 0 }}>
        <ResumeHtml data={data} theme={theme} />
      </div>
    </div>
  )
}
