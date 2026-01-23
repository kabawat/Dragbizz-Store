import { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { clearAuth } from "../store/slices/profileSlice";
import authService from "@/service/auth/auth.service";

export function useLogout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const showLogoutModal = () => {
    setIsModalOpen(true);
  };

  const hideLogoutModal = () => {
    setIsModalOpen(false);
  };

  const confirmLogout = async () => {
    try {
      // 1. Call backend logout (deletes HttpOnly cookies)
      await authService.logout();

      // 2. Clear Redux store
      dispatch(clearAuth());

      // 3. Clear local session data
      sessionStorage.clear();

      // 4. Redirect to home
      window.location.href = "/";
    } catch (_error) {
      // Even if API fails, clear local state and redirect
      dispatch(clearAuth());
      window.location.href = "/";
    }
  };

  return {
    showLogoutModal,
    hideLogoutModal,
    confirmLogout,
    isModalOpen,
  };
}
