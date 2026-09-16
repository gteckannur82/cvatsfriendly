import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '~/server/env'
import { requireUser } from '~/server/auth'
import { newId } from '~/server/crypto'
import { limitsFor } from '~/lib/plans'
import { emptyResume, normalizeResume, resumeDataSchema, sampleResume, type ResumeData } from '~/lib/resume/schema'
import { getTheme } from '~/lib/resume/themes'

import { UPGRADE_PREFIX } from '~/lib/errors'
const upgradeError = (msg: string) => new Error(UPGRADE_PREFIX + msg)

interface ResumeRow {
  id: string
  user_id: string
  title: string
  template: string
  data: string
  created_at: number
  updated_at: number
}

export interface ResumeSummary {
  id: string
  title: string
  template: string
  updatedAt: number
  createdAt: number
  versionCount: number
  headline: string
}

export interface ResumeDoc {
  id: string
  title: string
  template: string
  data: ResumeData
  updatedAt: number
}

const toDoc = (r: ResumeRow): ResumeDoc => ({
  id: r.id,
  title: r.title,
  template: r.template,
  data: normalizeResume(JSON.parse(r.data)),
  updatedAt: r.updated_at,
})

async function ownResume(userId: string, id: string) {
  const row = await db().prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?').bind(id, userId).first<ResumeRow>()
  if (!row) throw new Error('Resume not found.')
  return row
}

function assertTemplateAllowed(plan: string, template: string) {
  const theme = getTheme(template)
  if (theme.pro && !limitsFor(plan).proTemplates) throw upgradeError(`The ${theme.name} template is part of Pro.`)
  return theme.id
}

export const listResumes = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const { results } = await db()
    .prepare(
      `SELECT r.id, r.title, r.template, r.updated_at, r.created_at, json_extract(r.data, '$.basics.headline') AS headline,
              (SELECT COUNT(*) FROM resume_versions v WHERE v.resume_id = r.id) AS version_count
       FROM resumes r WHERE r.user_id = ? ORDER BY r.updated_at DESC`,
    )
    .bind(user.id)
    .all<{ id: string; title: string; template: string; updated_at: number; created_at: number; headline: string | null; version_count: number }>()
  return results.map<ResumeSummary>((r) => ({
    id: r.id,
    title: r.title,
    template: r.template,
    updatedAt: r.updated_at,
    createdAt: r.created_at,
    versionCount: r.version_count,
    headline: r.headline ?? '',
  }))
})

export const createResume = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      title: z.string().trim().max(120).optional(),
      source: z.enum(['blank', 'sample', 'import']).default('blank'),
      data: z.unknown().optional(),
      template: z.string().max(40).optional(),
    }),
  )
  .handler(async ({ data: input }) => {
    const user = await requireUser()
    const limits = limitsFor(user.plan)
    const count = await db().prepare('SELECT COUNT(*) AS n FROM resumes WHERE user_id = ?').bind(user.id).first<{ n: number }>()
    if ((count?.n ?? 0) >= limits.maxResumes)
      throw upgradeError(`Your plan includes ${limits.maxResumes} resumes. Upgrade to Pro to create more.`)

    const data =
      input.source === 'sample' ? sampleResume() : input.source === 'import' ? resumeDataSchema.parse(normalizeResume(input.data)) : emptyResume()
    const template = input.template ? assertTemplateAllowed(user.plan, input.template) : 'classic'
    const id = newId()
    const now = Date.now()
    const title = input.title || (data.basics.name ? `${data.basics.name} – Resume` : 'Untitled resume')
    await db()
      .prepare('INSERT INTO resumes (id, user_id, title, template, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, user.id, title, template, JSON.stringify(data), now, now)
      .run()
    return { id }
  })

export const getResume = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().max(64) }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    return toDoc(await ownResume(user.id, data.id))
  })

