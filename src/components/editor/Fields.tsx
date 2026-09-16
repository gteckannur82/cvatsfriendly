import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react'
import { useId, type ReactNode } from 'react'

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  hint?: string
  autoComplete?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input id={id} type={type} className="input" value={value} placeholder={placeholder} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  hint,
  action,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  hint?: ReactNode
  action?: ReactNode
}) {
  const id = useId()
  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        <label htmlFor={id} className="label">
          {label}
        </label>
        {action}
      </div>
      <textarea id={id} rows={rows} className="input resize-y leading-relaxed" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  )
}

/** Month picker storing RenderCV-style "YYYY-MM"; end dates can be "present". */
export function DateField({ label, value, onChange, allowPresent }: { label: string; value: string; onChange: (v: string) => void; allowPresent?: boolean }) {
  const id = useId()
  const isPresent = value === 'present'
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        type="month"
        className="input disabled:bg-slate-100 disabled:text-slate-400"
        value={isPresent ? '' : /^\d{4}-\d{2}$/.test(value) ? value : ''}
        placeholder="YYYY-MM"
        disabled={isPresent}
        onChange={(e) => onChange(e.target.value)}
      />
      {allowPresent ? (
        <label className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600">
          <input type="checkbox" className="accent-brand-600" checked={isPresent} onChange={(e) => onChange(e.target.checked ? 'present' : '')} />
          I currently work here
        </label>
      ) : null}
    </div>
  )
}

export function ItemCard({
  title,
  subtitle,
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  title: string
  subtitle?: string
  index: number
  count: number
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
  children: ReactNode
}) {
  return (
    <details open className="group rounded-xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3">
        <GripVertical className="h-4 w-4 text-slate-300" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{title}</p>
          {subtitle ? <p className="truncate text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex items-center" onClick={(e) => e.preventDefault()}>
          <button type="button" className="btn-ghost btn-sm" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="btn-ghost btn-sm" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="btn-ghost btn-sm text-red-600 hover:bg-red-50" onClick={onRemove} aria-label="Remove">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </summary>
      <div className="space-y-4 border-t border-slate-100 px-4 py-4">{children}</div>
    </details>
  )
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-brand-500 hover:text-brand-700">
      <Plus className="h-4 w-4" /> {children}
    </button>
  )
}

export function StepIntro({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{children}</p>
    </div>
  )
}

export function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = [...list]
  const target = index + dir
  if (target < 0 || target >= next.length) return list
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
