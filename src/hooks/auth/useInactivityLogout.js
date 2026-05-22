"use client";
import { useCallback, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth } from "@/store/slices/profileSlice";
import authService from "@/service/auth/auth.service";
import { isLocalhost, getMainDomain } from "@/utils/helper/domain";

// Constants
const INACTIVITY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const LAST_ACTIVITY_KEY = "dragbizz_last_activity";
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour

// Hook to handle auto logout after 7 days of inactivity
export function useInactivityLogout() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.profile);

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }, []);

  // Check if user should be logged out due to inactivity
  const checkInactivity = useCallback(async () => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) {
      updateLastActivity();
      return;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTime;

    // If inactive for more than 7 days, logout
    if (timeSinceLastActivity >= INACTIVITY_THRESHOLD_MS) {
      try {
        await authService.logout();
      } catch (_err) {
        // Ignore error
      }

      dispatch(clearAuth());
      sessionStorage.clear();
      localStorage.removeItem(LAST_ACTIVITY_KEY);

      Cookies.remove("tenant", {
        path: "/",
        domain: isLocalhost() ? undefined : `.${getMainDomain()}`,
      });

      window.location.href = "/login";
    }
  }, [dispatch, updateLastActivity]);

  // Setup activity listeners
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      return;
    }

    // Initialize/Check immediately
    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      updateLastActivity();
    }
    checkInactivity();

    // Periodic check
    const intervalId = setInterval(checkInactivity, CHECK_INTERVAL_MS);

    // Track user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "focus",
    ];

    let lastUpdateTime = Date.now();
    const THROTTLE_MS = 60 * 1000; // 1 minute

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdateTime >= THROTTLE_MS) {
        updateLastActivity();
        lastUpdateTime = now;
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearInterval(intervalId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, checkInactivity, updateLastActivity]);
}

export default useInactivityLogout;
