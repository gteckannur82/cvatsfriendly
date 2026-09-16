import { dump, load } from 'js-yaml'
import { normalizeResume, uid, type ResumeData, type SectionKey } from './schema'

/**
 * Import/export compatible with RenderCV's YAML input format (`cv:` → `sections:`),
 * so users can bring an existing RenderCV file or take their data with them.
 */

type Dict = Record<string, any>
const str = (v: unknown) => (v === undefined || v === null ? '' : String(v))
const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(str) : [])

const SECTION_ALIASES: Record<string, SectionKey> = {
  summary: 'summary',
  about: 'summary',
  profile: 'summary',
  experience: 'experience',
  work_experience: 'experience',
  employment: 'experience',
  education: 'education',
  projects: 'projects',
  skills: 'skills',
  technologies: 'skills',
  certifications: 'certifications',
  certificates: 'certifications',
  licenses_and_certifications: 'certifications',
}

export function fromRenderCvYaml(source: string): ResumeData {
  const doc = load(source) as Dict
  const cv: Dict = doc?.cv ?? doc
  if (!cv || typeof cv !== 'object') throw new Error('Could not find a `cv:` section in this YAML file.')

  const socials: Dict[] = Array.isArray(cv.social_networks) ? cv.social_networks : []
  const social = (network: string) => {
    const s = socials.find((x) => str(x.network).toLowerCase() === network)
    if (!s) return ''
    return network === 'linkedin' ? `linkedin.com/in/${str(s.username)}` : `github.com/${str(s.username)}`
  }
  const first = (v: unknown) => (Array.isArray(v) ? str(v[0]) : str(v))

  const data = normalizeResume({
    basics: {
      name: str(cv.name),
      headline: str(cv.headline ?? cv.label),
      email: first(cv.email),
      phone: first(cv.phone),
      location: str(cv.location),
      website: first(cv.website).replace(/^https?:\/\//, ''),
      linkedin: social('linkedin'),
      github: social('github'),
    },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
  })

  const order: SectionKey[] = []
  const sections: Dict = cv.sections ?? {}
  for (const [rawTitle, entries] of Object.entries(sections)) {
    const key = SECTION_ALIASES[rawTitle.toLowerCase().replace(/\s+/g, '_')]
    if (!key || !Array.isArray(entries)) continue
    if (!order.includes(key)) order.push(key)
    for (const e of entries as unknown[]) {
      const entry: Dict = typeof e === 'object' && e ? (e as Dict) : { text: e }
      const dates = { startDate: str(entry.start_date ?? entry.date), endDate: str(entry.end_date) }
      switch (key) {
        case 'summary':
          data.summary = [data.summary, str(entry.text ?? entry.bullet ?? entry.summary)].filter(Boolean).join(' ')
          break
        case 'experience':
          data.experience.push({
            id: uid(),
            company: str(entry.company ?? entry.name),
            position: str(entry.position),
            location: str(entry.location),
            ...dates,
            highlights: list(entry.highlights),
          })
          break
        case 'education':
          data.education.push({
            id: uid(),
            institution: str(entry.institution),
            area: str(entry.area),
            degree: str(entry.degree),
            location: str(entry.location),
            ...dates,
            highlights: list(entry.highlights),
          })
          break
        case 'projects':
          data.projects.push({
            id: uid(),
            name: str(entry.name),
            url: '',
            ...dates,
            summary: str(entry.summary),
            highlights: list(entry.highlights),
          })
          break
        case 'skills':
          if (entry.label !== undefined) data.skills.push({ id: uid(), label: str(entry.label), details: str(entry.details) })
          else if (entry.bullet || entry.text) data.skills.push({ id: uid(), label: '', details: str(entry.bullet ?? entry.text) })
          break
        case 'certifications':
          data.certifications.push({
            id: uid(),
            name: str(entry.name ?? entry.label ?? entry.bullet ?? entry.text),
            issuer: str(entry.details ?? entry.summary),
            date: str(entry.date),
          })
          break
      }
    }
  }
  data.sectionOrder = normalizeResume({ sectionOrder: order }).sectionOrder
  return data
}

export function toRenderCvYaml(d: ResumeData): string {
  const sections: Dict = {}
  const dates = (s: string, e: string) => ({ ...(s ? { start_date: s } : {}), ...(e ? { end_date: e } : {}) })
  for (const key of d.sectionOrder) {
    switch (key) {
      case 'summary':
        if (d.summary.trim()) sections.summary = [d.summary]
        break
      case 'experience':
        if (d.experience.length)
          sections.experience = d.experience.map((e) => ({
            company: e.company,
            position: e.position,
            ...(e.location ? { location: e.location } : {}),
            ...dates(e.startDate, e.endDate),
            highlights: e.highlights.filter(Boolean),
          }))
        break
      case 'education':
        if (d.education.length)
          sections.education = d.education.map((e) => ({
            institution: e.institution,
            area: e.area,
            ...(e.degree ? { degree: e.degree } : {}),
            ...(e.location ? { location: e.location } : {}),
            ...dates(e.startDate, e.endDate),
            highlights: e.highlights.filter(Boolean),
          }))
        break
      case 'projects':
        if (d.projects.length)
          sections.projects = d.projects.map((p) => ({
            name: p.name,
            ...dates(p.startDate, p.endDate),
            ...(p.summary ? { summary: p.summary } : {}),
            highlights: p.highlights.filter(Boolean),
          }))
        break
      case 'skills':
        if (d.skills.length) sections.skills = d.skills.map((s) => ({ label: s.label, details: s.details }))
        break
      case 'certifications':
        if (d.certifications.length)
          sections.certifications = d.certifications.map((c) => ({ label: c.name, details: [c.issuer, c.date].filter(Boolean).join(', ') }))
        break
    }
  }
  const socials = [
    d.basics.linkedin && { network: 'LinkedIn', username: d.basics.linkedin.split('/').filter(Boolean).pop() },
    d.basics.github && { network: 'GitHub', username: d.basics.github.split('/').filter(Boolean).pop() },
  ].filter(Boolean)
  const cv: Dict = {
    name: d.basics.name,
    ...(d.basics.headline ? { headline: d.basics.headline } : {}),
    ...(d.basics.location ? { location: d.basics.location } : {}),
    ...(d.basics.email ? { email: d.basics.email } : {}),
    ...(d.basics.phone ? { phone: d.basics.phone } : {}),
    ...(d.basics.website ? { website: d.basics.website.startsWith('http') ? d.basics.website : `https://${d.basics.website}` } : {}),
    ...(socials.length ? { social_networks: socials } : {}),
    sections,
  }
  return dump({ cv }, { lineWidth: 120 })
}
