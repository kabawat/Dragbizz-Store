"use client";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Download,
  Edit,
  FileText,
  Package,
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import PurchaseOrderDetailsTemplate from "@/components/templates/purchaseOrder/PurchaseOrderDetailsTemplate";
import { Button, Card, Loading } from "@/components/ui";
import { purchaseOrderService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";
import { usePurchaseOrderDetailsPrint } from "./hooks/usePurchaseOrderDetailsPrint";

import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useTranslation } from "@/hooks/ui/useTranslation";

export default function ViewPurchaseOrderPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const poId = params?.id;
  const { can, edit: canEdit, loading: permissionsLoading } = useModulePermissions("purchase_order");

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard/purchase-orders");
    }
  }, [can, permissionsLoading, router]);

  const [error, setError] = useState(null);
  const [po, setPo] = useState(null);

  const { execute: executeFetch, loading } = useApiResponse();

  const { handleDownloadPDF } = usePurchaseOrderDetailsPrint(loading, po);

  // Helpers
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount ?? 0);
  const formatDate = (date) =>
    date ? moment(date).format("MMM DD, YYYY") : "-";
  const formatDateTime = (date) =>
    date ? moment(date).format("MMM DD, YYYY h:mm A") : "-";
  const getApprovalStyles = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED") {
      return {
        color: "rgb(var(--color-success))",
        backgroundColor: "rgba(var(--color-success), 0.1)",
        borderColor: "rgba(var(--color-success), 0.3)",
      };
    }
    if (s === "REJECTED") {
      return {
        color: "rgb(var(--color-danger))",
        backgroundColor: "rgba(var(--color-danger), 0.1)",
        borderColor: "rgba(var(--color-danger), 0.3)",
      };
    }
    return {
      color: "rgb(var(--color-primary))",
      backgroundColor: "rgba(var(--color-primary), 0.1)",
      borderColor: "rgba(var(--color-primary), 0.3)",
    };
  };

  useEffect(() => {
    const fetchPo = async () => {
      if (!poId) return;

      const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || null;
      const result = await executeFetch(
        purchaseOrderService.getPurchaseOrders({ id: poId, store: storeId }),
        { showToast: false }
      );

      if (result?.success) {
        const data = result.data?.data || result.data;
        if (data) {
          setPo(data);
          setError(null);
        } else {
          setError(t("purchaseOrders.errorLoading"));
        }
      } else {
        setError(result?.message || t("purchaseOrders.errorLoading"));
        setPo(null);
      }
    };
    fetchPo();
  }, [poId, selectedStore, executeFetch, t]);

  return (
    <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />

      <div className="min-h-screen w-full flex flex-col">
        <Header
          title={t("purchaseOrders.purchaseOrderDetails")}
          description={t("purchaseOrders.viewPODescription")}
        />

        <div className="flex-1 p-6">
          <div className="w-full mx-auto">
            <div className="mb-4">
              <Link
                href="/dashboard/purchase-orders"
                className="inline-flex items-center space-x-2 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-all duration-200 border border-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("purchaseOrders.backToPurchaseOrders")}
                </span>
              </Link>
            </div>

            {loading && (
              <div className="flex items-center justify-center h-64">
                <Loading />
              </div>
            )}

            {!loading && error && (
              <Card>
                <div className="p-6 text-center text-[rgb(var(--color-danger))]">
                  {error}
                </div>
              </Card>
            )}

            {!loading && po && (
              <>
                <div
                  id="purchase-order-details-report-area"
                  className="hidden"
                  data-variant="light"
                  data-theme="default"
                >
                  <PurchaseOrderDetailsTemplate
                    purchaseOrderData={po}
                    selectedStore={selectedStore}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{
                                backgroundColor:
                                  "rgba(var(--color-success), 0.1)",
                              }}
                            >
                              <CheckCircle
                                className="w-5 h-5"
                                style={{ color: "rgb(var(--color-success))" }}
                              />
                            </div>
                            <div>
                              <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                                {po.poNumber || po.billNumber}
                              </h2>
                              <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                                {t("common.status")}: {po.status || t("common.na")}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium border"
                              style={getApprovalStyles(po.approvalStatus)}
                            >
                              {t("purchaseOrders.approvalStatus")}: {po.approvalStatus || t("common.na")}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                              <span className="text-sm">
                                {t("purchaseOrders.poDate")}:{" "}
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                  {formatDate(po.poDate)}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                              <span className="text-sm">
                                {t("purchaseOrders.expectedDelivery")}:{" "}
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                  {formatDate(po.expectedDeliveryDate)}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                              <span className="text-sm">
                                {t("purchaseOrders.paymentDueIn")}:{" "}
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                  {po.paymentTerms || "-"}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="text-sm">
                              <p className="text-[rgb(var(--color-text-tertiary))]">
                                {t("purchaseOrders.supplier")}
                              </p>
                              <p className="font-medium text-[rgb(var(--color-text-primary))]">
                                {po.supplier?.name}
                              </p>
                              <p className="text-[rgb(var(--color-text-secondary))]">
                                {po.supplier?.email} • {po.supplier?.phone}
                              </p>
                              <p className="text-[rgb(var(--color-text-secondary))]">
                                {po.supplier?.address}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 border-t border-[rgb(var(--color-border-primary))] pt-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{
                                backgroundColor:
                                  "rgba(var(--color-primary), 0.1)",
                              }}
                            >
                              <Package
                                className="w-4 h-4"
                                style={{ color: "rgb(var(--color-primary))" }}
                              />
                            </div>
                            <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                              {t("purchaseOrders.productsItems")}
                            </h3>
                          </div>

                          <div className="overflow-y-auto max-h-64 border border-[rgb(var(--color-border-primary))] rounded-lg">
                            <div className="grid grid-cols-12 text-xs text-[rgb(var(--color-text-secondary))] sticky top-0 z-10 bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]">
                              <div className="col-span-6 p-3">{t("purchaseOrders.product")}</div>
                              <div className="col-span-2 p-3 text-right">
                                {t(`purchaseOrders.ordered`)}
                              </div>
                              <div className="col-span-2 p-3 text-right">
                                {t("purchaseOrders.received")}
                              </div>
                              <div className="col-span-2 p-3 text-right">
                                {t("purchaseOrders.pending")}
                              </div>
                            </div>
                            {po.items?.map((item, idx) => (
                              <div
                                key={idx}
                                className="grid grid-cols-12 text-sm border-t border-[rgb(var(--color-border-primary))]"
                              >
                                <div className="col-span-6 p-3">
                                  <div className="font-medium text-[rgb(var(--color-text-primary))]">
                                    {item.product?.name}
                                  </div>
                                  <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                                    SKU: {item.product?.sku}
                                  </div>
                                </div>
                                <div className="col-span-2 p-3 text-right">
                                  {item.quantity}
                                </div>
                                <div className="col-span-2 p-3 text-right">
                                  {item.receivedQuantity || 0}
                                </div>
                                <div className="col-span-2 p-3 text-right">
                                  {item.pendingQuantity ??
                                    Math.max(
                                      (item.quantity || 0) -
                                      (item.receivedQuantity || 0),
                                      0
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end mt-6">
                            <div className="w-full md:w-80 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[rgb(var(--color-text-secondary))]">
                                  {t("purchaseOrders.totalItems")}
                                </span>
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                  {(po.items || []).reduce(
                                    (sum, item) => sum + (item.quantity || 0),
                                    0
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[rgb(var(--color-text-secondary))]">
                                  {t("purchaseOrders.itemsReceived")}
                                </span>
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                  {(po.items || []).reduce(
                                    (sum, item) =>
                                      sum + (item.receivedQuantity || 0),
                                    0
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[rgb(var(--color-text-secondary))]">
                                  {t("purchaseOrders.pendingItems")}
                                </span>
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                  {Math.max(
                                    (po.items || []).reduce(
                                      (sum, item) => sum + (item.quantity || 0),
                                      0
                                    ) -
                                    (po.items || []).reduce(
                                      (sum, item) =>
                                        sum + (item.receivedQuantity || 0),
                                      0
                                    ),
                                    0
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm border-t border-[rgb(var(--color-border-primary))] pt-2">
                                <span className="text-[rgb(var(--color-text-secondary))]">
                                  {t("purchaseOrders.advancePaid")}
                                </span>
                                <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                                  {formatCurrency(po.advanceAmount)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Right Side - Quick Actions */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-6">
                      <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                              {t("common.quickActions")}
                            </h3>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                              {t("purchaseOrders.managePODescription")}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          {canEdit && (
                            <Button
                              variant="primary"
                              className="flex-1"
                              onClick={() =>
                                router.push(
                                  `/dashboard/purchase-orders/${po.id || po._id}/edit`
                                )
                              }
                              leftIcon={Edit}
                            >
                              {t("common.edit")}
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDownloadPDF(po)}
                            leftIcon={Download}
                          >
                            <span className="hidden sm:inline">{t("common.download")}</span>
                            <span className="sm:hidden">{t("common.download")}</span>
                          </Button>
                        </div>

                        {/* Purchase Order Stats */}
                        <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                            {t("common.quickStats")}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                {t("purchaseOrders.totalItems")}:
                              </span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                {(po.items || []).reduce(
                                  (sum, item) => sum + (item.quantity || 0),
                                  0
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                {t("purchaseOrders.itemsReceived")}:
                              </span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                {(po.items || []).reduce(
                                  (sum, item) =>
                                    sum + (item.receivedQuantity || 0),
                                  0
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                {t("purchaseOrders.pendingItems")}:
                              </span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                {Math.max(
                                  (po.items || []).reduce(
                                    (sum, item) => sum + (item.quantity || 0),
                                    0
                                  ) -
                                  (po.items || []).reduce(
                                    (sum, item) =>
                                      sum + (item.receivedQuantity || 0),
                                    0
                                  ),
                                  0
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                {t("purchaseOrders.completion")}:
                              </span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                {po.completionPercentage || 0}%
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-[rgb(var(--color-border-primary))] pt-2 mt-2">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                {t("purchaseOrders.advancePaid")}:
                              </span>
                              <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                                {formatCurrency(po.advanceAmount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Meta Information */}
                        <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                            {t("common.metaInformation")}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                {t("common.created")}:
                              </span>
                              <span className="text-[rgb(var(--color-text-primary))]">
                                {formatDateTime(po.createdAt)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                {t("common.updated")}:
                              </span>
                              <span className="text-[rgb(var(--color-text-primary))]">
                                {formatDateTime(po.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {(po.notes || po.internalNotes || po.supplierNotes) && (
                          <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                              {t("purchaseOrders.additionalNotes")}
                            </h4>
                            <div className="space-y-2 text-sm">
                              {po.notes && (
                                <p className="text-[rgb(var(--color-text-secondary))]">
                                  {po.notes}
                                </p>
                              )}
                              {po.internalNotes && (
                                <p className="text-[rgb(var(--color-text-secondary))]">
                                  <span className="font-medium">{t("common.internal")}:</span>{" "}
                                  {po.internalNotes}
                                </p>
                              )}
                              {po.supplierNotes && (
                                <p className="text-[rgb(var(--color-text-secondary))]">
                                  <span className="font-medium">{t("purchaseOrders.supplier")}:</span>{" "}
                                  {po.supplierNotes}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
