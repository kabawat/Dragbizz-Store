"use client";
import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth } from "@/store/slices/profileSlice";
import authService from "@/service/auth/auth.service";

// Constants
const INACTIVITY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const LAST_ACTIVITY_KEY = "dragbizz_last_activity";
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour

// Hook to handle auto logout after 7 days of inactivity
export function useInactivityLogout() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.profile);
  const checkIntervalRef = useRef(null);
  const activityHandlersRef = useRef([]);

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    const now = Date.now();
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    }
  }, []);

  // Check if user should be logged out due to inactivity
  const checkInactivity = useCallback(async () => {
    if (typeof window === "undefined") return;

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
        // 1. Call backend logout
        await authService.logout();
      } catch (_err) {
        // Ignore error
      }

      // 2. Clear Redux store
      dispatch(clearAuth());

      // 3. Clear local session data
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.removeItem(LAST_ACTIVITY_KEY);
      }

      // 4. Redirect to login
      window.location.href = "/login";
    }
  }, [dispatch, updateLastActivity]);

  // Setup activity listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only track activity if authenticated
    if (!isAuthenticated) {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      return;
    }

    // Initialize last activity if not set
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) {
      updateLastActivity();
    }

    // Check inactivity immediately
    checkInactivity();

    // Set up periodic check (every hour)
    checkIntervalRef.current = setInterval(() => {
      checkInactivity();
    }, CHECK_INTERVAL_MS);

    // Track user activity events
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "focus",
    ];

    // Throttle activity updates (update max once per minute)
    let lastUpdateTime = 0;
    const THROTTLE_MS = 60 * 1000; // 1 minute

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdateTime >= THROTTLE_MS) {
        updateLastActivity();
        lastUpdateTime = now;
      }
    };

    // Add event listeners
    activityHandlersRef.current = activityEvents.map((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
      return { event, handler: handleActivity };
    });

    // Cleanup function
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }

      activityHandlersRef.current.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler);
      });
      activityHandlersRef.current = [];
    };
  }, [isAuthenticated, checkInactivity, updateLastActivity]);

  // Update activity on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      updateLastActivity();
    }
  }, [isAuthenticated, updateLastActivity]);
}

export default useInactivityLogout;
