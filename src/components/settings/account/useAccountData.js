"use client"
import { useState, useCallback } from 'react';

export const useAccountData = () => {
  const [settings, setSettings] = useState({
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    autoSave: true
  });

  const handleChange = useCallback((name, value) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleToggle = useCallback((name) => {
    setSettings(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  }, []);

  return {
    settings,
    setSettings,
    handleChange,
    handleToggle,
  };
};

