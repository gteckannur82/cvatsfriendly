import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '~/server/env'
import { requireUser, type UserRow } from '~/server/auth'
import { bulletVariantsTask, generateJson, roleBulletsTask, summaryTask, tailorTask, type TailorResult } from '~/server/ai'
import { limitsFor } from '~/lib/plans'
import { resumeDataSchema } from '~/lib/resume/schema'
import { resumePlainText } from '~/lib/resume/ats'
import { UPGRADE_PREFIX } from '~/lib/errors'

const today = () => new Date().toISOString().slice(0, 10)

/** Reserves `cost` AI credits for today, throwing if the plan's daily limit is reached. */
async function consumeCredit(user: UserRow, cost = 1) {
  const limit = limitsFor(user.plan).aiPerDay
  const day = today()
  const row = await db()
    .prepare(
      `INSERT INTO ai_usage (user_id, day, count) VALUES (?, ?, ?)
       ON CONFLICT(user_id, day) DO UPDATE SET count = count + excluded.count
       WHERE ai_usage.count + excluded.count <= ?
       RETURNING count`,
    )
    .bind(user.id, day, cost, limit)
    .first<{ count: number }>()
  if (!row) {
    throw new Error(
      UPGRADE_PREFIX +
        (user.plan === 'pro'
          ? `You've used today's ${limit} AI credits. They reset at midnight UTC.`
          : `You've used your ${limit} free AI credits for today. Upgrade to Pro for ${limitsFor('pro').aiPerDay}/day.`),
    )
  }
  return { used: row.count, limit }
}

async function refundCredit(user: UserRow, cost = 1) {
  await db().prepare('UPDATE ai_usage SET count = MAX(0, count - ?) WHERE user_id = ? AND day = ?').bind(cost, user.id, today()).run()
}

async function withCredit<T>(cost: number, fn: (user: UserRow) => Promise<T>) {
  const user = await requireUser()
  await consumeCredit(user, cost)
  try {
    return await fn(user)
  } catch (err) {
    await refundCredit(user, cost)
    console.error('AI request failed', err)
    throw err instanceof Error && err.message.startsWith(UPGRADE_PREFIX)
      ? err
      : new Error(err instanceof Error ? err.message : 'AI request failed. Please try again.')
  }
}

export const getAiUsage = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const row = await db().prepare('SELECT count FROM ai_usage WHERE user_id = ? AND day = ?').bind(user.id, today()).first<{ count: number }>()
  return { used: row?.count ?? 0, limit: limitsFor(user.plan).aiPerDay }
})

const clean = (list: unknown, max = 10) =>
  (Array.isArray(list) ? list : [])
    .map((s) => String(s ?? '').trim())
    .filter(Boolean)
    .slice(0, max)

const jd = z.string().max(15000).optional()

export const aiRewriteBullet = createServerFn({ method: 'POST' })
  .validator(z.object({ bullet: z.string().min(3).max(600), position: z.string().max(200), company: z.string().max(200), jobDescription: jd }))
  .handler(({ data }) =>
    withCredit(1, async () => {
      const out = await generateJson<{ options: string[] }>(bulletVariantsTask(data))
      return { options: clean(out.options, 3) }
    }),
  )

export const aiImproveRole = createServerFn({ method: 'POST' })
  .validator(
    z.object({ bullets: z.array(z.string().max(600)).min(1).max(15), position: z.string().max(200), company: z.string().max(200), jobDescription: jd }),
  )
  .handler(({ data }) =>
    withCredit(1, async () => {
      const out = await generateJson<{ bullets: string[] }>(roleBulletsTask(data))
      return { bullets: clean(out.bullets, 16) }
    }),
  )

export const aiWriteSummary = createServerFn({ method: 'POST' })
  .validator(z.object({ resume: resumeDataSchema, jobDescription: jd }))
  .handler(({ data }) =>
    withCredit(1, async () => {
      const out = await generateJson<{ options: string[] }>(summaryTask({ resumeText: resumePlainText(data.resume), jobDescription: data.jobDescription }))
      return { options: clean(out.options, 2) }
    }),
  )

export const aiTailorResume = createServerFn({ method: 'POST' })
  .validator(z.object({ resume: resumeDataSchema, jobDescription: z.string().min(50, 'Paste the full job description (at least a few sentences).').max(15000) }))
  .handler(({ data }) =>
    withCredit(3, async () => {
      const r = data.resume
      const compact = {
        headline: r.basics.headline,
        summary: r.summary,
        experience: r.experience.map((e) => ({ id: e.id, position: e.position, company: e.company, startDate: e.startDate, endDate: e.endDate, highlights: e.highlights.filter(Boolean) })),
        education: r.education.map((e) => ({ degree: e.degree, area: e.area, institution: e.institution })),
        projects: r.projects.map((p) => ({ name: p.name, summary: p.summary, highlights: p.highlights })),
        skills: r.skills.map((s) => `${s.label}: ${s.details}`),
        certifications: r.certifications.map((c) => c.name),
      }
      const out = await generateJson<TailorResult>(tailorTask({ resumeJson: JSON.stringify(compact), jobDescription: data.jobDescription }))
      const ids = new Set(r.experience.map((e) => e.id))
      return {
        summary: String(out.summary ?? '').trim(),
        experience: (Array.isArray(out.experience) ? out.experience : [])
          .filter((e) => e && ids.has(e.id))
          .map((e) => ({ id: e.id, highlights: clean(e.highlights, 12) })),
        skillsToAdd: clean(out.skillsToAdd, 15),
        missingKeywords: clean(out.missingKeywords, 15),
        notes: clean(out.notes, 5),
      } satisfies TailorResult
    }),
  )
