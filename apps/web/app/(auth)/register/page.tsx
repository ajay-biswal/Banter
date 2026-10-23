'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { AuthLayout, AuthCard, AuthInput, AuthButton } from '@/components/auth';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, MessageCircle } from 'lucide-react';
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
    <AuthLayout>
      <div className="space-y-6">
        <header className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <Link href="/register" className="text-2xl font-bold tracking-tight text-slate-900 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            Banter<span className="text-emerald-600">.</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">Good conversations start here.</p>
        </header>

        <AuthCard>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">Find your people and make room for better conversations.</p>
            </div>

            {error && (
              <div role="alert" aria-live="polite" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AuthInput
                id="name"
                label="Full name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                icon={<User className="h-4 w-4" />}
                className=""
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
                    className="rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
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
                  className="mt-0.5 border-slate-300 data-checked:border-emerald-600 data-checked:bg-emerald-600"
                />
                <label htmlFor="terms" className="cursor-pointer text-sm leading-5 text-slate-600">
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-emerald-700 underline-offset-4 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="font-medium text-emerald-700 underline-offset-4 hover:underline">Privacy Policy</Link>.
                </label>
              </div>

              <AuthButton type="submit" loading={loading} loadingText="Creating your account..." icon={<ArrowRight className="h-4 w-4" />}>
                Create account
              </AuthButton>
            </form>
          </div>
        </AuthCard>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            Sign in
          </Link>
        </p>
        <p className="text-center text-xs text-slate-400">Simple conversations. Better connections.</p>
      </div>
    </AuthLayout>
  );
}
