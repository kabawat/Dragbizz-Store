"use client";
import { Building2, FileText, Smartphone, Trash2 } from "lucide-react";
import { Card, Select, Input } from "@/components/ui";
import { METHOD_OPTIONS } from "../constants";

export const PaymentMethodItem = ({ index, method, errors, onUpdate, onRemove, showRemove, t }) => {
    const handleChange = (field, value) => onUpdate(index, field, value);

    return (
        <Card className="rounded-lg p-4 bg-[rgb(var(--color-bg-secondary))]">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-[rgb(var(--color-text-primary))]">
                    {t("payments.paymentMethodNumber", { number: index + 1 })}
                </h4>
                {showRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="p-2 cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                        title={t("payments.removePaymentMethod")}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                    label="Amount *"
                    type="number"
                    size="sm"
                    value={method.amount}
                    onChange={(val) => handleChange("amount", val)}
                    placeholder="0.00"
                    error={!!errors[`paymentMethod_${index}_amount`]}
                    errorMessage={errors[`paymentMethod_${index}_amount`]}
                />

                <div className="relative z-30">
                    <Select
                        label="Payment Method *"
                        size="sm"
                        value={method.method}
                        onChange={(val) => handleChange("method", val)}
                        options={METHOD_OPTIONS}
                        error={!!errors[`paymentMethod_${index}_method`]}
                        errorMessage={errors[`paymentMethod_${index}_method`]}
                    />
                </div>

                <Input
                    label="Reference"
                    size="sm"
                    value={method.reference}
                    onChange={(val) => handleChange("reference", val)}
                    placeholder="Payment reference"
                />
            </div>

            {method.method === "bank_transfer" && (
                <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]">
                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                        <Building2 className="w-5 h-5 mr-2" />
                        Bank Transfer Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Bank Name *" size="sm" value={method.bankName} onChange={(val) => handleChange("bankName", val)} placeholder="Enter bank name" error={!!errors[`paymentMethod_${index}_bankName`]} errorMessage={errors[`paymentMethod_${index}_bankName`]} />
                        <Input label="IFSC Code *" size="sm" value={method.ifscCode} onChange={(val) => handleChange("ifscCode", val)} placeholder="Enter IFSC code" error={!!errors[`paymentMethod_${index}_ifscCode`]} errorMessage={errors[`paymentMethod_${index}_ifscCode`]} />
                        <Input label="Account Number *" size="sm" value={method.accountNumber} onChange={(val) => handleChange("accountNumber", val)} placeholder="Enter account number" error={!!errors[`paymentMethod_${index}_accountNumber`]} errorMessage={errors[`paymentMethod_${index}_accountNumber`]} />
                        <Input label="Account Holder Name *" size="sm" value={method.holderName} onChange={(val) => handleChange("holderName", val)} placeholder="Enter account holder name" error={!!errors[`paymentMethod_${index}_holderName`]} errorMessage={errors[`paymentMethod_${index}_holderName`]} />
                    </div>
                </div>
            )}

            {(method.method === "upi" || method.method === "UPI") && (
                <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]">
                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                        <Smartphone className="w-5 h-5 mr-2" />
                        UPI Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="UPI ID *" size="sm" value={method.upiId} onChange={(val) => handleChange("upiId", val)} placeholder="Enter UPI ID" error={!!errors[`paymentMethod_${index}_upiId`]} errorMessage={errors[`paymentMethod_${index}_upiId`]} />
                        <Input label="Transaction ID *" size="sm" value={method.transactionId} onChange={(val) => handleChange("transactionId", val)} placeholder="Enter transaction ID" error={!!errors[`paymentMethod_${index}_transactionId`]} errorMessage={errors[`paymentMethod_${index}_transactionId`]} />
                    </div>
                </div>
            )}

            {method.method === "cheque" && (
                <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]">
                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Cheque Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Cheque Number *" size="sm" value={method.chequeNumber} onChange={(val) => handleChange("chequeNumber", val)} placeholder="Enter cheque number" error={!!errors[`paymentMethod_${index}_chequeNumber`]} errorMessage={errors[`paymentMethod_${index}_chequeNumber`]} />
                        <Input label="Cheque Date *" type="date" size="sm" value={method.chequeDate} onChange={(val) => handleChange("chequeDate", val)} error={!!errors[`paymentMethod_${index}_chequeDate`]} errorMessage={errors[`paymentMethod_${index}_chequeDate`]} />
                        <Input label="Bank Name *" size="sm" value={method.chequeBankName} onChange={(val) => handleChange("chequeBankName", val)} placeholder="Enter bank name" error={!!errors[`paymentMethod_${index}_chequeBankName`]} errorMessage={errors[`paymentMethod_${index}_chequeBankName`]} />
                        <Input label="Branch Name *" size="sm" value={method.chequeBranchName} onChange={(val) => handleChange("chequeBranchName", val)} placeholder="Enter branch name" error={!!errors[`paymentMethod_${index}_chequeBranchName`]} errorMessage={errors[`paymentMethod_${index}_chequeBranchName`]} />
                    </div>
                </div>
            )}
        </Card>
    );
};
