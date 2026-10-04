"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { authService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAuthProfile,
  getRetailerDetails,
  getStaffProfileDetails,
  setInitialized,
} from "@/store/slices/profileSlice";
import ForcePasswordModal from "@/components/auth/ForcePasswordModal";
import { saveDevice } from "@/firebase/notification";


export default function GlobalProfileLoader() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { authProfile, staffProfile, user, agency, stores, isLoading, error } = useAppSelector(
    (state) => state.profile
  );

  const hasRefreshedRef = useRef(false);
  const refreshSucceededRef = useRef(false);
  const hasFetchedAuthRef = useRef(false);
  const hasFetchedRetailerRef = useRef(false);
  const hasFetchedStaffRef = useRef(false);

  useEffect(() => {
    const hasSessionCookie = typeof document !== 'undefined' && document.cookie.includes('logged_in=true');

    const load = async () => {
      try {
        await saveDevice().catch(() => {});

        if (!hasSessionCookie) {
          dispatch(setInitialized(true));
          return;
        }

        if (!hasRefreshedRef.current) {
          hasRefreshedRef.current = true;
          try {
            const refreshResult = await authService.refreshToken();
            if (refreshResult?.success === true && refreshResult.data !== null) {
              refreshSucceededRef.current = true;
            }
          } catch (_) { }
        }

        // If first refresh API failed, do not call the profile APIs
        if (!refreshSucceededRef.current) {
          dispatch(setInitialized(true));
          return;
        }

        const promises = [];
        if (!hasFetchedAuthRef.current) {
          hasFetchedAuthRef.current = true;
          promises.push(dispatch(getAuthProfile()));
        }

        // Fetch retailer profile once per session bootstrap
        if (!hasFetchedRetailerRef.current) {
          hasFetchedRetailerRef.current = true;
          promises.push(dispatch(getRetailerDetails()));
        }

        if (promises.length > 0) {
          await Promise.allSettled(promises);
        }
      } catch (_) { }
    };

    load();
  }, [pathname, dispatch]);

  // Retailer profile: after we have authProfile with agency
  useEffect(() => {
    if (!authProfile?.agencyId) return;

    const hasSessionCookie = typeof document !== 'undefined' && document.cookie.includes('logged_in=true');
    if (!hasSessionCookie) return;

    const hasStores = Array.isArray(stores) && stores.length > 0;
    if (hasStores || hasFetchedRetailerRef.current) return;

    hasFetchedRetailerRef.current = true;
    dispatch(getRetailerDetails());
  }, [pathname, authProfile?.agencyId, agency, stores, dispatch]);

  // Staff profile: after we have authProfile and role is "store_staff"
  useEffect(() => {
    if (!authProfile || authProfile.role !== 'store_staff') return;

    if (staffProfile || hasFetchedStaffRef.current) return;

    hasFetchedStaffRef.current = true;
    dispatch(getStaffProfileDetails());
  }, [authProfile, staffProfile, dispatch]);

  const shouldShowModal = !!authProfile && authProfile.ispwds === false;

  return (
    <>
      <ForcePasswordModal isOpen={shouldShowModal} />
    </>
  );
}
