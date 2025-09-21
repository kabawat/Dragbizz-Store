"use client"
import React from 'react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { SettingsPanel } from '../../components/ui';

// Auth Layout Component
export default function AuthLayout({ children }) {
  return (
    <ThemeProvider>
      {children}
      <SettingsPanel />
    </ThemeProvider>
  );
}
