export type MarkKind = 'found' | 'missing'

export interface TextRun {
  text: string
  kind?: MarkKind
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Splits text into plain and highlighted runs for keywords produced by `keywordMatch`.
 * Longer keywords win (so "b2b saas" marks as one run), matching is case-insensitive,
 * and a keyword only marks where it stands as a whole token.
 */
export function markKeywords(text: string, found: string[], missing: string[]): TextRun[] {
  const kinds = new Map<string, MarkKind>()
  found.forEach((k) => kinds.set(k.toLowerCase(), 'found'))
  missing.forEach((k) => kinds.set(k.toLowerCase(), 'missing'))
  const keys = [...kinds.keys()].filter(Boolean).sort((a, b) => b.length - a.length)
  if (!keys.length) return [{ text }]

  const pattern = new RegExp(`(?<![a-z0-9+#])(${keys.map(escape).join('|')})(?![a-z0-9+#])`, 'gi')
  const runs: TextRun[] = []
  let last = 0
  for (const m of text.matchAll(pattern)) {
    const start = m.index ?? 0
    if (start > last) runs.push({ text: text.slice(last, start) })
    runs.push({ text: m[0], kind: kinds.get(m[0].toLowerCase()) })
    last = start + m[0].length
  }
  if (last < text.length) runs.push({ text: text.slice(last) })
  return runs
}
