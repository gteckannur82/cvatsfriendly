import { CheckCircle2, CircleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { runAtsChecks } from '~/lib/resume/ats'
import type { ResumeData } from '~/lib/resume/schema'
import { Modal } from '../ui'

export function useAtsScore(data: ResumeData) {
  return useMemo(() => runAtsChecks(data), [data])
}

export function scoreColor(score: number) {
  return score >= 80 ? 'text-brand-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'
}

export function AtsModal({ open, onClose, data }: { open: boolean; onClose: () => void; data: ResumeData }) {
  const { score, checks } = useAtsScore(data)
  return (
    <Modal open={open} onClose={onClose} title="ATS & recruiter check">
      <div className="flex items-center gap-4">
        <div className={`font-display text-5xl font-extrabold ${scoreColor(score)}`}>{score}</div>
        <p className="text-sm text-slate-600">
          Formatting is already ATS-safe in every template. These checks cover <strong>content</strong> that affects ranking and recruiter response.
        </p>
      </div>
      <ul className="mt-5 space-y-3">
        {checks.map((c) => (
          <li key={c.id} className="flex gap-3">
            {c.passed ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /> : <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />}
            <div>
              <p className={`text-sm font-medium ${c.passed ? 'text-slate-700' : 'text-ink'}`}>{c.label}</p>
              {!c.passed ? <p className="text-xs text-slate-500">{c.tip}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
