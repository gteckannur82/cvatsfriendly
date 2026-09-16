import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthForm } from '~/components/AuthForm'
import { seo } from '~/lib/site'
import { authSearch, safeRedirect } from '~/lib/auth-search'

export const Route = createFileRoute('/_site/login')({
  validateSearch: authSearch,
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ to: safeRedirect(search.redirect, search.plan) })
  },
  head: () => seo({ title: 'Log in', path: '/login' }),
  component: () => {
    const search = Route.useSearch()
    return <AuthForm mode="login" redirectTo={safeRedirect(search.redirect, search.plan)} />
  },
})
