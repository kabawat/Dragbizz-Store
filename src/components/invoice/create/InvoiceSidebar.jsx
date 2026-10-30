"use client";
import { Calculator, Receipt, Tag, User, Save, Plus } from "lucide-react";
import { memo, useMemo } from "react";
import { Button, Input, Select } from "@/components/ui";
import { calculateInvoiceGST } from "@/utils/gstCalculator";

const InvoiceSidebar = ({
  t,
  router,
  formData,
  handleCustomerChange,
  handleDiscountChange,
  customers,
  customersLoading,
  invoiceLoading,
  handleSubmit,
  isEditMode = false,
  showActions = false,
}) => {
  // ── GST Calculation ──────────────────────────────────────────────
  const gstSummary = useMemo(() => {
    if (!formData.items || formData.items.length === 0) {
      return {
        subtotal: 0,
        gst: { total: 0, cgst: 0, sgst: 0, igst: 0, utgst: 0 },
        totalDiscount: 0,
        totalAmount: 0,
        netTaxable: 0,
        originalTotal: 0,
      };
    }

    // Map items to gstCalculator format
    const mappedItems = formData.items.map((item) => ({
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      gstRate: Number(item.gstRate || item.gst?.rate) || 0,
      isInclusive:
        item.isInclusive !== undefined
          ? item.isInclusive
          : item.gst && item.gst.isInclusive !== undefined
            ? item.gst.isInclusive
            : false,
    }));

    return calculateInvoiceGST({
      items: mappedItems,
      totalDiscount: Number(formData.totalDiscount) || 0,
      discountMode: formData.discountMode || "POST_TOTAL",
      supplierHasGst: true,
    });
  }, [formData.items, formData.totalDiscount, formData.discountMode]);

  const fmt = (num) => Number(num || 0).toFixed(2);
  const totalQuantity = (formData.items || []).reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  const hasAnyGST = gstSummary.gst?.total > 0;

  return (
    <div className="flex flex-col h-full w-full max-w-full">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
        {/* ── Customer Information ── */}
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl p-4 border border-[rgb(var(--color-border-primary))]/30 shadow-sm">
          <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
            <User className="w-4 h-4 mr-2 text-[rgb(var(--color-primary))]" />
            {t("invoice.customerInformation") || "Customer Information"}
          </h4>
          <div>
            <span className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1.5">
              {t("invoice.customer") || "Customer"}
              <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                ({t("common.optional") || "optional"} - defaults to walk-in)
              </span>
            </span>
            <Select
              value={formData.customer}
              onChange={handleCustomerChange}
              options={
                customersLoading
                  ? [
                      {
                        value: "",
                        label: t("invoice.loadingCustomers") || "Loading customers...",
                      },
                    ]
                  : customers
              }
              disabled={customersLoading}
              leftIcon={User}
              size="sm"
              searchable={true}
              placeholder={t("invoice.searchCustomers") || "Search customer by name/phone..."}
            />
          </div>
        </div>

        {/* ── Invoice Summary with GST Breakdown & Total Discount ── */}
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl p-4 border border-[rgb(var(--color-border-primary))]/30 shadow-sm">
          <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
            <Receipt className="w-4 h-4 mr-2 text-[rgb(var(--color-primary))]" />
            {t("invoice.invoiceSummary") || "Invoice Summary"}
          </h4>

          {/* Total Discount Input (Moved here from items bottom) */}
          <div className="mb-3 pb-3 border-b border-[rgb(var(--color-border-primary))]/20">
            <span className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1.5">
              {t("invoice.totalDiscount") || "Total Discount"} (₹)
              <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                ({t("common.optional") || "optional"})
              </span>
            </span>
            <Input
              type="number"
              value={formData.totalDiscount || ""}
              onChange={(val) => {
                const num = val === "" ? 0 : parseFloat(val);
                handleDiscountChange?.(isNaN(num) ? 0 : num);
              }}
              min="0"
              step="0.01"
              leftIcon={Calculator}
              size="sm"
              placeholder={t("invoice.enterDiscount") || "0.00"}
            />
          </div>

          <div className="space-y-2.5 text-sm">
            {/* Gross Total (original MRP sum) */}
            {gstSummary.originalTotal > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("invoice.grossTotal") || "Gross Total"}:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  ₹{fmt(gstSummary.originalTotal)}
                </span>
              </div>
            )}

            {/* Discount display */}
            {Number(formData.totalDiscount) > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[rgb(var(--color-text-secondary))] flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-green-500" />
                  {t("invoice.discount") || "Discount"}:
                </span>
                <span className="font-semibold text-green-500">
                  - ₹{fmt(formData.totalDiscount)}
                </span>
              </div>
            )}

            {/* Net Taxable */}
            <div className="flex justify-between items-center">
              <span className="text-[rgb(var(--color-text-secondary))]">
                {t("invoice.netTaxable") || "Net Taxable"}:
              </span>
              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                ₹{fmt(gstSummary.subtotal)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[rgb(var(--color-text-secondary))]">
                {t("invoice.totalQuantity") || "Total Quantity"}:
              </span>
              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                {totalQuantity}
              </span>
            </div>

            {/* Total GST */}
            {hasAnyGST && (
              <div className="flex justify-between items-center">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("invoice.totalGST") || "Total GST"}:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  ₹{fmt(gstSummary.gst.total)}
                </span>
              </div>
            )}

            {/* Grand Total */}
            <div className="border-t border-[rgb(var(--color-border-primary))]/30 pt-3 mt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[rgb(var(--color-text-primary))] font-semibold text-base">
                  {t("invoice.total") || "Total Amount"}:
                </span>
                <span className="font-bold text-[rgb(var(--color-text-primary))] text-xl sm:text-2xl text-[rgb(var(--color-primary))]">
                  ₹{fmt(gstSummary.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Action Buttons inside sidebar if requested */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              className="w-full flex-1 justify-center"
              onClick={handleSubmit}
              loading={invoiceLoading}
              leftIcon={isEditMode ? Save : Plus}
              disabled={formData.items.length === 0}
            >
              {isEditMode
                ? t("invoice.updateInvoice") || "Update Invoice"
                : t("invoice.createInvoiceButton") || "Create Invoice"}
            </Button>

            <Button
              variant="outline"
              className="w-full flex-1 justify-center"
              onClick={() => router.push("/dashboard/invoices")}
              disabled={invoiceLoading}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(InvoiceSidebar);
