import type { ResumeData } from './schema'
import { stripMarkdown } from './format'

export interface AtsCheck {
  id: string
  label: string
  passed: boolean
  tip: string
  weight: number
}

const ACTION_VERBS = new Set(
  (
    'accelerated achieved administered analyzed architected automated boosted built championed coached collaborated ' +
    'completed conducted consolidated created cut decreased delivered deployed designed developed directed drove ' +
    'eliminated enabled engineered established exceeded expanded facilitated founded generated grew guided identified ' +
    'implemented improved increased initiated integrated introduced launched led maintained managed mentored migrated ' +
    'modernized negotiated optimized orchestrated organized oversaw owned partnered pioneered planned produced ' +
    'programmed raised redesigned reduced refactored resolved restructured revamped saved scaled secured shipped ' +
    'simplified spearheaded standardized streamlined strengthened supervised trained transformed tripled doubled won wrote'
  ).split(' '),
)

const allBullets = (d: ResumeData) =>
  [...d.experience.flatMap((e) => e.highlights), ...d.projects.flatMap((p) => p.highlights)]
    .map((b) => stripMarkdown(b).trim())
    .filter(Boolean)

export function runAtsChecks(d: ResumeData): { score: number; checks: AtsCheck[] } {
  const bullets = allBullets(d)
  const words = (s: string) => s.split(/\s+/).filter(Boolean)
  const withNumbers = bullets.filter((b) => /\d/.test(b)).length
  const withVerbs = bullets.filter((b) => ACTION_VERBS.has(words(b)[0]?.toLowerCase().replace(/[^a-z]/g, '') ?? '')).length
  const firstPerson = bullets.some((b) => /\b(I|me|my)\b/.test(b)) || /\b(I|me|my)\b/.test(d.summary)
  const summaryWords = words(d.summary).length
  const roles = d.experience.filter((e) => e.company.trim() || e.position.trim())
  const ratio = (n: number) => (bullets.length ? n / bullets.length : 0)
  const totalWords =
    summaryWords + bullets.reduce((n, b) => n + words(b).length, 0) + d.skills.reduce((n, s) => n + words(s.details).length, 0)

  const checks: AtsCheck[] = [
    {
      id: 'contact',
      label: 'Name, email and phone are present',
      passed: !!(d.basics.name.trim() && d.basics.email.trim() && d.basics.phone.trim()),
      tip: 'Recruiters and ATS need a name, email and phone number in the header.',
      weight: 15,
    },
    {
      id: 'summary',
      label: 'Summary is 25–80 words',
      passed: summaryWords >= 25 && summaryWords <= 80,
      tip: 'A short, keyword-rich summary helps both ATS ranking and a 6-second human scan.',
      weight: 10,
    },
    {
      id: 'experience',
      label: 'Every role has a title, company and dates',
      passed: roles.length > 0 && roles.every((e) => e.company.trim() && e.position.trim() && e.startDate.trim()),
      tip: 'ATS parsers look for job title, employer and dates to build your work history.',
      weight: 15,
    },
    {
      id: 'bullets',
      label: 'Each role has at least 2 bullet points',
      passed: roles.length > 0 && roles.every((e) => e.highlights.filter((h) => h.trim()).length >= 2),
      tip: 'Use 2–6 bullets per role that describe outcomes, not duties.',
      weight: 10,
    },
    {
      id: 'metrics',
      label: 'At least 40% of bullets include numbers',
      passed: ratio(withNumbers) >= 0.4,
      tip: 'Quantify impact: %, $, time saved, users, team size. Try the AI "Improve" button.',
      weight: 15,
    },
    {
      id: 'verbs',
      label: 'Bullets start with strong action verbs',
      passed: ratio(withVerbs) >= 0.6,
      tip: 'Start bullets with verbs like "Led", "Built", "Reduced", "Launched".',
      weight: 10,
    },
    {
      id: 'length',
      label: 'Bullets are concise (under 35 words)',
      passed: bullets.length > 0 && bullets.every((b) => words(b).length <= 35),
      tip: 'Long bullets get skimmed. Split or trim anything over two lines.',
      weight: 5,
    },
    {
      id: 'pronouns',
      label: 'No first-person pronouns',
      passed: !firstPerson,
      tip: 'Drop "I", "me" and "my" — resumes are written in implied first person.',
      weight: 5,
    },
    {
      id: 'skills',
      label: 'Skills section lists keywords',
      passed: d.skills.some((s) => s.details.split(',').filter((x) => x.trim()).length >= 3),
      tip: 'List tools and competencies exactly as they appear in job descriptions.',
      weight: 10,
    },
    {
      id: 'wordcount',
      label: 'Total length 250–900 words',
      passed: totalWords >= 250 && totalWords <= 900,
      tip: 'Aim for one page (early career) or two pages (senior). Too short reads thin.',
      weight: 5,
    },
  ]
  const total = checks.reduce((n, c) => n + c.weight, 0)
  const score = Math.round((checks.filter((c) => c.passed).reduce((n, c) => n + c.weight, 0) / total) * 100)
  return { score, checks }
}

