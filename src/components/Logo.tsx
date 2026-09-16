import { Link } from '@tanstack/react-router'

/** A printed sheet with one line highlighted: the product in one glyph. Mirrors public/favicon.svg. */
export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="8" fill="#141414" />
      <rect x="15" y="10" width="34" height="44" rx="1.5" fill="#fff" />
      <rect x="20" y="18" width="18" height="3" fill="#141414" />
      <path d="M18.5 27.6c8-.9 18.7-1.2 27.4-.6l.6 3.6-.8 4.2c-9 .6-18.4.7-27 .2l.5-3.8z" fill="#f6e53e" />
      <rect x="20" y="29.5" width="22" height="3" fill="#141414" />
      <rect x="20" y="40" width="24" height="3" fill="#141414" />
      <rect x="20" y="46" width="15" height="3" fill="#141414" />
    </svg>
  )
}

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="flex min-h-11 items-center gap-2.5 font-display text-[17px] font-extrabold tracking-[-0.02em] text-ink" aria-label="CV ATS Friendly, home">
      <LogoMark className="h-7 w-7" />
      <span aria-hidden="true">
        CV <span className="swipe">ATS</span> Friendly
      </span>
    </Link>
  )
}
