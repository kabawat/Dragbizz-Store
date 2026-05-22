export const INITIAL_PAYMENT_METHOD = {
    amount: "",
    method: "cash",
    reference: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    holderName: "",
    upiId: "",
    transactionId: "",
    chequeNumber: "",
    chequeDate: "",
    chequeBankName: "",
    chequeBranchName: "",
};

export const PAYMENT_TYPE_OPTIONS = [
    { value: "BILL_PAYMENT", label: "Bill Payment" },
    { value: "ADVANCE_PAYMENT", label: "Advance Payment" },
    { value: "ADJUSTMENT", label: "Adjustment" },
    { value: "REFUND", label: "Refund" },
];

export const METHOD_OPTIONS = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cheque", label: "Cheque" },
    { value: "credit", label: "Credit" },
];
