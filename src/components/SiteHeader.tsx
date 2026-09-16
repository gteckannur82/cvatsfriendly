import { Link, useRouteContext } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Logo } from './Logo'

const NAV = [
  { to: '/templates', label: 'Templates' },
  { to: '/ats-resume-guide', label: 'ATS guide' },
  { to: '/pricing', label: 'Pricing' },
] as const

const navLink = 'rounded-[3px] px-3 py-2 text-[15px] font-medium text-ink-soft transition-colors hover:text-ink'

export function SiteHeader() {
  const { user } = useRouteContext({ from: '__root__' })
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-desk-rule bg-desk">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={navLink} activeProps={{ className: 'text-ink underline decoration-2 underline-offset-[6px]' }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link to="/app" className="btn-primary">
              My resumes
            </Link>
          ) : (
            <>
              <Link to="/login" className={navLink}>
                Log in
              </Link>
              <Link to="/build" className="btn-primary">
                Build my resume
              </Link>
            </>
          )}
        </div>
        <button
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-[3px] text-ink hover:bg-slate-900/[0.06] md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div id="mobile-nav" className="border-t border-desk-rule bg-desk md:hidden">
          <nav className="container-page flex flex-col py-2" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="flex min-h-12 items-center border-b border-desk-rule text-base font-medium text-ink" onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
            {user ? (
              <Link to="/app" className="btn-primary mt-4 mb-2 py-3" onClick={() => setOpen(false)}>
                My resumes
              </Link>
            ) : (
              <div className="mt-4 mb-2 grid grid-cols-2 gap-2">
                <Link to="/login" className="btn-outline py-3" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/build" className="btn-primary py-3" onClick={() => setOpen(false)}>
                  Build my resume
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
