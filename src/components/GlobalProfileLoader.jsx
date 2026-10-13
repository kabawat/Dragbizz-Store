"use client";

import { useEffect, useRef } from "react";
import ForcePasswordModal from "@/components/auth/ForcePasswordModal";
import { saveDevice } from "@/firebase/notification";
import { authService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAuthProfile,
  getRetailerDetails,
  getStaffProfileDetails,
  setInitialized,
} from "@/store/slices/profileSlice";

// Module-level to avoid Strict Mode double refresh
let authBootstrapStarted = false;
let authBootstrapDone = false;

export default function GlobalProfileLoader() {
  const dispatch = useAppDispatch();
  const { authProfile, staffProfile, agency, stores } = useAppSelector(
    (state) => state.profile
  );

  const hasFetchedRetailerRef = useRef(false);
  const hasFetchedStaffRef = useRef(false);

  useEffect(() => {
    const hasSessionCookie =
      typeof document !== "undefined" &&
      document.cookie.includes("logged_in=true");

    if (!hasSessionCookie) {
      dispatch(setInitialized(true));
      return;
    }

    if (authBootstrapDone) {
      if (!authProfile) dispatch(setInitialized(true));
      return;
    }

    if (authBootstrapStarted) return;
    authBootstrapStarted = true;

    const load = async () => {
      try {
        await saveDevice().catch(() => {});

        try {
          await authService.refreshToken();
        } catch (_) {}

        try {
          await dispatch(getAuthProfile()).unwrap();
        } catch (_) {
          dispatch(setInitialized(true));
        }
      } catch (_) {
        dispatch(setInitialized(true));
      } finally {
        authBootstrapDone = true;
      }
    };

    load();
  }, [dispatch, authProfile]);

  useEffect(() => {
    if (!authProfile?.agencyId) return;

    const hasSessionCookie =
      typeof document !== "undefined" &&
      document.cookie.includes("logged_in=true");
    if (!hasSessionCookie) return;

    const hasStores = Array.isArray(stores) && stores.length > 0;
    if (hasStores || agency || hasFetchedRetailerRef.current) return;

    hasFetchedRetailerRef.current = true;
    dispatch(getRetailerDetails());
  }, [authProfile?.agencyId, agency, stores, dispatch]);

  useEffect(() => {
    if (!authProfile || authProfile.role !== "store_staff") return;
    if (staffProfile || hasFetchedStaffRef.current) return;

    hasFetchedStaffRef.current = true;
    dispatch(getStaffProfileDetails());
  }, [authProfile, staffProfile, dispatch]);

  const shouldShowModal = !!authProfile && authProfile.ispwds === false;

  return <ForcePasswordModal isOpen={shouldShowModal} />;
}
