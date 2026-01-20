"use client";
import { useEffect, useRef, useCallback } from "react";
import { cookieManager } from "@/utils/cookieManager";
import { useAppDispatch } from "@/store/hooks";
import { clearAuth } from "@/store/slices/profileSlice";

// Constants
const INACTIVITY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const LAST_ACTIVITY_KEY = "dragbizz_last_activity";
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour

/**
 * Hook to handle auto logout after 7 days of inactivity
 * Tracks user activity and logs out if inactive for 7 days
 */
export function useInactivityLogout() {
  const dispatch = useAppDispatch();
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
  const checkInactivity = useCallback(() => {
    if (typeof window === "undefined") return;

    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) {
      // No activity recorded, set current time
      updateLastActivity();
      return;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTime;

    // If inactive for more than 7 days, logout
    if (timeSinceLastActivity >= INACTIVITY_THRESHOLD_MS) {
      // Clear auth
      dispatch(clearAuth());
      cookieManager.clearAuth();

      // Clear sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.removeItem(LAST_ACTIVITY_KEY);
      }

      // Redirect to login
      window.location.href = "/login";
    }
  }, [dispatch, updateLastActivity]);

  // Setup activity listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if user is authenticated
    const authToken = cookieManager.getAuthToken();
    if (!authToken) {
      // Not authenticated, clear activity tracking
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
      // Clear interval
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }

      // Remove event listeners
      activityHandlersRef.current.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler);
      });
      activityHandlersRef.current = [];
    };
  }, [checkInactivity, updateLastActivity]);

  // Update activity on mount (user is active)
  useEffect(() => {
    const authToken = cookieManager.getAuthToken();
    if (authToken) {
      updateLastActivity();
    }
  }, [updateLastActivity]);
}

export default useInactivityLogout;
