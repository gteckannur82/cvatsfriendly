import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Logo } from './Logo'
import { SITE } from '~/lib/site'

const link = 'inline-block py-3 text-ink-soft underline decoration-transparent underline-offset-4 transition-colors hover:text-ink hover:decoration-ink md:py-0.5'

export function SiteFooter() {
  return (
    <footer className="border-t border-ink bg-desk">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-ink-soft">Single-column, ATS-friendly resumes, with AI that describes what you actually achieved.</p>
        </div>
        <FooterColumn title="Product">
          <Link to="/templates" className={link}>Resume templates</Link>
          <Link to="/pricing" className={link}>Pricing</Link>
          <Link to="/build" className={link}>Build my resume</Link>
        </FooterColumn>
        <FooterColumn title="Resources">
          <Link to="/ats-resume-guide" className={link}>What is an ATS-friendly resume?</Link>
          <Link to="/contact" className={link}>Contact us</Link>
        </FooterColumn>
        <FooterColumn title="Legal">
          <Link to="/privacy" className={link}>Privacy policy</Link>
          <Link to="/terms" className={link}>Terms of service</Link>
          <Link to="/refund-policy" className={link}>Refund &amp; cancellation</Link>
          <Link to="/shipping" className={link}>Delivery policy</Link>
        </FooterColumn>
      </div>
      <div className="container-page border-t border-desk-rule py-5 text-[13px] text-ink-soft">
        © {new Date().getFullYear()} {SITE.name}
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <div className="mt-2 flex flex-col items-start gap-0 text-sm md:mt-3 md:gap-2">{children}</div>
    </div>
  )
}
