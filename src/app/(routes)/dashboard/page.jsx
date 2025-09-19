"use client"
import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { AnimatedBackground } from '@/components/ui';

export default function Dashboard() {
  const [selectedStore, setSelectedStore] = useState('Main Store');

  const handleStoreChange = (storeName) => {
    setSelectedStore(storeName);
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <AnimatedBackground variant="default" />
      <Sidebar onStoreChange={handleStoreChange} />
      <DashboardContent selectedStore={selectedStore} />
    </div>
  );
}
