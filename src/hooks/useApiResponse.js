"use client";
import { useCallback, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";
import { useSubscription } from "@/contexts/SubscriptionContext";

export const useApiResponse = () => {
    const { showError, showSuccess: toastSuccess } = useGlobalToast();
    const { showUpgradeModal } = useSubscription();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleApiSuccess = useCallback((response, options = {}) => {
        const result = handleSuccess(response);
        const { message: customMsg = null, showToast = true } = options;

        setData(result.data);

        if (showToast) {
            toastSuccess(customMsg || result.message);
        }

        return result;
    }, [toastSuccess]);

    const handleApiError = useCallback((error, options = {}) => {
        const result = handleError(error);
        const { showToast = true } = options;

        setData(null);

        // Intercept Subscription / Quota limits globally
        if (result.code === "SUBSCRIPTION_REQUIRED" || result.code === "FEATURE_NOT_AVAILABLE") {
            showUpgradeModal(result.message, "UPGRADE");
            return result;
        }

        if (result.code === "QUOTA_EXCEEDED") {
            showUpgradeModal(result.message, "QUOTA");
            return result;
        }

        if (showToast) {
            showError(result.message);
        }

        return result;
    }, [showError, showUpgradeModal]);

    const execute = useCallback(async (apiPromise, options = {}) => {
        try {
            setLoading(true);
            const response = await apiPromise;
            return handleApiSuccess(response, options);
        } catch (error) {
            return handleApiError(error, options);
        } finally {
            setLoading(false);
        }
    }, [handleApiSuccess, handleApiError]);

    const clearAll = useCallback(() => {
        setData(null);
        setLoading(false);
        setFieldErrors({});
    }, []);

    return {
        execute,
        loading,
        data,
        clearAll,
        fieldErrors,
        setFieldErrors,
    };
};

export default useApiResponse;
