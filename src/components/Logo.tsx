import { Link } from '@tanstack/react-router'

export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#059669" />
      <path d="M20 14h18l8 8v28a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2z" fill="#fff" />
      <path d="M24 36l6 6 12-13" fill="none" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink">
      <LogoMark />
      <span>
        CV<span className="text-brand-600">ATS</span>Friendly
      </span>
    </Link>
  )
}
