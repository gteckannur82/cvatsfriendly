import { createFileRoute, Link, Outlet, redirect, useRouter } from '@tanstack/react-router'
import { FileText, LogOut, Sparkles, User } from 'lucide-react'
import { Logo } from '~/components/Logo'
import { logout } from '~/functions/auth.fn'

export const Route = createFileRoute('/app')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) throw redirect({ to: '/login', search: { redirect: location.href } })
    return { user: context.user }
  },
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  component: AppLayout,
})

function AppLayout() {
  const { user } = Route.useRouteContext()
  const router = useRouter()
  const onLogout = async () => {
    await logout()
    await router.invalidate()
    await router.navigate({ to: '/' })
  }
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo to="/app" />
            <nav className="hidden items-center gap-1 sm:flex">
              <Link to="/app" activeOptions={{ exact: true }} className="btn-ghost btn-sm" activeProps={{ className: 'bg-slate-100 text-ink' }}>
                <FileText className="h-4 w-4" /> Resumes
              </Link>
              <Link to="/app/billing" className="btn-ghost btn-sm" activeProps={{ className: 'bg-slate-100 text-ink' }}>
                <User className="h-4 w-4" /> Account
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {user.plan === 'pro' ? (
              <span className="rounded-[3px] border border-ink px-2 py-0.5 text-xs font-bold text-ink">Pro</span>
            ) : (
              <Link to="/app/billing" className="btn-primary btn-sm">
                <Sparkles className="h-3.5 w-3.5" /> Upgrade
              </Link>
            )}
            <span className="hidden max-w-48 truncate text-sm text-slate-500 md:inline">{user.email}</span>
            <Link to="/app/billing" className="btn-ghost btn-sm sm:hidden" aria-label="Account">
              <User className="h-4 w-4" />
            </Link>
            <button onClick={onLogout} className="btn-ghost btn-sm" aria-label="Log out" title="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
