"use client";
import { Building2 } from "lucide-react";
import { Card, Select, Textarea } from "@/components/ui";
import { PAYMENT_TYPE_OPTIONS } from "../constants";

export const BasicDetails = ({
    formData,
    handleInputChange,
    suppliers,
    suppliersLoading,
    bills,
    billsLoading,
    errors,
}) => {
    const supplierOptions = [
        { value: "", label: suppliersLoading ? "Loading..." : "Select Supplier" },
        ...suppliers.map((s) => ({ value: s.id || s._id, label: s.name || s.supplierName })),
    ];

    const billOptions = [
        { value: "", label: "Select Bill" },
        ...bills.map((b) => ({ value: b._id, label: `₹${b.dueAmount} - ${b.supplier?.name}` })),
    ];

    return (
        <Card className="mb-6 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" /> Basic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Select
                        label="Payment Type *"
                        size="sm"
                        value={formData.paymentType}
                        onChange={(v) => handleInputChange("paymentType", v)}
                        options={PAYMENT_TYPE_OPTIONS}
                        error={!!errors.paymentType}
                        errorMessage={errors.paymentType}
                    />
                </div>
                <div>
                    <Select
                        label="Supplier *"
                        size="sm"
                        value={formData.supplierId}
                        onChange={(v) => handleInputChange("supplierId", v)}
                        options={supplierOptions}
                        error={!!errors.supplierId}
                        errorMessage={errors.supplierId}
                        searchable
                    />
                </div>
                {formData.paymentType === "BILL_PAYMENT" && (
                    <div>
                        <Select
                            label="Select Bill *"
                            size="sm"
                            value={formData.billId}
                            onChange={(v) => handleInputChange("billId", v)}
                            options={billOptions}
                            error={!!errors.billId}
                            errorMessage={errors.billId}
                            disabled={billsLoading}
                        />
                    </div>
                )}
            </div>
            <div className="mt-4">
                <Textarea
                    label="Notes"
                    value={formData.notes}
                    onChange={(val) => handleInputChange("notes", val)}
                    rows={3}
                    placeholder="Additional notes..."
                />
            </div>
        </Card>
    );
};
