import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '~/server/env'
import { createSession, destroySession, getSessionUser, toPublicUser, type UserRow } from '~/server/auth'
import { hashPassword, newId, verifyPassword } from '~/server/crypto'

export const getMe = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getSessionUser()
  return user ? toPublicUser(user) : null
})

const credentials = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(200),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(200),
})

export const signup = createServerFn({ method: 'POST' })
  .validator(credentials.extend({ name: z.string().trim().max(100).default('') }))
  .handler(async ({ data }) => {
    const existing = await db().prepare('SELECT id FROM users WHERE email = ?').bind(data.email).first()
    if (existing) throw new Error('An account with this email already exists. Try logging in.')
    const id = newId()
    await db()
      .prepare('INSERT INTO users (id, email, name, password_hash, plan, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, data.email, data.name, await hashPassword(data.password), 'free', Date.now())
      .run()
    await createSession(id)
    return { ok: true }
  })

export const login = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.string().trim().toLowerCase().max(200), password: z.string().max(200) }))
  .handler(async ({ data }) => {
    const user = await db().prepare('SELECT * FROM users WHERE email = ?').bind(data.email).first<UserRow>()
    // Always run a hash comparison to keep response timing similar for unknown emails.
    const ok = await verifyPassword(
      data.password,
      user?.password_hash ?? 'pbkdf2$60000$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000',
    )
    if (!user || !ok) throw new Error('Incorrect email or password.')
    await createSession(user.id)
    return { ok: true }
  })

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  await destroySession()
  return { ok: true }
})

export const changePassword = createServerFn({ method: 'POST' })
  .validator(z.object({ current: z.string().max(200), next: z.string().min(8, 'New password must be at least 8 characters.').max(200) }))
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    if (!user) throw new Error('Please log in to continue.')
    if (!(await verifyPassword(data.current, user.password_hash))) throw new Error('Current password is incorrect.')
    await db().prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(await hashPassword(data.next), user.id).run()
    return { ok: true }
  })
