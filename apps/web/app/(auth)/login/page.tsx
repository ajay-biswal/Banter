'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { AuthLayout, AuthHeader, AuthCard, AuthInput, AuthButton, SocialLogin } from '@/components/auth';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Logo and App Name */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/banter.png"
            alt="Banter"
            width={48}
            height={48}
            className="mb-2"
          />
          <h1 className="text-xl font-semibold text-white">Banter</h1>
        </div>

        {/* Main Card */}
        <AuthCard>
          <div className="space-y-6">
            {/* Title Section */}
            <div>
              <h2 className="text-lg font-semibold text-white">
                Welcome back
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Enter your credentials to access your workspace.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <AuthInput
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                icon={<Mail className="w-4 h-4" />}
              />

              {/* Password Field */}
              <div className="space-y-2">
                <AuthInput
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  icon={<Lock className="w-4 h-4" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />
                
                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <AuthButton
                  type="submit"
                  loading={loading}
                  loadingText="Signing in..."
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign in
                </AuthButton>
              </div>
            </form>

            {/* Social Login */}
            {/* <SocialLogin /> */}
          </div>
        </AuthCard>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link 
            href="/register" 
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}