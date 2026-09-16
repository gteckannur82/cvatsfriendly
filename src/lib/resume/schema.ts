import { z } from 'zod'

/**
 * Resume data model. Adapted from RenderCV's `cv` schema (MIT) — sections map to
 * RenderCV entry types: ExperienceEntry, EducationEntry, NormalEntry (projects),
 * OneLineEntry (skills) and a simple certification list. Dates use RenderCV's
 * convention: "YYYY-MM", "YYYY", or "present".
 */

const id = z.string().min(1).max(64)
const short = z.string().max(200)
const text = z.string().max(2000)
const bullets = z.array(z.string().max(600)).max(30)

export const basicsSchema = z.object({
  name: short,
  headline: short,
  email: short,
  phone: short,
  location: short,
  website: short,
  linkedin: short,
  github: short,
})

export const experienceSchema = z.object({
  id,
  company: short,
  position: short,
  location: short,
  startDate: short,
  endDate: short,
  highlights: bullets,
})

export const educationSchema = z.object({
  id,
  institution: short,
  area: short,
  degree: short,
  location: short,
  startDate: short,
  endDate: short,
  highlights: bullets,
})

export const projectSchema = z.object({
  id,
  name: short,
  url: short,
  startDate: short,
  endDate: short,
  summary: text,
  highlights: bullets,
})

export const skillSchema = z.object({ id, label: short, details: text })

export const certificationSchema = z.object({
  id,
  name: short,
  issuer: short,
  date: short,
})

export const SECTION_KEYS = [
  'summary',
  'experience',
  'education',
  'projects',
  'skills',
  'certifications',
] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export const SECTION_TITLES: Record<SectionKey, string> = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  projects: 'Projects',
  skills: 'Skills',
  certifications: 'Certifications',
}

export const resumeDataSchema = z.object({
  basics: basicsSchema,
  summary: text,
  experience: z.array(experienceSchema).max(30),
  education: z.array(educationSchema).max(15),
  projects: z.array(projectSchema).max(20),
  skills: z.array(skillSchema).max(30),
  certifications: z.array(certificationSchema).max(30),
  sectionOrder: z.array(z.enum(SECTION_KEYS)).max(SECTION_KEYS.length),
  pageSize: z.enum(['LETTER', 'A4']),
})

export type ResumeData = z.infer<typeof resumeDataSchema>
export type Basics = z.infer<typeof basicsSchema>
export type Experience = z.infer<typeof experienceSchema>
export type Education = z.infer<typeof educationSchema>
export type Project = z.infer<typeof projectSchema>
export type Skill = z.infer<typeof skillSchema>
export type Certification = z.infer<typeof certificationSchema>

export const uid = () =>
  (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).replace(/-/g, '').slice(0, 12)

export const emptyExperience = (): Experience => ({
  id: uid(),
  company: '',
  position: '',
  location: '',
  startDate: '',
  endDate: '',
  highlights: [''],
})
export const emptyEducation = (): Education => ({
  id: uid(),
  institution: '',
  area: '',
  degree: '',
  location: '',
  startDate: '',
  endDate: '',
  highlights: [],
})
export const emptyProject = (): Project => ({
  id: uid(),
  name: '',
  url: '',
  startDate: '',
  endDate: '',
  summary: '',
  highlights: [''],
})
export const emptySkill = (): Skill => ({ id: uid(), label: '', details: '' })
export const emptyCertification = (): Certification => ({ id: uid(), name: '', issuer: '', date: '' })

export function emptyResume(): ResumeData {
  return {
    basics: { name: '', headline: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '' },
    summary: '',
    experience: [emptyExperience()],
    education: [emptyEducation()],
    projects: [],
    skills: [emptySkill()],
    certifications: [],
    sectionOrder: [...SECTION_KEYS],
    pageSize: 'LETTER',
  }
}

