"use client"
import React, { useState } from 'react';

const AccountSettings = () => {
  const [settings, setSettings] = useState({
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    autoSave: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Account Settings</h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          Configure your account preferences
        </p>
      </div>

      <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
            Language
          </label>
          <select
            name="language"
            value={settings.language}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
            Timezone
          </label>
          <select
            name="timezone"
            value={settings.timezone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
            Date Format
          </label>
          <select
            name="dateFormat"
            value={settings.dateFormat}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
            Currency
          </label>
          <select
            name="currency"
            value={settings.currency}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">₹ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--color-border-primary))]">
          <div>
            <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">Auto Save</p>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">
              Automatically save your changes
            </p>
          </div>
          <button
            onClick={() => setSettings(prev => ({ ...prev, autoSave: !prev.autoSave }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              settings.autoSave ? 'bg-[rgb(var(--color-primary))]' : 'bg-[rgb(var(--color-border-primary))]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.autoSave ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;

