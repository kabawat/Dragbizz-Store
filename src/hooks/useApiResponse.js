"use client";
import { useCallback, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";
import { useSubscription } from "@/contexts/SubscriptionContext";

export const useApiResponse = () => {
    const { showError, showSuccess: toastSuccess } = useGlobalToast();
    const [data, setData] = useState(null);
    const [pagination, setPagination] = useState({ hasNextPage: false, nextCursor: null });
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Handle success response
    const handleApiSuccess = useCallback((response, options = {}) => {
        const result = handleSuccess(response);
        const { message: customMsg = null, showToast = true } = options;

        setData(result.data);
        setPagination({
            hasNextPage: result.pagination?.hasNextPage || result.pagination?.hasNext || false,
            nextCursor: result.pagination?.nextCursor || null
        });
        setMessage(customMsg || result.message);
        setFieldErrors({});

        if (showToast) {
            toastSuccess(customMsg || result.message);
        }

        return result;
    }, [toastSuccess]);

    const { showUpgradeModal } = useSubscription();

    // Handle error response
    const handleApiError = useCallback((error, options = {}) => {
        const result = handleError(error);
        const { showToast = true } = options;

        setData(null);
        setPagination({ hasNextPage: false, nextCursor: null });
        setMessage(result.message);
        setFieldErrors(result.fields || {});

        // Intercept Subscription / Quota limits globally
        if (result.code === "SUBSCRIPTION_REQUIRED" || result.code === "FEATURE_NOT_AVAILABLE") {
            showUpgradeModal(result.message, "UPGRADE");
            return result; // Skip generic toast
        }

        if (result.code === "QUOTA_EXCEEDED") {
            showUpgradeModal(result.message, "QUOTA");
            return result; // Skip generic toast
        }

        if (showToast) {
            showError(result.message);
        }

        return result;
    }, [showError]);

    // Unified executor to handle promise, loading, and automatic success/error handling
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

    const clearAll = () => {
        setData(null);
        setPagination({ hasNextPage: false, nextCursor: null });
        setMessage("");
        setFieldErrors({});
        setLoading(false);
    };

    return {
        execute,
        handleApiSuccess,
        handleApiError,
        data,
        setData,
        pagination,
        message,
        fieldErrors,
        setFieldErrors,
        loading,
        setLoading,
        clearAll
    };
};

export default useApiResponse;
