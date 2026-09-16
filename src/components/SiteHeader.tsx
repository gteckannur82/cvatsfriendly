import { Link, useRouteContext } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Logo } from './Logo'

const NAV = [
  { to: '/templates', label: 'Templates' },
  { to: '/ats-resume-guide', label: 'ATS Guide' },
  { to: '/pricing', label: 'Pricing' },
] as const

export function SiteHeader() {
  const { user } = useRouteContext({ from: '__root__' })
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="btn-ghost" activeProps={{ className: 'text-brand-700' }}>
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
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary">
                Build my resume
              </Link>
            </>
          )}
        </div>
        <button className="btn-ghost md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="btn-ghost justify-start" onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
            {user ? (
              <Link to="/app" className="btn-primary mt-2">
                My resumes
              </Link>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" className="btn-outline">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign up free
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
