"use client";
import moment from "moment";

const PaymentDetailsTemplate = ({ paymentData, selectedStore }) => {
  if (!paymentData) return null;

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      CASH: "Cash",
      UPI: "UPI",
      BANK_TRANSFER: "Bank Transfer",
      CHEQUE: "Cheque",
      CREDIT: "Credit",
    };
    return methodMap[method] || method || "N/A";
  };

  const getPaymentTypeLabel = (type) => {
    const typeMap = {
      BILL_PAYMENT: "Bill Payment",
      ADVANCE: "Advance Payment",
      OTHER: "Other",
    };
    return typeMap[type] || type || "N/A";
  };

  return (
    <div className="max-w-[850px] mx-auto my-[30px] p-[30px] bg-white font-sans text-[13px] leading-[1.6] text-[#333333] flex flex-col min-h-[calc(100vh-60px)]">
      <div className="flex justify-between items-center py-[25px] mb-[30px] bg-gradient-to-r from-[#f0f8ff] to-white border-b-[3px] border-[#6699ff]">
        <div className="px-[15px]">
          <div className="text-[24px] font-light text-[#1e3a8a] tracking-[1px] uppercase">
            {selectedStore?.storeName || selectedStore?.name || "STORE NAME"}
          </div>
          {selectedStore?.address && (
            <p className="text-[12px] text-[#555555] mt-[5px] leading-[1.4]">
              {selectedStore.address}
            </p>
          )}
          {(selectedStore?.phone || selectedStore?.email) && (
            <p className="text-[12px] text-[#555555] mt-[5px] leading-[1.4]">
              {selectedStore?.phone && `Tel: ${selectedStore.phone}`}
              {selectedStore?.phone && selectedStore?.email && " | "}
              {selectedStore?.email && `Email: ${selectedStore.email}`}
            </p>
          )}
        </div>
        <div className="text-right px-[15px]">
          <h1 className="text-[30px] font-bold text-[#3b82f6] m-0 tracking-[3px] uppercase">
            PAYMENT DETAILS
          </h1>
          <p className="text-[14px] text-[#666666] my-[4px]">
            Generated: {moment().format("DD/MM/YYYY HH:mm:ss")}
          </p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="mb-[30px]">
        <h3 className="text-[18px] font-semibold text-[#1e3a8a] mb-[15px] uppercase border-b-2 border-[#93c5fd] pb-[15px]">
          Payment Summary
        </h3>
        <table className="w-full border-collapse mb-[20px]">
          <tbody>
            {paymentData.paymentNumber && (
              <tr>
                <td className="p-[10px_15px] border-b border-[#f0f0f0] text-[13px] font-medium text-[#333333] w-[40%]">
                  Payment Number
                </td>
                <td className="p-[10px_15px] border-b border-[#f0f0f0] text-[13px] font-semibold text-[#1e3a8a] font-mono">
                  {paymentData.paymentNumber}
                </td>
              </tr>
            )}
            <tr>
              <td className="p-[10px_15px] border-b border-[#f0f0f0] text-[13px] font-medium text-[#333333]">
                Total Amount
              </td>
              <td className="p-[10px_15px] border-b border-[#f0f0f0] text-[13px] text-right font-semibold text-[#10b981]">
                {formatCurrency(paymentData.totalAmount)}
              </td>
            </tr>
            <tr>
              <td className="p-[10px_15px] border-b border-[#f0f0f0] text-[13px] font-medium text-[#333333]">
                Payment Type
              </td>
              <td className="p-[10px_15px] border-b border-[#f0f0f0] text-[13px] font-semibold text-[#1e3a8a]">
                {getPaymentTypeLabel(paymentData.paymentType)}
              </td>
            </tr>
            {paymentData.paymentDate && (
              <tr>
                <td className="p-[10px_15px] border-b border-[#f0f0f0] text-[13px] font-medium text-[#333333]">
                  Payment Date
                </td>
                <td className="p-[10px_15px] border-b border-[#f0f0f0] text-[13px] font-semibold text-[#1e3a8a]">
                  {moment(paymentData.paymentDate).format("DD MMMM YYYY")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Supplier Information */}
      {paymentData.supplier && (
        <div className="mb-[30px]">
          <h3 className="text-[18px] font-semibold text-[#1e3a8a] mb-[15px] uppercase border-b-2 border-[#93c5fd] pb-[15px]">
            Supplier Information
          </h3>
          <div className="px-[15px] text-[13px] leading-[1.8] grid grid-cols-2 gap-[8px_30px]">
            <div className="text-[#444444]">
              <span className="font-medium text-[#333333]">
                Supplier Name
              </span>{" "}
              -{" "}
              <span className="font-semibold">
                {paymentData.supplier.name || "N/A"}
              </span>
            </div>
            {paymentData.supplier.phone && (
              <div className="text-[#444444]">
                <span className="font-medium text-[#333333]">
                  Phone Number
                </span>{" "}
                - <span>{paymentData.supplier.phone}</span>
              </div>
            )}
            {paymentData.supplier.email && (
              <div className="text-[#444444] break-all">
                <span className="font-medium text-[#333333]">
                  Email Address
                </span>{" "}
                - <span>{paymentData.supplier.email}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {paymentData.paymentMethods &&
        paymentData.paymentMethods.length > 0 && (
          <div className="mb-[30px]">
            <h3 className="text-[18px] font-semibold text-[#1e3a8a] mb-[15px] uppercase border-b-2 border-[#93c5fd] pb-[15px]">
              Payment Methods
            </h3>
            <table className="w-full border-collapse mb-[20px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b-2 border-[#e2e8f0]">
                  <th className="p-[12px_15px] text-left text-[13px] font-semibold text-[#1e3a8a] uppercase">
                    Method
                  </th>
                  <th className="p-[12px_15px] text-right text-[13px] font-semibold text-[#1e3a8a] uppercase">
                    Amount
                  </th>
                  {paymentData.paymentMethods.some((pm) => pm.reference) && (
                    <th className="p-[12px_15px] text-left text-[13px] font-semibold text-[#1e3a8a] uppercase">
                      Reference
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paymentData.paymentMethods.map((method, index) => (
                  <tr key={index}>
                    <td className="p-[10px_15px] border-b border-[#f0f0f0] text-[13px] font-medium text-[#333333]">
                      {getPaymentMethodLabel(method.method)}
                    </td>
                    <td className="p-[10px_15px] border-b border-[#f0f0f0] text-[13px] text-right font-semibold text-[#10b981]">
                      {formatCurrency(method.amount)}
                    </td>
                    {paymentData.paymentMethods.some((pm) => pm.reference) && (
                      <td className="p-[10px_15px] border-b border-[#f0f0f0] text-[13px] text-[#444444]">
                        {method.reference || "-"}
                      </td>
                    )}
                  </tr>
                ))}
                <tr>
                  <td className="p-[12px_15px] border-t-2 border-[#e2e8f0] text-[14px] font-bold text-[#1e3a8a] uppercase">
                    Total
                  </td>
                  <td className="p-[12px_15px] border-t-2 border-[#e2e8f0] text-[14px] text-right font-bold text-[#10b981]">
                    {formatCurrency(paymentData.totalAmount)}
                  </td>
                  {paymentData.paymentMethods.some((pm) => pm.reference) && (
                    <td className="p-[12px_15px] border-t-2 border-[#e2e8f0]"></td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        )}

      {/* Notes */}
      {paymentData.notes && (
        <div className="mb-[30px]">
          <h3 className="text-[18px] font-semibold text-[#1e3a8a] mb-[15px] uppercase border-b-2 border-[#93c5fd] pb-[15px]">
            Notes
          </h3>
          <div className="text-[13px] text-[#444444] leading-[1.8] px-[15px]">
            {paymentData.notes}
          </div>
        </div>
      )}

      <div className="mt-auto pt-[20px] border-t border-[#e0e7ff] text-[11px] text-[#888888] text-center">
        <p className="m-0">
          This is a computer-generated document. No signature is required.
        </p>
        <p className="mt-[4px] mx-0 mb-0">
          Generated by DragBizz on {moment().format("DD MMMM YYYY, hh:mm A")}
        </p>
      </div>
    </div>
  );
};

export default PaymentDetailsTemplate;

