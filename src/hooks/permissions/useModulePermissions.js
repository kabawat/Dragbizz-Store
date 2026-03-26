"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";

const DEFAULT_PERMISSIONS = {
  create: false,
  read: false,
  edit: false,
  delete: false,
  report: false,
  analytics: false,
};

const FULL_ACCESS_PERMISSIONS = {
  create: true,
  read: true,
  edit: true,
  delete: true,
  report: true,
  analytics: true,
};

/**
 * Module-wise permission lookup.
 * - Staff (role: "store_staff") => returns flags from `staffProfile.permissions`
 * - Non-staff => treated as full access (true for known flags)
 */
export const useModulePermissions = (moduleKey) => {
  const { authProfile, staffProfile } = useAppSelector((state) => state.profile);

  return useMemo(() => {
    // Unknown module => safest defaults
    if (!moduleKey) return DEFAULT_PERMISSIONS;

    const isStaff = authProfile?.role === "store_staff";
    if (!isStaff) return FULL_ACCESS_PERMISSIONS;

    const permissions = staffProfile?.permissions || [];
    const modulePermission = permissions.find((p) => p.module === moduleKey);

    return {
      ...DEFAULT_PERMISSIONS,
      ...(modulePermission || {}),
    };
  }, [authProfile?.role, staffProfile?.permissions, moduleKey]);
};

