import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { BarChart3, LifeBuoy, Tag, Users } from 'lucide-react'
import { Logo } from '~/components/Logo'

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) throw redirect({ to: '/login', search: { redirect: location.href } })
    if (!context.user.isAdmin) throw redirect({ to: '/app' })
    return { user: context.user }
  },
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  component: AdminLayout,
})

const TABS = [
  { to: '/admin', label: 'Overview', icon: BarChart3, exact: true },
  { to: '/admin/users', label: 'Users', icon: Users, exact: false },
  { to: '/admin/offers', label: 'Offers', icon: Tag, exact: false },
  { to: '/admin/support', label: 'Support', icon: LifeBuoy, exact: false },
] as const

function AdminLayout() {
  const { user } = Route.useRouteContext()
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo to="/app" />
            <span className="rounded-[3px] border border-ink px-2 py-0.5 text-xs font-bold text-ink">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-48 truncate text-sm text-slate-500 md:inline">{user.email}</span>
            <Link to="/app" className="btn-outline btn-sm">
              Back to app
            </Link>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 sm:px-6" aria-label="Admin sections">
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.exact }}
              className="btn-ghost btn-sm shrink-0"
              activeProps={{ className: 'bg-ink text-white hover:bg-ink' }}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container-page max-w-6xl flex-1 py-8">
        <Outlet />
      </main>
    </div>
  )
}
