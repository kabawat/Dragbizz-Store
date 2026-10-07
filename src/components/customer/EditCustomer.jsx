"use client";
import { Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CustomerForm } from "@/components/customer";
import { Button } from "@/components/ui";
import { useGstVerification } from "@/hooks/form/useGstVerification";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";
import { customerService } from "@/service";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import useApiResponse from "@/hooks/useApiResponse";
import { updateCustomer } from "@/store/slices/customers/customerSlice";
import INDIAN_STATES from "@/constants/indianStates";
import { validatePhoneOrEmailContact } from "@/utils/phone.util";

const EditCustomer = ({
    customerId,
    onSuccess,
    onCancel,
    showCancelButton = true,
    mode = "drawer", // 'page' or 'drawer'
}) => {
    const { t } = useTranslation();
    const { showError } = useGlobalToast();
    const dispatch = useAppDispatch();
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    const {
        execute,
        fieldErrors,
        setFieldErrors,
        clearAll,
        loading
    } = useApiResponse();

    const [fetching, setFetching] = useState(true);

    // GST Verification Hook
    const gstVerification = useGstVerification({
        onNameAutoFill: (name) =>
            setFormData((prev) => ({
                ...prev,
                companyDetails: { ...prev.companyDetails, companyName: name },
            })),
        ongstDetailChange: (id) =>
            setFormData((prev) => ({
                ...prev,
                companyDetails: { ...prev.companyDetails, gstDetail: id },
            })),
    });

    const [formData, setFormData] = useState({
        store: storeId || "",
        name: "",
        phone: "",
        email: "",
        note: "",
        address: "",
        companyDetails: { gstin: "", companyName: "", gstDetail: "" },
        addresses: null,
    });

    const lastFetchedId = useRef(null);

    // Fetch existing customer data
    useEffect(() => {
        const fetchCustomerData = async () => {
            if (!customerId || !storeId) return;
            if (lastFetchedId.current === customerId) return;

            lastFetchedId.current = customerId;
            setFieldErrors({});

            const raw = await execute(
                customerService.getCustomers({
                    id: customerId,
                    store: storeId,
                }),
                { showToast: false }
            );
            if (raw?.success && raw?.data) {
                const d = raw.data;
                const resolveAddress = (addr) => {
                    if (!addr) return null;
                    let resolvedStateCode = addr.stateCode;
                    if (!resolvedStateCode && addr.state) {
                        const found = INDIAN_STATES.find(s => s.label.toLowerCase() === addr.state.toLowerCase());
                        if (found) resolvedStateCode = found.value;
                    }
                    return { ...addr, stateCode: resolvedStateCode };
                };

                setFormData({
                    store: storeId,
                    name: d.name || "",
                    phone: d.phone || "",
                    email: d.email || "",
                    note: d.note || "",
                    address: d.address || "",
                    companyDetails: {
                        gstin: d.companyDetails?.gstin || "",
                        companyName: d.companyDetails?.companyName || "",
                        gstDetail: d.companyDetails?.gstDetail || "",
                    },
                    addresses: d.addresses
                        ? {
                            billing: resolveAddress(d.addresses.billing),
                            shipping: resolveAddress(d.addresses.shipping),
                        }
                        : null,
                });
            } else {
                showError(raw?.message || t("customers.errorLoading"));
            }

            setFetching(false);
        };
        fetchCustomerData();
    }, [customerId, storeId, t, showError, execute, setFieldErrors]);

    // Handle form field changes + per-field error clearing
    const handleFormDataChange = (fieldName, value) => {
        if (fieldName === "clearError") {
            setFieldErrors((prev) => {
                const n = { ...prev };
                delete n[value];
                return n;
            });
            return;
        }
        if (typeof fieldName !== "string") return;
        setFieldErrors((prev) => {
            const n = { ...prev };
            if (n[fieldName]) delete n[fieldName];
            if (fieldName === "companyDetails")
                Object.keys(n).forEach((k) => {
                    if (k.startsWith("companyDetails.")) delete n[k];
                });
            if (fieldName === "addresses")
                Object.keys(n).forEach((k) => {
                    if (k.startsWith("addresses.")) delete n[k];
                });
            return n;
        });
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
    };

    // Handle save & update
    const handleSaveAndUpdate = async () => {
        // Frontend validation
        const errors = {};
        if (!formData.name?.trim()) {
            errors.name = t("validation.required", {
                field: t("customers.customerName"),
            });
        }
        Object.assign(errors, validatePhoneOrEmailContact({
            phone: formData.phone,
            email: formData.email,
            t,
        }));

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        clearAll();

        const payload = { ...formData };
        const gstin = payload.companyDetails?.gstin?.trim() || "";
        const companyName = payload.companyDetails?.companyName?.trim() || "";
        if (!gstin && !companyName) {
            delete payload.companyDetails;
        }

        const result = await execute(
            customerService.updateCustomer(customerId, payload, storeId),
            { message: t("customers.updateSuccess") || "Customer updated successfully" }
        );

        if (result?.success && result?.data) {
            const updatedCustomer = result.data.customer || result.data;
            dispatch(updateCustomer(updatedCustomer));
            if (onSuccess) onSuccess(updatedCustomer);
        }
    };

    // Loading state — skeleton for drawer, centered spinner for page
    if (fetching) {
        if (mode === "page") {
            return (
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[rgb(var(--color-text-secondary))]">
                            {t("common.loading")}
                        </p>
                    </div>
                </div>
            );
        }
        // Drawer loading skeleton
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4 sm:space-y-6 p-1">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-4 sm:p-6 animate-pulse"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-[rgb(var(--color-bg-secondary))] rounded-lg" />
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-[rgb(var(--color-bg-secondary))] rounded" />
                                    <div className="h-3 w-48 bg-[rgb(var(--color-bg-secondary))] rounded" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[1, 2].map((j) => (
                                    <div key={j} className="space-y-2">
                                        <div className="h-3 w-20 bg-[rgb(var(--color-bg-secondary))] rounded" />
                                        <div className="h-9 bg-[rgb(var(--color-bg-secondary))] rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col ${mode === "drawer" ? "h-full" : "min-h-full"}`}
        >
            {/* Form Area */}
            <div className={`${mode === "drawer"
                ? "flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0"
                : "space-y-4 sm:space-y-6"
                }`}
            >
                <CustomerForm
                    formData={formData}
                    onChange={handleFormDataChange}
                    fieldErrors={fieldErrors}
                    gstVerification={gstVerification}
                />
            </div>

            {/* Action Buttons */}
            {(mode === "drawer" || showCancelButton) && (
                <div
                    className={`flex-shrink-0 ${mode === "drawer"
                        ? "bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6"
                        : "mt-6 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4"
                        } flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3`}
                >
                    <Button
                        variant="success"
                        onClick={handleSaveAndUpdate}
                        disabled={loading}
                        loading={loading}
                        leftIcon={Save}
                        className="w-full sm:w-auto"
                        size="sm"
                    >
                        {t("customers.updateCustomer") || "Update Customer"}
                    </Button>
                    {showCancelButton && onCancel && (
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                            className="w-full sm:w-auto"
                            size="sm"
                        >
                            {t("common.cancel")}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EditCustomer;
