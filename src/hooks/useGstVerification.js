import { useState } from "react";
import storeService from "@/service/retailer/store.service";
import { useGlobalToast } from "@/contexts/ToastContext";

// GST verification logic across the application.
export const useGstVerification = (setForm) => {
    const [isVerifyingGst, setIsVerifyingGst] = useState(false);
    const [isGstVerified, setIsGstVerified] = useState(false);
    const { showSuccess, showError } = useGlobalToast();

    const handleVerifyGst = async (gstNumber) => {
        if (!gstNumber || gstNumber.length < 15) return;

        setIsVerifyingGst(true);
        try {
            const result = await storeService.verifyGst(gstNumber);
            if (result?.success && result.data) {
                const gstData = result.data;

                // Format street name correctly
                const street = [
                    gstData.address?.buildingName,
                    gstData.address?.floor,
                    gstData.address?.street
                ].filter(Boolean).join(", ");

                // Auto-fill form fields
                setForm((prev) => ({
                    ...prev,
                    name: gstData.legalName || prev.name,
                    pan: gstData.panNumber || prev.pan,
                    address: {
                        ...prev.address,
                        street: street || prev.address.street || "",
                        // If the form uses line1 instead of street
                        ...(prev.address.hasOwnProperty("line1") && { line1: street || prev.address.line1 }),
                        city: gstData.address?.location || gstData.address?.city || prev.address.city || "",
                        pincode: gstData.address?.pincode || prev.address.pincode || "",
                        state: gstData.state || prev.address.state || "",
                        district: gstData.address?.district || prev.address.district || "",
                    },
                }));

                setIsGstVerified(true);
                showSuccess("GST Verified! Details auto-filled.");
                return true;
            } else {
                showError(result?.error?.message || "Invalid GST number");
                return false;
            }
        } catch (error) {
            showError("Failed to verify GST. Please try again.");
            return false;
        } finally {
            setIsVerifyingGst(false);
        }
    };

    const resetGstVerification = () => {
        setIsGstVerified(false);
    };

    return {
        isVerifyingGst,
        isGstVerified,
        setIsGstVerified,
        handleVerifyGst,
        resetGstVerification,
    };
};
