"use client";
import { SignatureSettingsView } from "@dragorbit/features/settings";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

import { SignatureDrawer } from "@/components/common";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchSignatures,
  addSignature,
  removeSignature,
} from "@/store/slices/signaturesSlice";
import { signatureService, utilityService } from "@/service";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";

import SignatureDeleteModal from "./SignatureDeleteModal";

const SignatureSettings = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showToast } = useGlobalToast();

  const { items: signatures, loading: signaturesLoading } = useAppSelector(
    (state) => state.signatures,
  );
  const { agency: profileAgency, selectedStore } = useAppSelector(
    (state) => state.profile,
  );
  const themeVariant = useAppSelector((state) => state.theme.variant);

  const [showDrawer, setShowDrawer] = useState(false);
  const [signatureToDelete, setSignatureToDelete] = useState(null);
  const { execute: executeDelete, loading: isDeleting } = useApiResponse();

  // Derive agencyId
  const agencyId =
    profileAgency?.agencyId ||
    profileAgency?._id ||
    selectedStore?.agency ||
    selectedStore?.agencyId;

  const loadSignatures = useCallback(() => {
    if (agencyId) {
      dispatch(fetchSignatures({ agencyId, lightweight: true }));
    }
  }, [agencyId, dispatch]);

  useEffect(() => {
    loadSignatures();
  }, [loadSignatures]);

  const handleCreateSuccess = (signatureData) => {
    dispatch(addSignature(signatureData));
    setShowDrawer(false);
    showToast("Signature saved successfully!", "success");
  };

  const confirmDelete = async () => {
    if (!signatureToDelete) return;
    const id = signatureToDelete.id || signatureToDelete._id;

    const result = await executeDelete(signatureService.deleteSignature(id), {
      showToast: false,
    });

    if (result?.success) {
      // If the signature was stored in S3, delete the file as well
      if (
        signatureToDelete.method === "upload" ||
        signatureToDelete.method === "draw"
      ) {
        utilityService.deleteFile(signatureToDelete.content).catch((err) => {
          console.error("Failed to delete signature image from S3", err);
        });
      }

      dispatch(removeSignature(id));
      showToast(
        t("settings.signatureDeleted") || "Signature deleted successfully",
        "success",
      );
      setSignatureToDelete(null);
    } else {
      showToast(result?.message || "Failed to delete signature", "error");
    }
  };

  return (
    <SignatureSettingsView
      model={{
        t,
        setShowDrawer,
        signaturesLoading,
        signatures,
        setSignatureToDelete,
        Image,
        themeVariant,
        SignatureDrawer,
        showDrawer,
        handleCreateSuccess,
        agencyId,
        SignatureDeleteModal,
        signatureToDelete,
        isDeleting,
        confirmDelete,
      }}
    />
  );
};

export default SignatureSettings;
