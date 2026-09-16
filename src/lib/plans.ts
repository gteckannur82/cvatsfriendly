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

export const PLAN_FEATURES = {
  free: ['2 resumes', 'Classic & Harvard templates', '5 AI rewrites per day', '3 saved versions per resume', 'ATS check & PDF export'],
  pro: [
    'Up to 50 resumes (one per application)',
    'All 5 ATS-friendly templates',
    '150 AI rewrites & tailoring per day',
    'Unlimited saved versions',
    'Job-description keyword matching',
    'Cancel anytime',
  ],
}

export function limitsFor(plan: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[plan === 'pro' ? 'pro' : 'free']
}
