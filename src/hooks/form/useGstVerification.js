"use client";
import { useEffect, useRef } from "react";
import storeService from "@/service/retailer/store.service";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";

function applyGstToForm(setForm, gstData) {
  const street = [
    gstData.address?.buildingName,
    gstData.address?.floor,
    gstData.address?.street,
  ]
    .filter(Boolean)
    .join(", ");

  setForm((prev) => ({
    ...prev,
    name: gstData.legalName || prev.name,
    pan: gstData.panNumber || prev.pan,
    gstDetail: gstData._id,
    address: {
      ...prev.address,
      street: street || prev.address?.street || "",
      ...(Object.hasOwn(prev.address ?? {}, "line1") && {
        line1: street || prev.address.line1,
      }),
      city: gstData.address?.location || prev.address?.city || "",
      pincode: gstData.address?.pincode || prev.address?.pincode || "",
      state: gstData.state || prev.address?.state || "",
      district: gstData.address?.district || prev.address?.district || "",
    },
  }));
}

export const useGstVerification = (config) => {
  const { showError } = useGlobalToast();
  const { execute, loading, data, clearAll } = useApiResponse();

  const setForm = typeof config === "function" ? config : null;
  const onNameAutoFill =
    typeof config === "function" ? null : (config?.onNameAutoFill ?? null);
  const ongstDetailChange =
    typeof config === "function" ? null : (config?.ongstDetailChange ?? null);

  const callbacksRef = useRef({ setForm, onNameAutoFill, ongstDetailChange });
  callbacksRef.current = { setForm, onNameAutoFill, ongstDetailChange };

  const isVerifyingRef = useRef(false);

  useEffect(() => {
    if (!data) return;

    const callbacks = callbacksRef.current;

    if (callbacks.setForm) {
      applyGstToForm(callbacks.setForm, data);
      return;
    }

    callbacks.onNameAutoFill?.(data.legalName || data.tradeName);
    callbacks.ongstDetailChange?.(data._id);
  }, [data]);

  const handleVerifyGst = async (gstNumber) => {
    const normalizedGst = String(gstNumber || "").trim().toUpperCase();

    if (normalizedGst.length < 15) {
      showError("Please enter a valid 15-digit GST number");
      return;
    }

    if (isVerifyingRef.current) return;

    isVerifyingRef.current = true;
    try {
      clearAll();
      await execute(storeService.verifyGst(normalizedGst), {
        message: "GST Verified Successfully!",
      });
    } finally {
      isVerifyingRef.current = false;
    }
  };

  return {
    isVerifyingGst: loading,
    isGstVerified: Boolean(data),
    handleVerifyGst,
    resetGstVerification: clearAll,
  };
};
