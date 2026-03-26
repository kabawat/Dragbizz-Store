"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";

/**
 * Default permissions object for any module.
 */
const DEFAULT_PERMISSIONS = {
  create: false,
  read: false,
  edit: false,
  delete: false,
  report: false,
  analytics: false,
  loading: false, // Useful for UI layers to know if permissions are still pending
};

/**
 * Full access permissions for administrative roles.
 */
const FULL_ACCESS_PERMISSIONS = {
  create: true,
  read: true,
  edit: true,
  delete: true,
  report: true,
  analytics: true,
  loading: false,
};

const STAFF_ROLE = "store_staff";

// Custom hook to lookup module-wise permissions based on user role and staff profile
export const useModulePermissions = (moduleKey) => {
  const { authProfile, staffProfile, staffProfileLoading, isAuthenticated } = useAppSelector((state) => state.profile);

  return useMemo(() => {
    // 1. Unauthenticated or missing profile => Deny by default
    if (!isAuthenticated || !authProfile) {
      return DEFAULT_PERMISSIONS;
    }

    // 2. Unknown or missing moduleKey => Safest defaults
    if (!moduleKey) {
      return DEFAULT_PERMISSIONS;
    }

    // 3. User is not staff (likely Store Owner/Admin) => Full Access
    const isStaff = authProfile.role === STAFF_ROLE;
    if (!isStaff) return FULL_ACCESS_PERMISSIONS;

    // 4. Staff member - check specific module permissions
    const permissions = staffProfile?.permissions || [];
    const modulePermission = permissions.find((p) => p.module === moduleKey);

    // If staff profile is loading, or module is not found, we use DEFAULT_PERMISSIONS
    const result = {
      ...DEFAULT_PERMISSIONS,
      ...(modulePermission || {}),
      loading: staffProfileLoading && !staffProfile,
    };

    // Clean up auxiliary 'module' field if present from API response
    if (result.module) delete result.module;

    return result;
  }, [
    authProfile?.role,
    staffProfile?.permissions,
    staffProfileLoading,
    moduleKey,
    isAuthenticated,
  ]);
};

