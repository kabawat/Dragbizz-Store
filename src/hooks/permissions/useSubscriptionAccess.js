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
    const checkPermission = useCallback((moduleName, requireAnalytics = false, requireReport = false) => {
        if (!moduleName) return true;
        if (isLoading) return true;
        if (!subscription) return false;

        const feature = (subscription?.features || []).find(f => f.module === moduleName);
        if (!feature) return false;

        // Check if feature is explicitly not included (limit 0 and not unlimited)
        const isNotIncluded = feature.maxLimit === 0 && feature.usageType !== "UNLIMITED";
        if (isNotIncluded) return false;

        if (requireAnalytics && !feature.analytics) return false;
        if (requireReport && !feature.report) return false;

        return true;
    }, [subscription, isLoading]);

    // Wrap action with access check
    const withAccess = useCallback((moduleName, action, requireAnalytics = false, requireReport = false, skipBlock = false) => {
        return (...args) => {
            const hasAccess = checkPermission(moduleName, requireAnalytics, requireReport);

            if (!hasAccess) {
                let message;
                if (isStaff) {
                    message = `This feature is not available in your current plan. Please contact your Store Admin to upgrade the subscription.`;
                } else {
                    if (requireAnalytics) {
                        message = `Your current plan does not include Analytics for the ${moduleName.replace('_', ' ')} module. Please upgrade to access this feature.`;
                    } else if (requireReport) {
                        message = `Your current plan does not include Downloadable Reports for the ${moduleName.replace('_', ' ')} module. Please upgrade to access this feature.`;
                    } else {
                        message = `Your current plan does not include the ${moduleName.replace('_', ' ')} module. Please upgrade to access this feature.`;
                    }
                }

                showUpgradeModal(message, isStaff ? "INFO" : "UPGRADE");

                // If not skipping block, stop execution here
                if (!skipBlock) return null;
            }

            // Execute action if has access OR if skipBlock is true
            return action?.(...args);
        };
    }, [checkPermission, isStaff, showUpgradeModal]);

    return {
        hasAccess: checkPermission,
        withAccess,
        isStaff,
        isLoading
    };
};
