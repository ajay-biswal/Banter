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

  // Fetch user on component mount
  useEffect(() => {
    // Always fetch user on mount to determine auth status
    fetchMe();
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
    redirect('/login');
  }

  // Render children if authenticated
  return <>{children}</>;
}