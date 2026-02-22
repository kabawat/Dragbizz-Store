import React from "react";
import { CheckCircle, Clock } from "lucide-react";
import { Modal } from "@/components/ui";

const ShipmentStatusModal = ({ isOpen, onClose, onConfirm, status = "SHIPPED", loading = false }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assign Payment Terms"
            size="sm"
        >
            <div className="space-y-4">
                <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed">
                    Choose the payment status for this shipment. This will be reflected on the generated invoice.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => !loading && onConfirm(status, { paymentStatus: 'PAID', message: 'Order shipped and marked as PAID' })}
                        disabled={loading}
                        className={`w-full p-4 text-left rounded-xl border border-[rgb(var(--color-border-primary))] transition-all group ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/5 cursor-pointer'}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-primary))]">
                                {loading ? "Processing..." : "Ship (Paid)"}
                            </span>
                        </div>
                        <span className="text-xs text-[rgb(var(--color-text-tertiary))]">Payment has already been received.</span>
                    </button>

                    <button
                        onClick={() => !loading && onConfirm(status, { paymentStatus: 'UNPAID', message: 'Order shipped and marked as UNPAID' })}
                        disabled={loading}
                        className={`w-full p-4 text-left rounded-xl border border-[rgb(var(--color-border-primary))] transition-all group ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/5 cursor-pointer'}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-primary))]">
                                {loading ? "Processing..." : "Ship (Unpaid)"}
                            </span>
                        </div>
                        <span className="text-xs text-[rgb(var(--color-text-tertiary))]">Payment collectable on or after delivery.</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ShipmentStatusModal;
