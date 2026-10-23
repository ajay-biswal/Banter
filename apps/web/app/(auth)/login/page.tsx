'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { AuthLayout, AuthCard, AuthInput, AuthButton } from '@/components/auth';
import { Mail, Lock, ArrowRight, Eye, EyeOff, MessageCircle } from 'lucide-react';
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
    <AuthLayout>
      <div className="space-y-6">
        <header className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <Link href="/login" className="text-2xl font-bold tracking-tight text-slate-900 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            Banter<span className="text-emerald-600">.</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">Good conversations start here.</p>
        </header>

        <AuthCard>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to catch up with your people.</p>
            </div>

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
                      className="rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <AuthButton type="submit" loading={loading} loadingText="Signing you in..." icon={<ArrowRight className="h-4 w-4" />}>
                Sign in
              </AuthButton>
            </form>
          </div>
        </AuthCard>

        <p className="text-center text-sm text-slate-600">
          New to Banter?{' '}
          <Link href="/register" className="font-semibold text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            Create an account
          </Link>
        </p>
        <p className="text-center text-xs text-slate-400">Simple conversations. Better connections.</p>
      </div>
    </AuthLayout>
  );
}