/** Fill missing fields so older/imported data always matches the current schema. */
export function normalizeResume(input: unknown): ResumeData {
  const base = emptyResume()
  const d = (input && typeof input === 'object' ? input : {}) as Partial<ResumeData>
  const order = Array.isArray(d.sectionOrder)
    ? d.sectionOrder.filter((k): k is SectionKey => (SECTION_KEYS as readonly string[]).includes(k))
    : []
  const merged: ResumeData = {
    basics: { ...base.basics, ...(d.basics ?? {}) },
    summary: d.summary ?? '',
    experience: (d.experience ?? []).map((e) => ({ ...emptyExperience(), ...e, highlights: e.highlights ?? [] })),
    education: (d.education ?? []).map((e) => ({ ...emptyEducation(), ...e, highlights: e.highlights ?? [] })),
    projects: (d.projects ?? []).map((e) => ({ ...emptyProject(), ...e, highlights: e.highlights ?? [] })),
    skills: (d.skills ?? []).map((e) => ({ ...emptySkill(), ...e })),
    certifications: (d.certifications ?? []).map((e) => ({ ...emptyCertification(), ...e })),
    sectionOrder: [...order, ...SECTION_KEYS.filter((k) => !order.includes(k))],
    pageSize: d.pageSize === 'A4' ? 'A4' : 'LETTER',
  }
  return merged
}

export function sampleResume(): ResumeData {
  return {
    basics: {
      name: 'Jordan Rivera',
      headline: 'Senior Product Engineer',
      email: 'jordan.rivera@example.com',
      phone: '+1 (555) 014-2290',
      location: 'Austin, TX',
      website: 'jordanrivera.dev',
      linkedin: 'linkedin.com/in/jordanrivera',
      github: 'github.com/jordanrivera',
    },
    summary:
      'Product-minded full-stack engineer with 7+ years building B2B SaaS. Shipped billing, onboarding and analytics features used by 40,000+ customers, and led a 5-person team through a platform migration that cut infrastructure cost by 32%.',
    experience: [
      {
        id: uid(),
        company: 'Northwind Analytics',
        position: 'Senior Software Engineer',
        location: 'Remote',
        startDate: '2021-03',
        endDate: 'present',
        highlights: [
          'Led migration of a monolithic Rails app to a TypeScript service architecture, cutting p95 latency by **48%** and hosting cost by **32%**',
          'Designed usage-based billing on Stripe that grew expansion revenue **18%** in two quarters',
          'Mentored 4 engineers; introduced RFC process adopted across 3 product teams',
        ],
      },
      {
        id: uid(),
        company: 'Brightpath Health',
        position: 'Software Engineer',
        location: 'Austin, TX',
        startDate: '2018-06',
        endDate: '2021-02',
        highlights: [
          'Built patient onboarding flow in React that raised completion rate from 61% to **83%**',
          'Automated HIPAA audit reporting, saving the compliance team ~20 hours per month',
        ],
      },
    ],
    education: [
      {
        id: uid(),
        institution: 'University of Texas at Austin',
        area: 'Computer Science',
        degree: 'BS',
        location: 'Austin, TX',
        startDate: '2014-08',
        endDate: '2018-05',
        highlights: [],
      },
    ],
    projects: [
      {
        id: uid(),
        name: 'OpenQueue',
        url: 'github.com/jordanrivera/openqueue',
        startDate: '2022',
        endDate: '',
        summary: '',
        highlights: ['Open-source job queue for Postgres with 2.1k GitHub stars'],
      },
    ],
    skills: [
      { id: uid(), label: 'Languages', details: 'TypeScript, Python, SQL, Go' },
      { id: uid(), label: 'Frameworks', details: 'React, Node.js, Next.js, Rails' },
      { id: uid(), label: 'Cloud & Tools', details: 'AWS, Cloudflare, PostgreSQL, Stripe, Docker' },
    ],
    certifications: [{ id: uid(), name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2023-04' }],
    sectionOrder: [...SECTION_KEYS],
    pageSize: 'LETTER',
  }
}
