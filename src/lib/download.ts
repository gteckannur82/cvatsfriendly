import type { ResumeData } from './resume/schema'
import type { ResumeTheme } from './resume/themes'

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export const safeFilename = (s: string) => s.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_') || 'Resume'

/** Generates the PDF entirely in the browser. The renderer is lazy-loaded and never bundled into the Worker. */
export async function downloadResumePdf(data: ResumeData, theme: ResumeTheme, title: string) {
  if (import.meta.env.SSR) return
  const { renderResumePdfBlob } = await import('~/components/pdf/ResumePdf')
  const blob = await renderResumePdfBlob(data, theme, title)
  saveBlob(blob, `${safeFilename(data.basics.name || title)}_Resume.pdf`)
}
