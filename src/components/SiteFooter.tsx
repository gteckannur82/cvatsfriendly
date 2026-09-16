import { Link } from '@tanstack/react-router'
import { Logo } from './Logo'
import { SITE } from '~/lib/site'

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-slate-600">Clean, ATS-friendly resumes, with AI that helps you describe what you actually achieved.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Product</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/templates" className="hover:text-slate-900">Resume templates</Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-slate-900">Pricing</Link>
            </li>
            <li>
              <Link to="/signup" className="hover:text-slate-900">Create a resume</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Resources</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/ats-resume-guide" className="hover:text-slate-900">What is an ATS-friendly resume?</Link>
            </li>
            <li>
              <a href={`mailto:${SITE.supportEmail}`} className="hover:text-slate-900">Contact support</a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Legal</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/privacy" className="hover:text-slate-900">Privacy policy</Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-slate-900">Terms of service</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {SITE.domain}. All rights reserved.
      </div>
    </footer>
  )
}
