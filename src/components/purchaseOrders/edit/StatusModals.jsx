"use client";
import React from "react";
import { CheckCircle, Save } from "lucide-react";
import { Button, Modal } from "@/components/ui";

const StatusModals = ({
  t,
  showSaveModal,
  setShowSaveModal,
  showSuccessModal,
  setShowSuccessModal,
  handleSubmit,
  updatedPONumber,
  poId,
  router,
}) => {
  return (
    <>
      <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
            {t("common.save")}
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {t("purchaseOrders.saveAsDraftDescription")}
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                setShowSaveModal(false);
                handleSubmit();
              }}
              leftIcon={Save}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t("purchaseOrders.deleteSuccess")} // Note: Keeping original key as per request to keep related functionality
      >
        <div className="p-6 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(var(--color-success), 0.1)" }}
          >
            <CheckCircle
              className="w-8 h-8"
              style={{ color: "rgb(var(--color-success))" }}
            />
          </div>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {updatedPONumber || t("purchaseOrders.title")} {t("purchaseOrders.added")}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/dashboard/purchase-orders");
              }}
            >
              {t("purchaseOrders.backToPurchaseOrders")}
            </Button>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                router.push(`/dashboard/purchase-orders/${poId}`);
              }}
            >
              {t("purchaseOrders.purchaseOrderDetails")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StatusModals;
