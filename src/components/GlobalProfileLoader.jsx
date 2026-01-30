"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { authService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAuthProfile,
  getRetailerDetails,
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
  const hasFetchedAuthRef = useRef(false);
  const hasFetchedRetailerRef = useRef(false);

  useEffect(() => {
    if (isAuthPath(pathname)) return;

    const load = async () => {
      try {
        if (!hasRefreshedRef.current) {
          hasRefreshedRef.current = true;
          try {
            await authService.refreshToken();
          } catch (_) {}
        }

        if (!hasFetchedAuthRef.current) {
          hasFetchedAuthRef.current = true;
          try {
            await dispatch(getAuthProfile()).unwrap();
          } catch (_) {}
        }
      } catch (_) {}
    };

    load();
  }, [pathname, dispatch]);

  // Retailer profile: after we have authProfile
  useEffect(() => {
    if (isAuthPath(pathname) || !authProfile) return;

    const hasRetailerData = !!user || !!agency || (stores && stores.length > 0);
    if (hasRetailerData || hasFetchedRetailerRef.current) return;

    hasFetchedRetailerRef.current = true;
    dispatch(getRetailerDetails());
  }, [pathname, authProfile, user, agency, stores, dispatch]);

  return null;
}
