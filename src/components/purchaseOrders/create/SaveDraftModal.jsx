"use client";
import { CreateSaveDraftModalPresentation } from "@dragorbit/features/purchase-orders";

const SaveDraftModal = ({ t, isOpen, onClose, onConfirm }) => {
  return (
    <CreateSaveDraftModalPresentation
      model={{ isOpen, onClose, t, onConfirm }}
    />
  );
};

export default SaveDraftModal;
