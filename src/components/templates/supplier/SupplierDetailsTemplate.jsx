"use client";
import moment from "moment";

const SupplierDetailsTemplate = ({ supplierData, selectedStore }) => {
  if (!supplierData) return null;

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="max-w-[850px] my-[30px] mx-auto p-[30px] bg-white text-[13px] leading-[1.6] text-[rgb(var(--color-text-primary))] flex flex-col min-h-[calc(100vh-60px)] font-primary">
      {/* Header Section */}
      <div className="flex justify-between items-center py-[25px] px-0 mb-[30px] bg-gradient-to-r from-[#f0f8ff] to-white">
        <div className="px-[15px]">
          <div className="text-[24px] font-[300] text-[rgb(var(--color-primary))] tracking-[1px] uppercase">
            {selectedStore?.storeName || selectedStore?.name || "STORE NAME"}
          </div>
          {selectedStore?.address && (
            <p className="text-[12px] text-[rgb(var(--color-text-secondary))] mt-[5px] leading-[1.4]">
              {selectedStore.address}
            </p>
          )}
          {(selectedStore?.phone || selectedStore?.email) && (
            <p className="text-[12px] text-[rgb(var(--color-text-secondary))] mt-[5px] leading-[1.4]">
              {selectedStore?.phone && `Tel: ${selectedStore.phone}`}
              {selectedStore?.phone && selectedStore?.email && " | "}
              {selectedStore?.email && `Email: ${selectedStore.email}`}
            </p>
          )}
        </div>
        <div className="text-right px-[15px]">
          <h1 className="text-[30px] font-[700] text-[rgb(var(--color-primary))] m-0 tracking-[3px] uppercase">
            SUPPLIER DETAILS
          </h1>
          <p className="text-[14px] text-[rgb(var(--color-text-tertiary))] my-[4px] mx-0">
            Generated: {moment().format("DD/MM/YYYY HH:mm:ss")}
          </p>
        </div>
      </div>

      {/* Supplier Information Section */}
      <div className="mb-[30px]">
        <h3 className="text-[18px] font-[600] text-[rgb(var(--color-primary))] mb-[15px] uppercase bg-[rgb(var(--color-primary))/0.05] p-[10px_15px] rounded-lg">
          Supplier Information
        </h3>
        <div className="px-[15px] text-[13px] leading-[1.8] grid grid-cols-2 gap-[8px_30px]">
          <div className="text-[rgb(var(--color-text-secondary))]">
            <span className="font-[500] text-[rgb(var(--color-text-primary))]">
              Supplier Name
            </span>{" "}
            - <span className="font-[600]">{supplierData.name || "N/A"}</span>
          </div>
          <div className="text-[rgb(var(--color-text-secondary))]">
            <span className="font-[500] text-[rgb(var(--color-text-primary))]">
              Phone Number
            </span>{" "}
            - <span>{supplierData.phone || "N/A"}</span>
          </div>
          <div className="text-[rgb(var(--color-text-secondary))] break-all">
            <span className="font-[500] text-[rgb(var(--color-text-primary))]">
              Email Address
            </span>{" "}
            - <span>{supplierData.email || "N/A"}</span>
          </div>
          {supplierData.agency && (
            <div className="text-[rgb(var(--color-text-secondary))]">
              <span className="font-[500] text-[rgb(var(--color-text-primary))]">
                Agency
              </span>{" "}
              - <span>{supplierData.agency}</span>
            </div>
          )}
          {supplierData.gstNumber && (
            <div className="text-[rgb(var(--color-text-secondary))]">
              <span className="font-[500] text-[rgb(var(--color-text-primary))]">
                GST Number
              </span>{" "}
              -{" "}
              <span className="font-mono font-[600]">
                {supplierData.gstNumber}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Address Section */}
      {supplierData.address && (
        <div className="mb-[30px]">
          <h3 className="text-[18px] font-[600] text-[rgb(var(--color-primary))] mb-[15px] uppercase bg-[rgb(var(--color-primary))/0.05] p-[10px_15px] rounded-lg">
            Address
          </h3>
          <div className="text-[13px] text-[rgb(var(--color-text-secondary))] leading-[1.8] px-[15px]">
            {supplierData.address.addressLine1 && (
              <div className="mb-[4px]">{supplierData.address.addressLine1}</div>
            )}
            {supplierData.address.addressLine2 && (
              <div className="mb-[4px]">{supplierData.address.addressLine2}</div>
            )}
            <div>
              {supplierData.address.city && supplierData.address.city}
              {supplierData.address.city && supplierData.address.state && ", "}
              {supplierData.address.state && supplierData.address.state}
              {supplierData.address.pincode &&
                ` - ${supplierData.address.pincode}`}
              {supplierData.address.country &&
                `, ${supplierData.address.country}`}
            </div>
          </div>
        </div>
      )}

      {/* Account Details Section */}
      {supplierData.account && (
        <div className="mb-[30px]">
          <h3 className="text-[18px] font-[600] text-[rgb(var(--color-primary))] mb-[15px] uppercase bg-[rgb(var(--color-primary))/0.05] p-[10px_15px] rounded-lg">
            Account Details
          </h3>
          <table className="w-full border-collapse mb-[20px]">
            <tbody>
              <tr className="bg-gray-50/50">
                <td className="p-[10px_15px] text-[13px] font-[500] text-[rgb(var(--color-text-primary))] w-[40%]">
                  Total Purchases
                </td>
                <td className="p-[10px_15px] text-[13px] text-right font-[600] text-[rgb(var(--color-primary))]">
                  {formatCurrency(supplierData.account.totalPurchases)}
                </td>
              </tr>
              <tr>
                <td className="p-[10px_15px] text-[13px] font-[500] text-[rgb(var(--color-text-primary))]">
                  Total Paid
                </td>
                <td className="p-[10px_15px] text-[13px] text-right font-[600] text-[rgb(var(--color-success))]">
                  {formatCurrency(supplierData.account.totalPaid)}
                </td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="p-[10px_15px] text-[13px] font-[500] text-[rgb(var(--color-text-primary))]">
                  Due Amount
                </td>
                <td className="p-[10px_15px] text-[13px] text-right font-[600] text-[rgb(var(--color-danger))]">
                  {formatCurrency(supplierData.account.dueAmount)}
                </td>
              </tr>
              <tr>
                <td className="p-[10px_15px] text-[13px] font-[500] text-[rgb(var(--color-text-primary))]">
                  Total Bills
                </td>
                <td className="p-[10px_15px] text-[13px] text-right font-[600] text-[rgb(var(--color-primary))]">
                  {supplierData.account.totalBills || 0}
                </td>
              </tr>
              {supplierData.account.creditLimit !== undefined && (
                <tr className="bg-gray-50/50">
                  <td className="p-[10px_15px] text-[13px] font-[500] text-[rgb(var(--color-text-primary))]">
                    Credit Limit
                  </td>
                  <td className="p-[10px_15px] text-[13px] text-right font-[600] text-[rgb(var(--color-primary))]">
                    {formatCurrency(supplierData.account.creditLimit)}
                  </td>
                </tr>
              )}
              {supplierData.account.availableCredit !== undefined && (
                <tr>
                  <td className="p-[10px_15px] text-[13px] font-[500] text-[rgb(var(--color-text-primary))]">
                    Available Credit
                  </td>
                  <td className="p-[10px_15px] text-[13px] text-right font-[600] text-[rgb(var(--color-primary))]">
                    {formatCurrency(supplierData.account.availableCredit)}
                  </td>
                </tr>
              )}
              {supplierData.account.onTimePaymentRate !== undefined && (
                <tr className="bg-gray-50/50">
                  <td className="p-[10px_15px] text-[13px] font-[500] text-[rgb(var(--color-text-primary))]">
                    On-Time Payment Rate
                  </td>
                  <td className="p-[10px_15px] text-[13px] text-right font-[600] text-[rgb(var(--color-success))]">
                    {supplierData.account.onTimePaymentRate || 0}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Additional Information Section (Conditional) */}
      {supplierData.account && (
        (supplierData.account.paymentTerms ||
          supplierData.account.creditUtilized !== undefined ||
          supplierData.account.riskLevel ||
          supplierData.account.lastPaymentDate ||
          supplierData.account.averagePaymentDays !== undefined ||
          supplierData.account.totalTransactions !== undefined ||
          supplierData.account.paidBills !== undefined ||
          supplierData.account.pendingBills !== undefined) && (
          <div className="mb-[30px]">
            <h3 className="text-[18px] font-[600] text-[rgb(var(--color-primary))] mb-[15px] uppercase bg-[rgb(var(--color-primary))/0.05] p-[10px_15px] rounded-lg">
              Additional Information
            </h3>
            <div className="px-[15px] text-[13px] leading-[1.8] grid grid-cols-2 gap-[8px_30px]">
              {supplierData.account.paymentTerms && (
                <div className="text-[rgb(var(--color-text-secondary))]">
                  <span className="font-[500] text-[rgb(var(--color-text-primary))]">Payment Terms</span> - <span>{supplierData.account.paymentTerms.replace("_", " ")}</span>
                </div>
              )}
              {supplierData.account.creditUtilized !== undefined && (
                <div className="text-[rgb(var(--color-text-secondary))]">
                  <span className="font-[500] text-[rgb(var(--color-text-primary))]">Credit Utilized</span> - <span>{formatCurrency(supplierData.account.creditUtilized)}</span>
                </div>
              )}
              {supplierData.account.riskLevel && (
                <div className="text-[rgb(var(--color-text-secondary))]">
                  <span className="font-[500] text-[rgb(var(--color-text-primary))]">Risk Level</span> - <span className="font-[600]">{supplierData.account.riskLevel}</span>
                </div>
              )}
              {supplierData.account.lastPaymentDate && (
                <div className="text-[rgb(var(--color-text-secondary))]">
                  <span className="font-[500] text-[rgb(var(--color-text-primary))]">Last Payment</span> - <span>{moment(supplierData.account.lastPaymentDate).format("DD MMM YYYY")}</span>
                </div>
              )}
              {supplierData.account.averagePaymentDays !== undefined && (
                <div className="text-[rgb(var(--color-text-secondary))]">
                  <span className="font-[500] text-[rgb(var(--color-text-primary))]">Avg Payment Cycle</span> - <span>{supplierData.account.averagePaymentDays} Days</span>
                </div>
              )}
              {supplierData.account.totalTransactions !== undefined && (
                <div className="text-[rgb(var(--color-text-secondary))]">
                  <span className="font-[500] text-[rgb(var(--color-text-primary))]">Total Transactions</span> - <span>{supplierData.account.totalTransactions}</span>
                </div>
              )}
              {supplierData.account.paidBills !== undefined && (
                <div className="text-[rgb(var(--color-text-secondary))]">
                  <span className="font-[500] text-[rgb(var(--color-text-primary))]">Paid Bills</span> - <span className="text-[rgb(var(--color-success))] font-[600]">{supplierData.account.paidBills}</span>
                </div>
              )}
              {supplierData.account.pendingBills !== undefined && (
                <div className="text-[rgb(var(--color-text-secondary))]">
                  <span className="font-[500] text-[rgb(var(--color-text-primary))]">Pending Bills</span> - <span className="text-[rgb(var(--color-danger))] font-[600]">{supplierData.account.pendingBills}</span>
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* Footer Section */}
      <div className="mt-auto pt-[20px] text-[11px] text-[rgb(var(--color-text-tertiary))] text-center">
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

export default SupplierDetailsTemplate;
