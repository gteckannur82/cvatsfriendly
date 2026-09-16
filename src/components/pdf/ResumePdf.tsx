import { Document, Font, Link, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { ResumeData, SectionKey } from '~/lib/resume/schema'
import { SECTION_TITLES } from '~/lib/resume/schema'
import { contactItems, formatDate, formatDateRange, hasText, parseInline } from '~/lib/resume/format'
import type { ResumeTheme } from '~/lib/resume/themes'

// Never hyphenate: split words ("fea-tures") break ATS keyword matching.
Font.registerHyphenationCallback((word) => [word])

/**
 * Text-based PDF (selectable, standard PDF core fonts, single column) — the format
 * ATS parsers read most reliably. Mirrors ResumeHtml using the same theme config.
 */

const fonts = (t: ResumeTheme) =>
  t.font === 'serif'
    ? { regular: 'Times-Roman', bold: 'Times-Bold', italic: 'Times-Italic' }
    : { regular: 'Helvetica', bold: 'Helvetica-Bold', italic: 'Helvetica-Oblique' }

function Inline({ text, boldFont }: { text: string; boldFont: string }) {
  return (
    <>
      {parseInline(text).map((s, i) =>
        s.bold ? (
          <Text key={i} style={{ fontFamily: boldFont }}>
            {s.text}
          </Text>
        ) : (
          s.text
        ),
      )}
    </>
  )
}

export function ResumePdfDocument({ data, theme, title }: { data: ResumeData; theme: ResumeTheme; title: string }) {
  const f = fonts(theme)
  const b = data.basics
  const s = StyleSheet.create({
    page: {
      paddingTop: theme.margin,
      paddingBottom: theme.margin,
      paddingHorizontal: theme.margin,
      fontFamily: f.regular,
      fontSize: theme.bodySize,
      lineHeight: theme.lineHeight,
      color: '#000',
    },
    name: {
      fontFamily: theme.nameBold ? f.bold : f.regular,
      fontSize: theme.nameSize,
      color: theme.accent,
      textAlign: theme.headerAlign,
      lineHeight: 1.1,
    },
    headline: { fontSize: theme.bodySize + 1, textAlign: theme.headerAlign, marginTop: 4 },
    contacts: { fontSize: theme.bodySize - 0.5, textAlign: theme.headerAlign, marginTop: 4 },
    sectionTitle: {
      fontFamily: f.bold,
      fontSize: theme.sectionTitleSize,
      color: theme.accent,
      marginTop: theme.sectionGap,
      marginBottom: 4,
      lineHeight: 1.2,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    right: { textAlign: 'right', marginLeft: 12 },
    bold: { fontFamily: f.bold },
    italic: { fontFamily: f.italic },
    bulletRow: { flexDirection: 'row', marginTop: 1 },
    bulletDot: { width: 10 },
    bulletText: { flex: 1 },
    line: { flexGrow: 1, height: 0.8, backgroundColor: theme.accent },
  })

  const title_ = (t: string) => (theme.uppercaseTitles ? t.toUpperCase() : t)
  const SectionTitle = ({ children }: { children: string }) => {
    const text = <Text style={theme.uppercaseTitles ? { letterSpacing: 0.6 } : undefined}>{title_(children)}</Text>
    switch (theme.sectionTitle) {
      case 'partial-line':
        return (
          <View style={[s.sectionTitle, { flexDirection: 'row', alignItems: 'center' }]} minPresenceAhead={40}>
            {text}
            <View style={[s.line, { marginLeft: 6 }]} />
          </View>
        )
      case 'centered-line':
        return (
          <View style={[s.sectionTitle, { flexDirection: 'row', alignItems: 'center' }]} minPresenceAhead={40}>
            <View style={[s.line, { marginRight: 6 }]} />
            {text}
            <View style={[s.line, { marginLeft: 6 }]} />
          </View>
        )
      case 'full-line':
        return (
          <View style={[s.sectionTitle, { borderBottomWidth: 0.8, borderBottomColor: theme.accent, paddingBottom: 1 }]} minPresenceAhead={40}>
            {text}
          </View>
        )
      default:
        return (
          <View style={s.sectionTitle} minPresenceAhead={40}>
            {text}
          </View>
        )
    }
  }

  const Header = ({ left, leftSub, right, rightSub }: { left: ReactNode; leftSub?: ReactNode; right?: string; rightSub?: string }) => (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        {left}
        {leftSub}
      </View>
      {right || rightSub ? (
        <View style={s.right}>
          {right ? <Text>{right}</Text> : null}
          {rightSub ? <Text>{rightSub}</Text> : null}
        </View>
      ) : null}
    </View>
  )

  const Bullets = ({ items }: { items: string[] }) => (
    <View style={{ marginTop: 2 }}>
      {items
        .filter((x) => x.trim())
        .map((x, i) => (
          <View key={i} style={s.bulletRow} wrap={false}>
            <Text style={s.bulletDot}>•</Text>
            <Text style={s.bulletText}>
              <Inline text={x} boldFont={f.bold} />
            </Text>
          </View>
        ))}
    </View>
  )

  const gap = theme.entryGap
  const sections: Record<SectionKey, ReactNode> = {
    summary: hasText(data.summary) ? (
      <Text style={{ textAlign: 'justify' }}>
        <Inline text={data.summary} boldFont={f.bold} />
      </Text>
    ) : null,
    experience: data.experience.filter((e) => hasText(e.company, e.position)).length
      ? data.experience
          .filter((e) => hasText(e.company, e.position))
          .map((e) => (
            <View key={e.id} style={{ marginTop: gap }}>
              <Header
                left={<Text style={s.bold}>{e.company}</Text>}
                leftSub={e.position ? <Text style={s.italic}>{e.position}</Text> : undefined}
                right={formatDateRange(e.startDate, e.endDate)}
                rightSub={e.location}
              />
              <Bullets items={e.highlights} />
            </View>
          ))
      : null,
    education: data.education.filter((e) => hasText(e.institution)).length
      ? data.education
          .filter((e) => hasText(e.institution))
          .map((e) => (
            <View key={e.id} style={{ marginTop: gap }} wrap={false}>
              <Header
                left={<Text style={s.bold}>{e.institution}</Text>}
                leftSub={[e.degree, e.area].filter(Boolean).length ? <Text>{[e.degree, e.area].filter(Boolean).join(' in ')}</Text> : undefined}
                right={formatDateRange(e.startDate, e.endDate)}
                rightSub={e.location}
              />
              <Bullets items={e.highlights} />
            </View>
          ))
      : null,
    projects: data.projects.filter((p) => hasText(p.name)).length
      ? data.projects
          .filter((p) => hasText(p.name))
          .map((p) => (
            <View key={p.id} style={{ marginTop: gap }}>
              <Header
                left={<Text style={s.bold}>{p.name}</Text>}
                leftSub={p.url ? <Link src={p.url.startsWith('http') ? p.url : `https://${p.url}`} style={{ color: '#000', textDecoration: 'none' }}>{p.url}</Link> : undefined}
                right={formatDateRange(p.startDate, p.endDate)}
              />
              {p.summary ? (
                <Text>
                  <Inline text={p.summary} boldFont={f.bold} />
                </Text>
              ) : null}
              <Bullets items={p.highlights} />
            </View>
          ))
      : null,
    skills: data.skills.filter((x) => hasText(x.details)).length ? (
      <View style={{ marginTop: 2 }}>
        {data.skills
          .filter((x) => hasText(x.details))
          .map((x) => (
            <Text key={x.id} style={{ marginTop: 2 }}>
              {x.label ? <Text style={s.bold}>{x.label}: </Text> : null}
              {x.details}
            </Text>
          ))}
      </View>
    ) : null,
    certifications: data.certifications.filter((c) => hasText(c.name)).length ? (
      <View style={{ marginTop: 2 }}>
        {data.certifications
          .filter((c) => hasText(c.name))
          .map((c) => (
            <Header
              key={c.id}
              left={
                <Text>
                  <Text style={s.bold}>{c.name}</Text>
                  {c.issuer ? ` — ${c.issuer}` : ''}
                </Text>
              }
              right={formatDate(c.date)}
            />
          ))}
      </View>
    ) : null,
  }

  return (
    <Document title={title} author={b.name} subject="Resume" creator="cvatsfriendly.com" producer="cvatsfriendly.com" keywords={b.headline}>
      <Page size={data.pageSize} style={s.page}>
        <View>
          <Text style={s.name}>{b.name || 'Your Name'}</Text>
          {b.headline ? <Text style={s.headline}>{b.headline}</Text> : null}
          {contactItems(b).length ? <Text style={s.contacts}>{contactItems(b).join(`  ${theme.separator}  `)}</Text> : null}
        </View>
        {data.sectionOrder.map((key) =>
          sections[key] ? (
            <View key={key}>
              <SectionTitle>{SECTION_TITLES[key]}</SectionTitle>
              {sections[key]}
            </View>
          ) : null,
        )}
      </Page>
    </Document>
  )
}

export async function renderResumePdfBlob(data: ResumeData, theme: ResumeTheme, title: string) {
  return pdf(<ResumePdfDocument data={data} theme={theme} title={title} />).toBlob()
}
