"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";

// Roles
export const ROLES = {
  OWNER: "store_owner",
  STAFF: "store_staff",
};

// Default permissions (Denied)
const DEFAULT_PERMISSIONS = {
  create: false,
  read: false,
  edit: false,
  delete: false,
  report: false,
  analytics: false,
};

// Full access
const FULL_ACCESS_PERMISSIONS = {
  create: true,
  read: true,
  edit: true,
  delete: true,
  report: true,
  analytics: true,
};

export const useModulePermissions = (moduleKey) => {
  const { 
    authProfile, 
    authProfileLoading,
    staffProfile, 
    staffProfileLoading, 
    isAuthenticated 
  } = useAppSelector((state) => state.profile);

  return useMemo(() => {
    const isInitialLoading = (authProfileLoading && !authProfile) || (staffProfileLoading && !staffProfile);
    
    // Deny if unauth or profile still loading
    if (!isAuthenticated || !authProfile) {
      return { 
        ...DEFAULT_PERMISSIONS, 
        loading: isInitialLoading,
        isOwner: false,
        isStaff: false,
        can: () => false 
      };
    }

    const isOwner = authProfile.role === ROLES.OWNER;
    const isStaff = authProfile.role === ROLES.STAFF;

    // Full access for owners
    if (isOwner) {
      return {
        ...FULL_ACCESS_PERMISSIONS,
        loading: false,
        isOwner: true,
        isStaff: false,
        can: () => true,
      };
    }

    // Default if module key is missing
    if (!moduleKey) {
      return { 
        ...DEFAULT_PERMISSIONS, 
        loading: isInitialLoading,
        isOwner: false,
        isStaff: isStaff,
        can: () => false 
      };
    }

    // Explicitly block management for staff
    if (isStaff && moduleKey === "management") {
      return {
        ...DEFAULT_PERMISSIONS,
        loading: isInitialLoading,
        isOwner: false,
        isStaff: true,
        can: () => false,
      };
    }

    // Lookup staff permissions
    const permissions = staffProfile?.permissions || [];
    const modulePermission = permissions.find((p) => p.module === moduleKey);

    const perms = {
      ...DEFAULT_PERMISSIONS,
      ...(modulePermission || {}),
    };

    if (perms.module) delete perms.module;

    return {
      ...perms,
      loading: isInitialLoading,
      isOwner: false,
      isStaff: true,
      can: (action) => perms[action] === true,
    };
  }, [
    authProfile,
    authProfileLoading,
    staffProfile?.permissions,
    staffProfileLoading,
    moduleKey,
    isAuthenticated,
  ]);
};



