"use client";
import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SUB_MODULE_MAP } from "@/data/config/moduleRegistry";

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
  moduleActive: true, // Internal flag for subscription status
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

  const { subscription, isLoading: subscriptionLoading } = useSubscription();

  return useMemo(() => {
    const isInitialLoading = (authProfileLoading && !authProfile) || (staffProfileLoading && !staffProfile) || subscriptionLoading;

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

    const subKey = SUB_MODULE_MAP[moduleKey] || moduleKey;
    const isModuleActive = !subscription ? false : (subscription?.features || []).some(f => f.module === subKey);

    // Block if module not in subscription
    if (moduleKey && !isModuleActive && !isInitialLoading) {
      return { ...DEFAULT_PERMISSIONS, moduleActive: false, loading: false, isOwner, isStaff, can: () => false };
    }

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
    subscription,
    subscriptionLoading,
    moduleKey,
    isAuthenticated,
  ]);
};
