'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks';
import { useSocket } from '@/hooks';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const { isAuthenticated } = useAuth();
  const { connect, disconnect } = useSocket();

  // Manage socket lifecycle based on authentication state
  useEffect(() => {
    if (isAuthenticated) {
      // Connect socket when user becomes authenticated
      connect();
    } else {
      // Disconnect socket when user becomes unauthenticated
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  return <>{children}</>;
}