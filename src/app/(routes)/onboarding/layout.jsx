"use client"
import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SettingsPanel } from '@/components/ui';

export default function OnboardingLayout({ children }) {
  return (
    <ThemeProvider>
      {children}
      <SettingsPanel />
    </ThemeProvider>
  );
}
