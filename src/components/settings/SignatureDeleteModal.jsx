"use client";
import { SignatureDeleteModalView } from "@dragorbit/features/settings";

import Image from "next/image";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";

const SignatureDeleteModal = ({
  isOpen,
  signatureToDelete,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const themeVariant = useAppSelector((state) => state.theme.variant);

  return (
    <SignatureDeleteModalView
      model={{
        isOpen,
        isDeleting,
        onClose,
        t,
        signatureToDelete,
        Image,
        themeVariant,
        onConfirm,
      }}
    />
  );
};

export default SignatureDeleteModal;