const STOPWORDS = new Set(
  (
    'a about above across after again against all also am an and any are as at be because been before being below between both but by ' +
    'can could did do does doing down during each either etc every few for from further had has have having he her here hers him his how ' +
    'i if in into is it its itself just least less like may me more most must my no nor not now of off on once only or other our ours out ' +
    'over own per plus same she should so some such than that the their them then there these they this those through to too under until ' +
    'up upon us very via was we were what when where which while who whom why will with within without would you your yours ' +
    'ability able across apply applicant applicants role roles position candidate candidates company team teams work working ' +
    'experience experienced years year strong excellent good great including include includes new job opportunity looking ' +
    'responsibilities requirements qualifications preferred required requires require plus bonus benefits salary equal employer ' +
    'etc ideal ideally using use used help helping ensure make making within across well related field based day days time join us ' +
    'we’re you’ll you’re will be our their other others what who where knowledge skills skill understanding environment ' +
    'hiring hire essential build building own owning partner partnering decisions decision nice have highly proven solid deep ' +
    'across multiple various fast paced dynamic passionate motivated self starter degree bachelor bachelors related equivalent'
  ).split(/\s+/),
)

/** Extracts likely keywords (single terms + frequent bigrams) from a job description. */
export function extractKeywords(jobDescription: string, limit = 30): string[] {
  const clean = jobDescription.toLowerCase().replace(/[^a-z0-9+#./\s-]/g, ' ')
  const tokens = clean
    .split(/\s+/)
    .map((t) => t.replace(/^[.\-/]+|[.\-/]+$/g, ''))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t) && !/^\d+$/.test(t))
  const counts = new Map<string, number>()
  tokens.forEach((t, i) => {
    counts.set(t, (counts.get(t) ?? 0) + 1)
    const next = tokens[i + 1]
    if (next) {
      const bigram = `${t} ${next}`
      counts.set(bigram, (counts.get(bigram) ?? 0) + 0.8)
    }
  })
  return [...counts.entries()]
    .filter(([k, n]) => (k.includes(' ') ? n >= 1.6 : n >= 1))
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([k]) => k)
    .slice(0, limit)
}

export function resumePlainText(d: ResumeData): string {
  return [
    d.basics.headline,
    d.summary,
    ...d.experience.flatMap((e) => [e.position, e.company, ...e.highlights]),
    ...d.education.flatMap((e) => [e.degree, e.area, e.institution, ...e.highlights]),
    ...d.projects.flatMap((p) => [p.name, p.summary, ...p.highlights]),
    ...d.skills.flatMap((s) => [s.label, s.details]),
    ...d.certifications.flatMap((c) => [c.name, c.issuer]),
  ]
    .map(stripMarkdown)
    .join(' \n ')
    .toLowerCase()
}

export function keywordMatch(d: ResumeData, jobDescription: string) {
  const keywords = extractKeywords(jobDescription)
  const haystack = resumePlainText(d)
  const matched = keywords.filter((k) => haystack.includes(k))
  const missing = keywords.filter((k) => !haystack.includes(k))
  const score = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0
  return { keywords, matched, missing, score }
}
