
import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { performCompleteLogout } from '@/utils/logoutUtils';

export function useLogout() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const logout = async () => {
    try {
      // Use complete logout utility
      const result = await performCompleteLogout(dispatch, logoutUser);
      return result;
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even on error
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
      return { success: false, error };
    }
  };

  const showLogoutModal = () => {
    setIsModalOpen(true);
  };

  const hideLogoutModal = () => {
    setIsModalOpen(false);
  };

  const confirmLogout = async () => {
    try {
      // Perform complete logout
      const result = await performCompleteLogout(dispatch, logoutUser);
      
      if (result.success) {
        console.log('Logout completed successfully with page replacement');
      } else {
        console.warn('Logout completed but with warnings:', result.error);
      }
      
      setIsModalOpen(false);
      
    } catch (error) {
      console.error('Logout error:', error);
      setIsModalOpen(false);
      
      // Force redirect even on error
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
    }
  };

  return { 
    logout, 
    showLogoutModal, 
    hideLogoutModal, 
    confirmLogout,
    isModalOpen 
  };
}
