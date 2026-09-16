import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthForm } from '~/components/AuthForm'
import { seo } from '~/lib/site'
import { authSearch, safeRedirect } from '~/lib/auth-search'

export const Route = createFileRoute('/_site/signup')({
  validateSearch: authSearch,
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ to: safeRedirect(search.redirect, search.plan) })
  },
  head: () =>
    seo({
      title: 'Create your free resume',
      description: 'Sign up free and build an ATS-friendly resume with AI bullet rewriting and job description tailoring.',
      path: '/signup',
    }),
  component: () => {
    const search = Route.useSearch()
    return <AuthForm mode="signup" redirectTo={safeRedirect(search.redirect, search.plan)} />
  },
})
