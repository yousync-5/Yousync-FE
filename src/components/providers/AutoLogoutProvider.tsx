"use client";

import React, { ReactNode } from 'react';
import { useAutoLogout } from '@/hooks/useAutoLogout';

interface AutoLogoutProviderProps {
  children: ReactNode;
}

export default function AutoLogoutProvider({ children }: AutoLogoutProviderProps) {
  useAutoLogout();
  return <>{children}</>;
} 