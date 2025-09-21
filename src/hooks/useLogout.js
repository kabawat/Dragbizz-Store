import { useState } from 'react';
import { cookieManager } from '../utils/cookieManager';
import { useAppDispatch } from '../store/hooks';
import { clearAuth } from '../store/slices/profileSlice';

export function useLogout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const showLogoutModal = () => {
    setIsModalOpen(true);
  };

  const hideLogoutModal = () => {
    setIsModalOpen(false);
  };

  const confirmLogout = () => {
    try {
      // Clear Redux store
      dispatch(clearAuth());
      
      // Clear cookies
      cookieManager.clearAuth();

      // Clear sessionStorage
      sessionStorage.clear();
      
      window.location.href = '/';

    } catch (error) {
      window.location.href = '/';
    }
  };

  return { 
    showLogoutModal, 
    hideLogoutModal, 
    confirmLogout,
    isModalOpen 
  };
}