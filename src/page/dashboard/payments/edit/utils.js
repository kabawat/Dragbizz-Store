import { INITIAL_PAYMENT_METHOD } from "./constants";

export const transformApiMethodsToForm = (methods = []) => {
    if (!methods.length) return [{ ...INITIAL_PAYMENT_METHOD, amount: 0 }];

    const methodMap = {
        CASH: "cash",
        UPI: "upi",
        BANK_TRANSFER: "bank_transfer",
        CHEQUE: "cheque",
        CREDIT: "credit",
    };

    return methods.map((pm) => {
        const method = {
            ...INITIAL_PAYMENT_METHOD,
            amount: pm.amount || 0,
            method: methodMap[pm.method] || pm.method?.toLowerCase() || "cash",
            reference: pm.reference || "",
        };

        if (pm.bankDetails) {
            method.bankName = pm.bankDetails.bankName || "";
            method.ifscCode = pm.bankDetails.ifscCode || "";
            method.accountNumber = pm.bankDetails.accountNumber || "";
            method.holderName = pm.bankDetails.holderName || "";
        }

        if (pm.upiDetails) {
            method.upiId = pm.upiDetails.upiId || "";
            method.transactionId = pm.upiDetails.transactionId || "";
        }

        if (pm.chequeDetails) {
            method.chequeNumber = pm.chequeDetails.chequeNumber || "";
            method.chequeDate = pm.chequeDetails.chequeDate || "";
            method.chequeBankName = pm.chequeDetails.bankName || "";
            method.chequeBranchName = pm.chequeDetails.branchName || "";
        }

        return method;
    });
};
