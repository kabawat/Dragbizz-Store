"use client"
import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import {
  AppearanceSettings,
  ProfileSettings,
  AccountSettings,
  StoreSettings,
  SecuritySettings,
  NotificationsSettings
} from '@/components/settings';
import {
  User,
  Shield,
  Store,
  Bell,
  Settings as SettingsIcon,
  Palette,
  ChevronRight
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

const settingsTabs = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: SettingsIcon },
  { id: 'store', label: 'Store', icon: Store },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
  const { user, selectedStore } = useAppSelector((state) => state.profile);
  const { toggleVariant, currentVariant } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [animationKey, setAnimationKey] = useState(0);

  const handleToggleVariant = () => {
    setAnimationKey(prev => prev + 1);
    toggleVariant();
  };

  return (
    <>
      <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
        <AnimatedBackground variant="default" />
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
          {/* Header */}
          <Header
            title="Settings"
            description="Manage your account, store, and preferences"
          />

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md border-r border-[rgb(var(--color-border-primary))]/50 flex-shrink-0">
              <div className="p-4">
                <div className="space-y-1">
                  {settingsTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                          activeTab === tab.id
                            ? 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border border-[rgb(var(--color-primary))]/20'
                            : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-primary))]/30 hover:text-[rgb(var(--color-text-primary))]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                        {activeTab === tab.id && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden p-4 sm:p-6">
              <div className="w-full h-full mx-auto">
                {/* Tab Content */}
                {activeTab === 'appearance' && (
                  <AppearanceSettings animationKey={animationKey} handleToggleVariant={handleToggleVariant} />
                )}

                {activeTab === 'profile' && (
                  <ProfileSettings user={user} />
                )}

                {activeTab === 'account' && (
                  <AccountSettings />
                )}

                {activeTab === 'store' && (
                  <StoreSettings selectedStore={selectedStore} />
                )}

                {activeTab === 'security' && (
                  <SecuritySettings />
                )}

                {activeTab === 'notifications' && (
                  <NotificationsSettings />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
