import { env as cfEnv } from 'cloudflare:workers'

export interface Secrets {
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_ID?: string
  ANTHROPIC_API_KEY?: string
  ANTHROPIC_MODEL?: string
  AI_MOCK?: string
}

export type AppEnv = Env & Secrets

export const env = cfEnv as AppEnv
export const db = () => env.DB
