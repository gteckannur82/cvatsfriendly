import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="font-display text-3xl font-bold text-ink">Page not found</h1>
      <p className="text-slate-600">The page you’re looking for doesn’t exist or has moved.</p>
      <Link to="/" className="btn-primary">
        Back to home
      </Link>
    </div>
  )
}
