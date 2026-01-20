'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/hooks';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, fetchMe } = useAuth();

  // Always run auth check once on mount
  useEffect(() => {
    fetchMe();
  }, []);

  // ⏳ Loading state (ONLY when loading is true)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
        {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /> */}
      </div>
    );
  }

  // 🔐 Not authenticated → redirect
  if (!isAuthenticated) {
    redirect('/login');
  }

  // ✅ Authenticated → render protected UI
  return <>{children}</>;
}
