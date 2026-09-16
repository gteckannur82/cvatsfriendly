import { Link, useRouter } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { login, signup } from '~/functions/auth.fn'
import { readError } from '~/lib/errors'
import { LogoMark } from './Logo'
import { ErrorNote, Spinner } from './ui'

export function AuthForm({ mode, redirectTo }: { mode: 'login' | 'signup'; redirectTo: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')
    setPending(true)
    setError(null)
    try {
      if (mode === 'signup') await signup({ data: { email, password, name: String(form.get('name') ?? '') } })
      else await login({ data: { email, password } })
      await router.invalidate()
      await router.navigate({ to: redirectTo })
    } catch (err) {
      setError(readError(err).message)
      setPending(false)
    }
  }

  const isSignup = mode === 'signup'
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-brand-50/60 to-white px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <LogoMark className="mx-auto h-11 w-11" />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">{isSignup ? 'Create your free account' : 'Welcome back'}</h1>
          <p className="mt-1 text-sm text-slate-600">{isSignup ? 'Build an ATS-friendly resume in minutes.' : 'Log in to continue editing your resumes.'}</p>
        </div>
        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          {isSignup ? (
            <div>
              <label className="label" htmlFor="name">
                Full name
              </label>
              <input id="name" name="name" className="input" autoComplete="name" placeholder="Jordan Rivera" />
            </div>
          ) : null}
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" required className="input" autoComplete="email" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={isSignup ? 8 : undefined}
              className="input"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? 'At least 8 characters' : ''}
            />
          </div>
          <ErrorNote message={error} />
          <button type="submit" className="btn-primary w-full py-2.5" disabled={pending}>
            {pending ? <Spinner /> : null}
            {isSignup ? 'Create account' : 'Log in'}
          </button>
          {isSignup ? (
            <p className="text-center text-xs text-slate-500">
              By signing up you agree to our{' '}
              <Link to="/terms" className="underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          ) : null}
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          {isSignup ? 'Already have an account? ' : 'New here? '}
          <Link to={isSignup ? '/login' : '/signup'} search={{ redirect: redirectTo }} className="font-semibold text-brand-700 hover:underline">
            {isSignup ? 'Log in' : 'Create a free account'}
          </Link>
        </p>
      </div>
    </div>
  )
}
