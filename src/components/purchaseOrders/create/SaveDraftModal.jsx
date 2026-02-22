"use client";
import React from "react";
import { Save } from "lucide-react";
import { Button, Modal } from "@/components/ui";

const SaveDraftModal = ({ t, isOpen, onClose, onConfirm }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                    {t("purchaseOrders.saveAsDraft")}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                    {t("purchaseOrders.saveAsDraftDescription")}
                </p>
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose}>
                        {t("common.cancel")}
                    </Button>
                    <Button onClick={onConfirm} leftIcon={Save}>
                        {t("purchaseOrders.saveDraft")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SaveDraftModal;
