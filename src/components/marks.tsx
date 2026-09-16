import type { CSSProperties, ReactNode } from 'react'
import type { MarkKind, TextRun } from '~/lib/resume/highlight'

type Vars = CSSProperties & Record<`--${string}`, string | number>

/** A highlighter swipe behind inline text. `draw` animates it on in reading order via `index`. */
export function Swipe({
  kind = 'found',
  draw = false,
  index = 0,
  dim = false,
  announce = true,
  children,
}: {
  kind?: MarkKind
  draw?: boolean
  index?: number
  dim?: boolean
  /** Adds a screen-reader "(missing)" after missing marks; turn off where the words already say it. */
  announce?: boolean
  children: ReactNode
}) {
  const style: Vars = { '--i': index }
  return (
    <mark
      className={`swipe bg-transparent text-inherit ${kind === 'missing' ? 'swipe-miss' : ''} ${draw ? 'swipe-draw' : ''}`}
      style={style}
      data-dim={dim ? 'true' : undefined}
    >
      {children}
      {kind === 'missing' && announce ? <span className="sr-only"> (missing)</span> : null}
    </mark>
  )
}

/** Renders runs from `markKeywords`. Returns nodes plus how many marks were drawn, so callers can continue the sequence. */
export function renderRuns(runs: TextRun[], opts: { draw?: boolean; startIndex?: number; isolate?: MarkKind | null } = {}) {
  let i = opts.startIndex ?? 0
  const nodes = runs.map((r, n) =>
    r.kind ? (
      <Swipe key={n} kind={r.kind} draw={opts.draw} index={i++} dim={!!opts.isolate && opts.isolate !== r.kind}>
        {r.text}
      </Swipe>
    ) : (
      <span key={n}>{r.text}</span>
    ),
  )
  return { nodes, count: i - (opts.startIndex ?? 0) }
}

/** Fixed-position tabular digits that roll from zero to their value once. */
export function RollingNumber({ value, className = '', start = 350 }: { value: number; className?: string; start?: number }) {
  const digits = String(Math.max(0, Math.round(value))).split('')
  return (
    <span className={`num inline-flex ${className}`}>
      <span className="sr-only">{value}</span>
      {digits.map((d, i) => (
        <span key={i} aria-hidden="true" className="roll-digit">
          <span className="roll-strip" style={{ '--d': Number(d), '--roll-start': `${start + i * 60}ms` } as Vars}>
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}
