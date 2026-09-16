import type { Basics } from './schema'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

/** Formats RenderCV-style dates: "2021-03" → "Mar 2021", "present" → "Present". */
export function formatDate(value: string): string {
  const v = value.trim()
  if (!v) return ''
  if (/^present$/i.test(v)) return 'Present'
  const m = v.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/)
  if (m) {
    const month = Number(m[2])
    return month >= 1 && month <= 12 ? `${MONTHS[month - 1]} ${m[1]}` : m[1]
  }
  return v
}

export function formatDateRange(start: string, end: string): string {
  const s = formatDate(start)
  const e = formatDate(end)
  if (s && e) return s === e ? s : `${s} – ${e}`
  return s || e
}

export type Segment = { text: string; bold: boolean }

/** Minimal markdown: supports **bold** only (RenderCV supports the same in highlights). */
export function parseInline(input: string): Segment[] {
  const parts = input.split('**')
  return parts
    .map((text, i) => ({ text, bold: i % 2 === 1 && i < parts.length - 1 }))
    .filter((s) => s.text.length > 0)
}

export const stripMarkdown = (s: string) => s.replace(/\*\*/g, '')

export function contactItems(b: Basics): string[] {
  return [b.location, b.email, b.phone, b.website, b.linkedin, b.github].map((s) => s.trim()).filter(Boolean)
}

export function hasText(...values: string[]) {
  return values.some((v) => v.trim().length > 0)
}
