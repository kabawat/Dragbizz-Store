"use client"
import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function DashboardLayout({ children }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        {children}
      </div>
    </ThemeProvider>
  );
}
