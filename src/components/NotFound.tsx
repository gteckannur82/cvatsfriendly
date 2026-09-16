import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ink">Page not found</h1>
      <p className="text-ink-soft">
        The page you’re looking for doesn’t exist or has moved. <span className="num text-[13px]">(404)</span>
      </p>
      <Link to="/" className="btn-primary">
        Back to home
      </Link>
    </div>
  )
}
