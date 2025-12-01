"use client"
import { useEffect, useState, useCallback } from 'react';
import authService from '@/service/auth/auth.service';

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
  const [isEditing, setIsEditing] = useState(false);
  const [apiUser, setApiUser] = useState(initialUser || null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(() => resetForm(initialUser));

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const result = await authService.getProfile();
        if (!isMounted) return;

        if (result?.success && result.data) {
          const data = result.data.data || result.data;
          setApiUser(data);
          setForm(resetForm(data));
        }
      } catch (e) {
        // Silent fail; existing Redux user will still show
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

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

