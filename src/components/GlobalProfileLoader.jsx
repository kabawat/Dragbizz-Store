"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { authService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAuthProfile,
  getRetailerDetails,
  setInitialized,
} from "@/store/slices/profileSlice";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

function isAuthPath(pathname) {
  if (!pathname) return true;
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default function GlobalProfileLoader() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { authProfile, user, agency, stores, isLoading, error } = useAppSelector(
    (state) => state.profile
  );

  const hasRefreshedRef = useRef(false);
  const refreshSucceededRef = useRef(false);
  const hasFetchedAuthRef = useRef(false);
  const hasFetchedRetailerRef = useRef(false);

  useEffect(() => {
    const isAuth = isAuthPath(pathname);
    const hasSessionCookie = typeof document !== 'undefined' && document.cookie.includes('logged_in=true');

    if (isAuth && !hasSessionCookie) { dispatch(setInitialized(true)); return; }

    const load = async () => {
      try {
        if (!hasRefreshedRef.current) {
          hasRefreshedRef.current = true;
          try {
            const refreshResult = await authService.refreshToken();
            if (refreshResult?.success === true && refreshResult.data !== null) {
              refreshSucceededRef.current = true;
            }
          } catch (_) { }
        }

        // If first refresh API failed, do not call the 2 profile APIs (getAuthProfile, getRetailerDetails)
        if (!refreshSucceededRef.current) {
          dispatch(setInitialized(true));
          return;
        }

        if (!hasFetchedAuthRef.current) {
          hasFetchedAuthRef.current = true;
          try {
            await dispatch(getAuthProfile()).unwrap();
          } catch (_) { }
        }
      } catch (_) { }
    };

    load();
  }, [pathname, dispatch]);

  // Retailer profile: after we have authProfile
  useEffect(() => {
    if (!authProfile) return;

    const isAuth = isAuthPath(pathname);
    const hasSessionCookie = typeof document !== 'undefined' && document.cookie.includes('logged_in=true');
    if (isAuth && !hasSessionCookie) return;

    const hasRetailerData = !!user || !!agency || (stores && stores.length > 0);
    if (hasRetailerData || hasFetchedRetailerRef.current) return;

    hasFetchedRetailerRef.current = true;
    dispatch(getRetailerDetails());
  }, [pathname, authProfile, user, agency, stores, dispatch]);

  return null;
}
