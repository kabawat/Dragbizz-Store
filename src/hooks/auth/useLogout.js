import { useState } from "react";
import Cookies from "js-cookie";
import { useAppDispatch } from "@/store/hooks";
import { clearAuth } from "@/store/slices/profileSlice";
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
      // 1. Call backend logout (deletes HttpOnly cookies)
      await authService.logout();

      // 2. Clear Redux store
      dispatch(clearAuth());

      // 3. Clear local session data
      sessionStorage.clear();

      // 4. Clear tenant cookie (must match domain/path used when setting)
      const hostname = typeof window !== "undefined" ? window.location.hostname : "";
      const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
      Cookies.remove("tenant", {
        path: "/",
        domain: isLocalhost ? undefined : `.${hostname.split(".").slice(-2).join(".")}`,
      });

      // 5. Redirect to main domain (not subdomain)
      redirectToMainDomain();
    } catch (_error) {
      // Even if API fails, clear local state and redirect
      dispatch(clearAuth());
      const hostname = typeof window !== "undefined" ? window.location.hostname : "";
      const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
      Cookies.remove("tenant", {
        path: "/",
        domain: isLocalhost ? undefined : `.${hostname.split(".").slice(-2).join(".")}`,
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
