/**
 * Resume templates. Typography and layout values are ported from RenderCV's
 * built-in themes (classic, harvard, engineeringresumes, sb2nov) — MIT licensed —
 * and restricted to single-column, standard-font layouts that parse cleanly in ATS.
 *
 * One config drives both the live HTML preview and the PDF renderer.
 */
export type SectionTitleStyle = 'partial-line' | 'full-line' | 'centered-line' | 'plain-caps'

export interface ResumeTheme {
  id: string
  name: string
  description: string
  pro: boolean
  font: 'sans' | 'serif'
  /** Main accent colour (name, section titles). */
  accent: string
  bodySize: number // pt
  nameSize: number // pt
  nameBold: boolean
  headerAlign: 'center' | 'left'
  separator: string
  sectionTitle: SectionTitleStyle
  sectionTitleSize: number // pt
  uppercaseTitles: boolean
  margin: number // pt
  lineHeight: number
  entryGap: number // pt between entries
  sectionGap: number // pt before sections
}

export const THEMES: ResumeTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean sans-serif with a navy accent. A safe choice for any industry.',
    pro: false,
    font: 'sans',
    accent: '#004f90',
    bodySize: 10,
    nameSize: 26,
    nameBold: true,
    headerAlign: 'center',
    separator: '•',
    sectionTitle: 'partial-line',
    sectionTitleSize: 13,
    uppercaseTitles: false,
    margin: 50,
    lineHeight: 1.35,
    entryGap: 8,
    sectionGap: 12,
  },
  {
    id: 'harvard',
    name: 'Harvard',
    description: 'Traditional serif layout favoured by career offices and finance.',
    pro: false,
    font: 'serif',
    accent: '#000000',
    bodySize: 10,
    nameSize: 22,
    nameBold: true,
    headerAlign: 'center',
    separator: '•',
    sectionTitle: 'centered-line',
    sectionTitleSize: 12,
    uppercaseTitles: false,
    margin: 36,
    lineHeight: 1.3,
    entryGap: 7,
    sectionGap: 10,
  },
  {
    id: 'engineer',
    name: 'Engineer',
    description: 'Dense one-page serif format popular for software and engineering roles.',
    pro: true,
    font: 'serif',
    accent: '#000000',
    bodySize: 10,
    nameSize: 22,
    nameBold: false,
    headerAlign: 'center',
    separator: '|',
    sectionTitle: 'full-line',
    sectionTitleSize: 11.5,
    uppercaseTitles: false,
    margin: 42,
    lineHeight: 1.28,
    entryGap: 6,
    sectionGap: 9,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Left-aligned header, teal accent and uppercase section rules.',
    pro: true,
    font: 'sans',
    accent: '#0f766e',
    bodySize: 10,
    nameSize: 24,
    nameBold: true,
    headerAlign: 'left',
    separator: '·',
    sectionTitle: 'full-line',
    sectionTitleSize: 10.5,
    uppercaseTitles: true,
    margin: 46,
    lineHeight: 1.38,
    entryGap: 8,
    sectionGap: 13,
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Tight spacing to fit extensive experience on a single page.',
    pro: true,
    font: 'sans',
    accent: '#111827',
    bodySize: 9.2,
    nameSize: 20,
    nameBold: true,
    headerAlign: 'left',
    separator: '|',
    sectionTitle: 'plain-caps',
    sectionTitleSize: 9.5,
    uppercaseTitles: true,
    margin: 34,
    lineHeight: 1.25,
    entryGap: 5,
    sectionGap: 8,
  },
]

export const DEFAULT_THEME_ID = 'classic'

export function getTheme(id: string | null | undefined): ResumeTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
