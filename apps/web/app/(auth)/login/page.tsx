'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { AuthLayout, AuthCard, AuthInput, AuthButton } from '@/components/auth';
import { Mail, Lock, ArrowRight, Eye, EyeOff, MessageCircle, Sparkles, Heart, MessagesSquare } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/chat');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'We couldn’t sign you in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout wide>
      <div className="grid overflow-hidden rounded-[2rem] border border-violet-100/80 bg-white shadow-[0_32px_100px_-42px_rgba(76,29,149,0.32)] lg:min-h-[650px] lg:grid-cols-[1fr_0.92fr]">
        <section className="relative isolate flex min-h-[260px] flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-500 p-7 text-white sm:p-10 lg:min-h-[650px] lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/20" />
            <div className="absolute -right-5 -top-5 h-36 w-36 rounded-full border border-white/20" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-2xl" />
            <div className="absolute left-[18%] top-[42%] h-32 w-32 rotate-12 rounded-[2.5rem] border border-white/20 bg-white/5" />
            <div className="absolute bottom-[20%] right-[12%] h-20 w-20 -rotate-12 rounded-full bg-cyan-300/20 blur-sm" />
          </div>

          <Link href="/login" className="relative z-10 inline-flex w-fit items-center gap-2 rounded-xl text-xl font-bold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-violet-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            Banter<span className="text-cyan-200">.</span>
          </Link>

          <div className="relative z-10 mx-auto my-8 flex w-full max-w-md flex-1 flex-col justify-center lg:my-10">
            <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-100">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Your people, your space
            </p>
            <h1 className="max-w-sm text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Make room for <span className="text-cyan-200">good</span> conversations.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-violet-100 sm:text-lg">
              Catch up, share a moment, and stay close to the people who make your day.
            </p>

            <div aria-hidden="true" className="relative mt-9 h-40 max-w-sm sm:h-48">
              <div className="absolute left-0 top-2 flex h-20 w-28 rotate-[-7deg] items-center justify-center rounded-[1.75rem] rounded-bl-md bg-cyan-300 text-violet-900 shadow-xl shadow-violet-950/15 sm:h-24 sm:w-36">
                <MessagesSquare className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={1.7} />
              </div>
              <div className="absolute left-[30%] top-10 flex h-20 w-28 rotate-[7deg] items-center justify-center rounded-[1.75rem] rounded-br-md bg-white text-fuchsia-600 shadow-xl shadow-violet-950/20 sm:h-24 sm:w-36">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                </span>
              </div>
              <div className="absolute right-2 top-0 flex h-12 w-12 rotate-12 items-center justify-center rounded-2xl bg-amber-300 text-rose-600 shadow-lg sm:right-4 sm:h-14 sm:w-14">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div className="absolute bottom-0 right-[13%] h-4 w-4 rounded-full bg-cyan-200/80" />
              <div className="absolute bottom-5 left-[18%] h-3 w-3 rounded-full bg-amber-300" />
            </div>
          </div>

          <p className="relative z-10 text-xs text-white/70">Simple conversations. Better connections.</p>
        </section>

        <section className="flex items-center justify-center bg-white px-5 py-9 sm:px-10 sm:py-12 lg:px-12">
          <div className="w-full max-w-md space-y-7">
            <header>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 lg:hidden">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mb-2 text-sm font-semibold text-violet-700">WELCOME BACK</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Good to see you.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to pick up where your conversations left off.</p>
            </header>

            <AuthCard>
              <div className="space-y-6">
                {error && (
                  <div role="alert" aria-live="polite" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <AuthInput
                    id="email"
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    icon={<Mail className="h-4 w-4" />}
                  />

                  <div className="space-y-2">
                    <AuthInput
                      id="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      icon={<Lock className="h-4 w-4" />}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="rounded-md p-1 text-slate-400 transition-colors hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />
                    <div className="flex justify-end">
                      <Link href="/forgot-password" className="rounded-sm text-sm font-semibold text-violet-700 transition-colors hover:text-fuchsia-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <AuthButton
                    type="submit"
                    loading={loading}
                    loadingText="Signing you in..."
                    icon={<ArrowRight className="h-4 w-4" />}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-violet-900/15 hover:from-violet-700 hover:to-fuchsia-700 focus-visible:ring-violet-500/30"
                  >
                    Sign in
                  </AuthButton>
                </form>
              </div>
            </AuthCard>

            <p className="text-center text-sm text-slate-600">
              New to Banter?{' '}
              <Link href="/register" className="font-semibold text-violet-700 transition-colors hover:text-fuchsia-700 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                Create an account
              </Link>
            </p>
            <p className="text-center text-xs text-slate-400">Your next great conversation is waiting.</p>
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
