"use client";

import { useCallback, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { hasFeatureCapability } from "@/utils/subscriptionCapability.util";

export const useSubscriptionAccess = () => {
    const { authProfile } = useAppSelector((state) => state.profile);
    const { subscription, showUpgradeModal, isLoading } = useSubscription();

    const isStaff = useMemo(() => authProfile?.role === "STORE_STAFF", [authProfile]);

    const checkPermission = useCallback((moduleName, requireAnalytics = false, requireReport = false, requireCapability = null) => {
        if (!moduleName) return true;
        if (isLoading) return true;
        if (!subscription) return false;

        const feature = (subscription?.features || []).find(f => f.module === moduleName);
        if (!feature) return false;

        const isNotIncluded = feature.maxLimit === 0 && feature.usageType !== "UNLIMITED";
        if (isNotIncluded) return false;

        if (requireAnalytics && !feature.analytics) return false;
        if (requireReport && !feature.report) return false;
        if (requireCapability && !hasFeatureCapability(feature, requireCapability)) return false;

        return true;
    }, [subscription, isLoading]);

    const withAccess = useCallback((moduleName, action, requireAnalytics = false, requireReport = false, skipBlock = false, requireCapability = null) => {
        return (...args) => {
            const hasAccess = checkPermission(moduleName, requireAnalytics, requireReport, requireCapability);

            if (!hasAccess) {
                let message;
                if (isStaff) {
                    message = `This feature is not available in your current plan. Please contact your Store Admin to upgrade the subscription.`;
                } else if (requireCapability === "pos") {
                    message = "POS and invoice release require Premium ERP. Upgrade to unlock full billing.";
                } else if (requireCapability === "gst") {
                    message = "GST analytics require Premium ERP. Upgrade to access GST reports.";
                } else if (requireCapability === "fifo") {
                    message = "FIFO inventory depth requires Premium ERP. Upgrade to manage stock batches.";
                } else if (requireAnalytics) {
                    message = `Your current plan does not include Analytics for the ${moduleName.replace('_', ' ')} module. Please upgrade to access this feature.`;
                } else if (requireReport) {
                    message = `Your current plan does not include Downloadable Reports for the ${moduleName.replace('_', ' ')} module. Please upgrade to access this feature.`;
                } else {
                    message = `Your current plan does not include the ${moduleName.replace('_', ' ')} module. Please upgrade to access this feature.`;
                }

                showUpgradeModal(message, isStaff ? "INFO" : "UPGRADE");

                if (!skipBlock) return null;
            }

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
