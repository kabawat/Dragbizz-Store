import { useState } from "react";
import Cookies from "js-cookie";
import { useAppDispatch } from "@/store/hooks";
import { clearAuth } from "@/store/slices/profileSlice";
import authService from "@/service/auth/auth.service";
import fcmService from "@/service/utility/fcm.service";
import { isLocalhost, getMainDomain, redirectToMainDomain } from "@/utils/helper/domain";

export function useLogout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dispatch = useAppDispatch();

  const showLogoutModal = () => {
    setIsModalOpen(true);
  };

  const hideLogoutModal = () => {
    if (isLoggingOut) return; // Prevent closing while logging out
    setIsModalOpen(false);
  };

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      try {
        await fcmService.deleteToken();
      } catch (err) {
        // Ignore FCM deletion error on logout
      }
      
      // 1. Call backend logout (deletes HttpOnly cookies)
      await authService.logout();

      // 2. Clear Redux store
      dispatch(clearAuth());

      // 3. Clear local session data
      sessionStorage.clear();

      // 4. Clear tenant cookie (must match domain/path used when setting)
      Cookies.remove("tenant", {
        path: "/",
        domain: isLocalhost() ? undefined : `.${getMainDomain()}`,
      });

      // 5. Redirect to main domain (not subdomain)
      redirectToMainDomain();
    } catch (_error) {
      // Even if API fails, clear local state and redirect
      dispatch(clearAuth());
      Cookies.remove("tenant", {
        path: "/",
        domain: isLocalhost() ? undefined : `.${getMainDomain()}`,
      });
      redirectToMainDomain();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    showLogoutModal,
    hideLogoutModal,
    confirmLogout,
    isModalOpen,
    isLoggingOut,
  };
}
