import { THEMES } from './resume/themes'

export type PlanId = 'free' | 'pro'

export interface PlanLimits {
  maxResumes: number
  maxVersionsPerResume: number
  aiPerDay: number
  proTemplates: boolean
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { maxResumes: 2, maxVersionsPerResume: 3, aiPerDay: 5, proTemplates: false },
  pro: { maxResumes: 50, maxVersionsPerResume: 100, aiPerDay: 150, proTemplates: true },
}

export const PRO_PRICE_DISPLAY = '$9'

/** Credits each AI action consumes. Enforced in ai.fn.ts and quoted in marketing copy. */
export const AI_CREDIT_COST = { rewriteBullet: 1, improveRole: 1, writeSummary: 1, tailorResume: 3 } as const

export const AI_CREDIT_NOTE = `One AI credit covers a bullet rewrite, a role improvement or a summary. Tailoring a whole resume to a job uses ${AI_CREDIT_COST.tailorResume}.`

// Plan copy is derived from the enforced limits so the pricing page can't drift from what the app allows.
const FREE = PLAN_LIMITS.free
const PRO = PLAN_LIMITS.pro
const FREE_TEMPLATES = THEMES.filter((t) => !t.pro).map((t) => t.name)

export const PLAN_FEATURES = {
  free: [
    `${FREE.maxResumes} resumes`,
    `${FREE_TEMPLATES.join(' & ')} templates`,
    `${FREE.aiPerDay} AI credits a day`,
    `${FREE.maxVersionsPerResume} saved versions per resume`,
    'ATS check, keyword match & PDF export',
  ],
  pro: [
    `Up to ${PRO.maxResumes} resumes, one per application`,
    `All ${THEMES.length} templates`,
    `${PRO.aiPerDay} AI credits a day`,
    `${PRO.maxVersionsPerResume} saved versions per resume`,
    'Cancel anytime',
  ],
}

export function limitsFor(plan: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[plan === 'pro' ? 'pro' : 'free']
}