export const saveResume = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.string().max(64),
      title: z.string().trim().min(1).max(120).optional(),
      template: z.string().max(40).optional(),
      data: resumeDataSchema.optional(),
    }),
  )
  .handler(async ({ data: input }) => {
    const user = await requireUser()
    const row = await ownResume(user.id, input.id)
    const template = input.template && input.template !== row.template ? assertTemplateAllowed(user.plan, input.template) : row.template
    const now = Date.now()
    await db()
      .prepare('UPDATE resumes SET title = ?, template = ?, data = ?, updated_at = ? WHERE id = ?')
      .bind(input.title ?? row.title, template, input.data ? JSON.stringify(input.data) : row.data, now, row.id)
      .run()
    return { updatedAt: now, template }
  })

export const duplicateResume = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().max(64), title: z.string().trim().max(120).optional(), data: resumeDataSchema.optional() }))
  .handler(async ({ data: input }) => {
    const user = await requireUser()
    const limits = limitsFor(user.plan)
    const count = await db().prepare('SELECT COUNT(*) AS n FROM resumes WHERE user_id = ?').bind(user.id).first<{ n: number }>()
    if ((count?.n ?? 0) >= limits.maxResumes)
      throw upgradeError(`Your plan includes ${limits.maxResumes} resumes. Upgrade to Pro to keep a tailored copy per application.`)
    const row = await ownResume(user.id, input.id)
    const id = newId()
    const now = Date.now()
    await db()
      .prepare('INSERT INTO resumes (id, user_id, title, template, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, user.id, input.title || `${row.title} (copy)`, row.template, input.data ? JSON.stringify(input.data) : row.data, now, now)
      .run()
    return { id }
  })

export const deleteResume = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().max(64) }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    await ownResume(user.id, data.id)
    await db().batch([
      db().prepare('DELETE FROM resume_versions WHERE resume_id = ?').bind(data.id),
      db().prepare('DELETE FROM resumes WHERE id = ?').bind(data.id),
    ])
    return { ok: true }
  })

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

export interface VersionSummary {
  id: string
  label: string
  template: string
  createdAt: number
}

export const listVersions = createServerFn({ method: 'GET' })
  .validator(z.object({ resumeId: z.string().max(64) }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    await ownResume(user.id, data.resumeId)
    const { results } = await db()
      .prepare('SELECT id, label, template, created_at FROM resume_versions WHERE resume_id = ? ORDER BY created_at DESC')
      .bind(data.resumeId)
      .all<{ id: string; label: string; template: string; created_at: number }>()
    return results.map<VersionSummary>((v) => ({ id: v.id, label: v.label, template: v.template, createdAt: v.created_at }))
  })

export const saveVersion = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      resumeId: z.string().max(64),
      label: z.string().trim().min(1).max(120),
      data: resumeDataSchema,
      template: z.string().max(40),
    }),
  )
  .handler(async ({ data: input }) => {
    const user = await requireUser()
    await ownResume(user.id, input.resumeId)
    const limits = limitsFor(user.plan)
    const count = await db()
      .prepare('SELECT COUNT(*) AS n FROM resume_versions WHERE resume_id = ?')
      .bind(input.resumeId)
      .first<{ n: number }>()
    if ((count?.n ?? 0) >= limits.maxVersionsPerResume)
      throw upgradeError(`Your plan keeps ${limits.maxVersionsPerResume} versions per resume. Delete one or upgrade to Pro.`)
    const id = newId()
    await db()
      .prepare('INSERT INTO resume_versions (id, resume_id, user_id, label, template, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.resumeId, user.id, input.label, getTheme(input.template).id, JSON.stringify(input.data), Date.now())
      .run()
    return { id }
  })

export const getVersion = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().max(64) }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    const row = await db()
      .prepare('SELECT * FROM resume_versions WHERE id = ? AND user_id = ?')
      .bind(data.id, user.id)
      .first<{ id: string; label: string; template: string; data: string; created_at: number }>()
    if (!row) throw new Error('Version not found.')
    return { id: row.id, label: row.label, template: row.template, data: normalizeResume(JSON.parse(row.data)), createdAt: row.created_at }
  })

export const deleteVersion = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().max(64) }))
  .handler(async ({ data }) => {
    const user = await requireUser()
    await db().prepare('DELETE FROM resume_versions WHERE id = ? AND user_id = ?').bind(data.id, user.id).run()
    return { ok: true }
  })

