import { useState } from "react";
import Cookies from "js-cookie";
import { useAppDispatch } from "../store/hooks";
import { clearAuth } from "../store/slices/profileSlice";
import authService from "@/service/auth/auth.service";

// Helper function to redirect to main domain
const redirectToMainDomain = () => {
  const { protocol, host } = window.location;
  const hostParts = host.split(".");

  // If on subdomain (e.g., store.example.com), redirect to main domain (example.com)
  if (hostParts.length > 2) {
    // Remove subdomain and redirect to main domain
    const mainDomain = hostParts.slice(-2).join(".");
    window.location.href = `${protocol}//${mainDomain}`;
  } else {
    // Already on main domain, just go to home
    window.location.href = "/";
  }
};

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

      // 4. Clear tenant cookie
      Cookies.remove("tenant");

      // 5. Redirect to main domain (not subdomain)
      redirectToMainDomain();
    } catch (_error) {
      // Even if API fails, clear local state and redirect
      dispatch(clearAuth());
      Cookies.remove("tenant");
      redirectToMainDomain();
    }
  };

  return {
    showLogoutModal,
    hideLogoutModal,
    confirmLogout,
    isModalOpen,
  };
}
