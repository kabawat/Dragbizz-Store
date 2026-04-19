"use client";

import { useCallback, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { useSubscription } from "@/contexts/SubscriptionContext";

// Custom hook to centralize subscription-based feature access checks.
export const useSubscriptionAccess = () => {
    const { authProfile } = useAppSelector((state) => state.profile);
    const { subscription, showUpgradeModal, isLoading } = useSubscription();

    const isStaff = useMemo(() => authProfile?.role === "STORE_STAFF", [authProfile]);

    // Feature access check
    const checkPermission = useCallback((moduleName, requireAnalytics = false) => {
        if (!moduleName) return true;
        if (isLoading) return true;
        if (!subscription) return false;

        const feature = (subscription?.features || []).find(f => f.module === moduleName);
        if (!feature) return false;

        return requireAnalytics ? !!feature.analytics : true;
    }, [subscription, isLoading]);

    // Wrap action with access check
    const withAccess = useCallback((moduleName, action, requireAnalytics = false) => {
        return (...args) => {
            if (checkPermission(moduleName, requireAnalytics)) {
                return action?.(...args);
            }

            let message;
            if (isStaff) {
                message = `This feature is not available in your current plan. Please contact your Store Admin to upgrade the subscription.`;
            } else {
                message = requireAnalytics
                    ? `Your current plan does not include Analytics for the ${moduleName.replace('_', ' ')} module. Please upgrade to access this feature.`
                    : `Your current plan does not include the ${moduleName.replace('_', ' ')} module. Please upgrade to access this feature.`;
            }

            showUpgradeModal(message, isStaff ? "INFO" : "UPGRADE");
            return null;
        };
    }, [checkPermission, isStaff, showUpgradeModal]);

    return {
        hasAccess: checkPermission,
        withAccess,
        isStaff,
        isLoading
    };
};
