'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { AuthLayout, AuthHeader, AuthCard, AuthInput, AuthButton } from '@/components/auth';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

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
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await register(name, email, password);
      router.push('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
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
                Create an account
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Join the community and start collaborating securely.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <AuthInput
                id="name"
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                icon={<User className="w-4 h-4" />}
              />

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

              {/* Password Field with Show/Hide Toggle */}
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="block text-xs uppercase tracking-wide text-gray-400"
                >
                  Password
                </label>
                <div className="relative">
                  {/* Left icon */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  
                  {/* Input field */}
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-11 w-full pl-10 pr-10 bg-slate-950 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus-visible:border-purple-500/50 focus-visible:ring-purple-500/20 transition-colors outline-none"
                  />
                  
                  {/* Show/Hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-400 leading-relaxed cursor-pointer select-none"
                >
                  I agree to the{' '}
                  <Link 
                    href="/terms" 
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link 
                    href="/privacy" 
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Register Button */}
              <div className="pt-2">
                <AuthButton
                  type="submit"
                  loading={loading}
                  loadingText="Creating account..."
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Register
                </AuthButton>
              </div>
            </form>
          </div>
        </AuthCard>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}