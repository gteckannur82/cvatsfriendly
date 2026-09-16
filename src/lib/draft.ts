import { normalizeResume, type ResumeData } from './resume/schema'

/**
 * An anonymous resume lives only in the visitor's browser until they create an
 * account, which keeps bot traffic out of the database and means there is no
 * anonymous session to expire.
 */
const KEY = 'cvaf_draft_v1'

export interface Draft {
  title: string
  template: string
  data: ResumeData
}

export function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      title: String(parsed.title || 'Untitled resume'),
      template: String(parsed.template || 'classic'),
      data: normalizeResume(parsed.data),
    }
  } catch {
    return null
  }
}

export function writeDraft(draft: Draft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft))
  } catch {}
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}
