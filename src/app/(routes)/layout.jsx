"use client"
import React from 'react';

export default function RoutesLayout({ children }) {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {children}
    </div>
  );
}
