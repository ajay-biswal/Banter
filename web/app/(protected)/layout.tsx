'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading, fetchMe } = useAuth();

  // Fix: useEffect should run exactly once on mount
  useEffect(() => {
    // Only fetch user if we haven't determined auth state yet
    if (!isAuthenticated && !loading) {
      fetchMe();
    }
  }, []); // Empty dependency array - run once only

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && !loading) {
    router.push('/login');
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}