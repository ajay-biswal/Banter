'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { AuthLayout, AuthCard, AuthInput, AuthButton } from '@/components/auth';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, MessageCircle, Sparkles, Heart, MessagesSquare, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    if (password.length < 8) {
      setError('Your password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(name, email, password);
      router.push('/chat');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'We couldn’t create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout wide>
      <div className="grid overflow-hidden rounded-[2rem] border border-violet-100/80 bg-white shadow-[0_32px_100px_-42px_rgba(76,29,149,0.32)] lg:min-h-[700px] lg:grid-cols-[0.92fr_1fr]">
        <section className="relative isolate flex min-h-[250px] flex-col justify-between overflow-hidden bg-gradient-to-br from-cyan-500 via-sky-500 to-violet-600 p-7 text-white sm:p-10 lg:min-h-[700px] lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-14 -top-14 h-56 w-56 rounded-full border border-white/25" />
            <div className="absolute -right-2 -top-2 h-36 w-36 rounded-full border border-white/25" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-300/30" />
            <div className="absolute left-[14%] top-[38%] h-28 w-28 rotate-12 rounded-[2rem] border border-white/20 bg-white/5" />
            <div className="absolute bottom-[22%] right-[10%] h-16 w-16 -rotate-12 rounded-3xl bg-amber-300/25" />
          </div>

          <Link href="/register" className="relative z-10 inline-flex w-fit items-center gap-2 rounded-xl text-xl font-bold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-sky-600">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            Banter<span className="text-amber-200">.</span>
          </Link>

          <div className="relative z-10 mx-auto my-7 flex w-full max-w-md flex-1 flex-col justify-center lg:my-10">
            <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-50">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              A little more connected
            </p>
            <h1 className="max-w-sm text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Your next favorite <span className="text-amber-200">people</span> are here.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-cyan-50 sm:text-lg">
              Start a space for the small moments, big stories, and everyday hellos.
            </p>

            <div aria-hidden="true" className="relative mt-8 h-40 max-w-sm sm:mt-10 sm:h-48">
              <div className="absolute left-0 top-3 flex h-20 w-28 rotate-[-6deg] items-center justify-center rounded-[1.75rem] rounded-bl-md bg-amber-300 text-sky-900 shadow-xl shadow-sky-950/15 sm:h-24 sm:w-36">
                <UsersRound className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={1.7} />
              </div>
              <div className="absolute left-[30%] top-9 flex h-20 w-28 rotate-[6deg] items-center justify-center rounded-[1.75rem] rounded-br-md bg-white text-violet-600 shadow-xl shadow-sky-950/20 sm:h-24 sm:w-36">
                <MessagesSquare className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={1.7} />
              </div>
              <div className="absolute right-3 top-0 flex h-12 w-12 rotate-12 items-center justify-center rounded-2xl bg-fuchsia-300 text-fuchsia-800 shadow-lg sm:right-5 sm:h-14 sm:w-14">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div className="absolute bottom-1 right-[12%] h-4 w-4 rounded-full bg-amber-200" />
              <div className="absolute bottom-5 left-[18%] h-3 w-3 rounded-full bg-fuchsia-200" />
            </div>
          </div>

          <p className="relative z-10 text-xs text-white/75">Simple conversations. Better connections.</p>
        </section>

        <section className="flex items-center justify-center bg-white px-5 py-8 sm:px-10 sm:py-10 lg:px-12">
          <div className="w-full max-w-md space-y-6">
            <header>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-sky-700 lg:hidden">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mb-2 text-sm font-semibold text-sky-700">JOIN THE CONVERSATION</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Create your account.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Find your people and make room for better conversations.</p>
            </header>

            <AuthCard>
              <div className="space-y-5">
                {error && (
                  <div role="alert" aria-live="polite" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <AuthInput
                    id="name"
                    label="Full name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    icon={<User className="h-4 w-4" />}
                  />

                  <AuthInput
                    id="email"
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    icon={<Mail className="h-4 w-4" />}
                  />

                  <AuthInput
                    id="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    icon={<Lock className="h-4 w-4" />}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="rounded-md p-1 text-slate-400 transition-colors hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />

                  <div className="flex items-start gap-3 pt-1">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                      className="mt-0.5 border-slate-300 data-checked:border-sky-600 data-checked:bg-sky-600"
                    />
                    <label htmlFor="terms" className="cursor-pointer text-sm leading-5 text-slate-600">
                      I agree to the{' '}
                      <Link href="/terms" className="font-medium text-sky-700 underline-offset-4 hover:underline">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="font-medium text-sky-700 underline-offset-4 hover:underline">Privacy Policy</Link>.
                    </label>
                  </div>

                  <AuthButton
                    type="submit"
                    loading={loading}
                    loadingText="Creating your account..."
                    icon={<ArrowRight className="h-4 w-4" />}
                    className="bg-gradient-to-r from-sky-500 to-violet-600 shadow-sky-900/15 hover:from-sky-600 hover:to-violet-700 focus-visible:ring-sky-500/30"
                  >
                    Create account
                  </AuthButton>
                </form>
              </div>
            </AuthCard>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-sky-700 transition-colors hover:text-violet-700 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
                Sign in
              </Link>
            </p>
            <p className="text-center text-xs text-slate-400">Your next great conversation is waiting.</p>
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
