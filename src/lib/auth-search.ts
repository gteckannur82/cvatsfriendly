import { z } from 'zod'

export const authSearch = z.object({
  redirect: z.string().startsWith('/').optional().catch(undefined),
  plan: z.enum(['pro']).optional().catch(undefined),
})

/** Only allow same-site relative redirects. */
export const safeRedirect = (r?: string, plan?: 'pro') =>
  plan === 'pro' ? '/app/billing' : r && r.startsWith('/') && !r.startsWith('//') ? r : '/app'
