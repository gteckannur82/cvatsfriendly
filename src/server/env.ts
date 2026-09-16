import { env as cfEnv } from 'cloudflare:workers'

export interface Secrets {
  /** Comma-separated email allowlist for the admin dashboard. */
  ADMIN_EMAILS?: string
  CASHFREE_APP_ID?: string
  CASHFREE_SECRET_KEY?: string
  /** 'production' hits api.cashfree.com; anything else stays on the sandbox. */
  CASHFREE_ENV?: string
  ANTHROPIC_API_KEY?: string
  ANTHROPIC_MODEL?: string
  GROQ_API_KEY?: string
  GROQ_MODEL?: string
  AI_MOCK?: string
}

export type AppEnv = Env & Secrets

export const env = cfEnv as AppEnv
export const db = () => env.DB
