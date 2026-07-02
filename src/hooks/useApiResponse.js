"use client";
import { useCallback, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";
import { useSubscription } from "@/contexts/SubscriptionContext";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";
import {
    getConfigStoreParam,
    shouldSuppressStoreIdToast,
} from "@/utils/bootstrapStoreGuard";
import { isValidStoreId } from "@/utils/store.util";

const STORE_ID_BOOTSTRAP_ERROR = /invalid or missing store id/i;

export const useApiResponse = () => {
    const { showError, showSuccess: toastSuccess } = useGlobalToast();
    const { showUpgradeModal } = useSubscription();
    const { ready: storeReady, isInitialized, isLoading } = useSelectedStoreId();
    const storeBootstrapReady = storeReady;

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
        setFieldErrors(result.fields || {});

        // Intercept Subscription / Quota limits globally
        if (result.code === "SUBSCRIPTION_REQUIRED" || result.code === "FEATURE_NOT_AVAILABLE") {
            showUpgradeModal(result.message, "UPGRADE");
            return result;
        }

        if (result.code === "QUOTA_EXCEEDED") {
            showUpgradeModal(result.message, "QUOTA");
            return result;
        }

        const requestStore = getConfigStoreParam(error?.config);
        const missingStoreOnRequest =
            requestStore == null ||
            requestStore === "" ||
            !isValidStoreId(String(requestStore));

        const isStoreIdError = STORE_ID_BOOTSTRAP_ERROR.test(result.message || "");
        const shouldSuppressBootstrapStoreError =
            isStoreIdError &&
            (shouldSuppressStoreIdToast({ storeBootstrapReady }) ||
                !storeReady ||
                missingStoreOnRequest ||
                !isInitialized ||
                isLoading);

        if (showToast && !shouldSuppressBootstrapStoreError) {
            showError(result.message);
        }

        return result;
    }, [showError, showUpgradeModal, storeReady, storeBootstrapReady, isInitialized, isLoading]);

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
