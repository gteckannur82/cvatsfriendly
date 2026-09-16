import { deleteCookie, getCookie, getRequest, setCookie } from '@tanstack/react-start/server'
import { db } from './env'
import { randomToken, sha256Hex } from './crypto'

export const SESSION_COOKIE = 'cvaf_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30

export interface UserRow {
  id: string
  email: string
  name: string
  password_hash: string
  plan: string
  phone: string | null
  subscription_status: string | null
  current_period_end: number | null
  created_at: number
}

export interface PublicUser {
  id: string
  email: string
  name: string
  phone: string | null
  plan: 'free' | 'pro'
  subscriptionStatus: string | null
  currentPeriodEnd: number | null
}

export function toPublicUser(u: UserRow): PublicUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    plan: u.plan === 'pro' ? 'pro' : 'free',
    subscriptionStatus: u.subscription_status,
    currentPeriodEnd: u.current_period_end,
  }
}

const isSecure = () => {
  try {
    return new URL(getRequest().url).protocol === 'https:'
  } catch {
    return true
  }
}

export async function createSession(userId: string) {
  const token = randomToken()
  const now = Date.now()
  await db()
    .prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(await sha256Hex(token), userId, now + SESSION_TTL_MS, now)
    .run()
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecure(),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export async function destroySession() {
  const token = getCookie(SESSION_COOKIE)
  if (token) await db().prepare('DELETE FROM sessions WHERE id = ?').bind(await sha256Hex(token)).run()
  deleteCookie(SESSION_COOKIE, { path: '/' })
}

export async function getSessionUser(): Promise<UserRow | null> {
  const token = getCookie(SESSION_COOKIE)
  if (!token) return null
  const row = await db()
    .prepare(
      `SELECT u.*, s.expires_at AS session_expires FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
    )
    .bind(await sha256Hex(token))
    .first<UserRow & { session_expires: number }>()
  if (!row || row.session_expires < Date.now()) return null
  return expireLapsedPro(row)
}

/** One-time payments don't renew, so a lapsed Pro period downgrades on the next read. */
async function expireLapsedPro(row: UserRow): Promise<UserRow> {
  if (row.plan !== 'pro' || !row.current_period_end || row.current_period_end * 1000 > Date.now()) return row
  await db().prepare(`UPDATE users SET plan = 'free', subscription_status = 'expired' WHERE id = ?`).bind(row.id).run()
  return { ...row, plan: 'free', subscription_status: 'expired' }
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message)
  }
}

export async function requireUser(): Promise<UserRow> {
  const user = await getSessionUser()
  if (!user) throw new HttpError(401, 'Please log in to continue.', 'UNAUTHORIZED')
  return user
}
