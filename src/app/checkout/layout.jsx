"use client";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAuthProfile,
  getRetailerDetails,
} from "@/store/slices/profileSlice";
import { cookieManager } from "@/utils/cookieManager";

export default function CheckoutLayout({ children }) {
  const dispatch = useAppDispatch();
  const hasFetchedAuthProfileRef = useRef(false);
  const hasFetchedRetailerProfileRef = useRef(false);

  const { authProfile, authProfileLoading, authProfileError, user, agency, stores, isLoading, error, } = useAppSelector((state) => state.profile);

  // Fetch profiles if user has token
  useEffect(() => {
    const authToken = cookieManager.getAuthToken();

    if (!authToken) {
      return;
    }

    // Fetch retailer profile if not available
    const hasRetailerData = !!user || !!agency || (stores && stores.length > 0);
    if (
      !hasRetailerData &&
      !isLoading &&
      !error &&
      !hasFetchedRetailerProfileRef.current
    ) {
      hasFetchedRetailerProfileRef.current = true;
      dispatch(getRetailerDetails());
    }

    // Fetch auth profile if not available
    const hasAuthProfile = !!authProfile;
    if (
      !hasAuthProfile &&
      !authProfileLoading &&
      !authProfileError &&
      !hasFetchedAuthProfileRef.current
    ) {
      hasFetchedAuthProfileRef.current = true;
      dispatch(getAuthProfile());
    }
  }, [
    authProfile,
    authProfileLoading,
    authProfileError,
    user,
    agency,
    stores,
    isLoading,
    error,
    dispatch,
  ]);

  return <>{children}</>;
}

