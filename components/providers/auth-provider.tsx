'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const refreshUser = useAuthStore((state) => state.refreshUser);

  useEffect(() => {
    // Load user on mount
    refreshUser();
  }, [refreshUser]);

  return <>{children}</>;
}
