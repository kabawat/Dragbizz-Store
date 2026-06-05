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
    const feature = (subscription?.features || []).find(f => f.module === subKey);

    // Feature active check (considering maxLimit 0 as inactive)
    const isModuleActive = feature && (feature.usageType === "UNLIMITED" || (feature.maxLimit && feature.maxLimit > 0));

    // Block if module not in subscription or has limit 0
    if (moduleKey && !isModuleActive && !isInitialLoading) {
      return {
        ...DEFAULT_PERMISSIONS,
        moduleActive: false,
        loading: isInitialLoading,
        isOwner,
        isStaff,
        can: () => false
      };
    }

    // Full access for owners (BUT restricted by subscription flags for reports/analytics)
    if (isOwner) {
      const ownerPerms = {
        ...FULL_ACCESS_PERMISSIONS,
        analytics: !!feature?.analytics,
        report: !!feature?.report,
      };
      return {
        ...ownerPerms,
        loading: false,
        isOwner: true,
        isStaff: false,
        can: (action) => ownerPerms[action] === true,
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
      // Staff permissions are FURTHER restricted by subscription flags
      analytics: (modulePermission?.analytics && feature?.analytics) || false,
      report: (modulePermission?.report && feature?.report) || false,
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
