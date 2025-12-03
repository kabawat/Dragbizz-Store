"use client"
import { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';

const formatDate = (date) => {
  if (!date) return '';
  return String(date).slice(0, 10);
};

const resetForm = (source) => ({
  firstName: source?.firstName || '',
  lastName: source?.lastName || '',
  dob: formatDate(source?.dob),
  gender: source?.gender || '',
});

export const useProfileData = (initialUser) => {
  const { authProfile } = useAppSelector((state) => state.profile);
  const [isEditing, setIsEditing] = useState(false);
  const [apiUser, setApiUser] = useState(initialUser || null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(() => resetForm(initialUser));

  // Sync from Redux authProfile when available
  useEffect(() => {
    if (authProfile) {
      setApiUser(authProfile);
      setForm(resetForm(authProfile));
    } else if (initialUser) {
      setApiUser(initialUser);
      setForm(resetForm(initialUser));
    }
  }, [authProfile, initialUser]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleOpenEdit = useCallback(() => {
    const source = apiUser || initialUser || {};
    setForm(resetForm(source));
    setIsEditing(true);
  }, [apiUser, initialUser]);

  const handleCancel = useCallback(() => {
    const source = apiUser || initialUser || {};
    setForm(resetForm(source));
    setIsEditing(false);
  }, [apiUser, initialUser]);

  return {
    isEditing,
    apiUser,
    setApiUser,
    isSaving,
    setIsSaving,
    form,
    setForm,
    handleChange,
    handleOpenEdit,
    handleCancel,
  };
};

