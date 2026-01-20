"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import {
  CheckCircle,
  ArrowLeft,
  Package,
  Calendar,
  FileText,
  Share2,
  MessageCircle,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import moment from "moment";
import { purchaseOrderService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { Loading, Card, Button } from "@/components/ui";
import logger from "@/utils/logger";

export default function ViewPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const poId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [po, setPo] = useState(null);

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
      try {
        setLoading(true);
        setError(null);
        const storeId =
          selectedStore?.storeId ||
          selectedStore?._id ||
          selectedStore?.id ||
          null;
        const result = await purchaseOrderService.getPurchaseOrders({
          id: poId,
          store: storeId,
        });
        if (result.success) {
          const data = result.data?.data || result.data;
          if (data) {
            setPo(data);
            setError(null);
          } else {
            setError("Purchase order not found");
          }
        } else {
          setError(result.message || "Failed to load purchase order");
          setPo(null);
        }
      } catch (e) {
        logger.error("Error fetching purchase order:", e);
        setError("Unexpected error while loading purchase order");
        setPo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPo();
  }, [poId, selectedStore]);

  return (
    <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />

      <div className="min-h-screen w-full flex flex-col">
        <Header
          title="Purchase Order"
          description="View purchase order details"
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
                  Back to Purchase Orders
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
                              {po.poNumber}
                            </h2>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                              Status: {po.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium border"
                            style={getApprovalStyles(po.approvalStatus)}
                          >
                            Approval: {po.approvalStatus || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-sm">
                              PO Date:{" "}
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                {formatDate(po.poDate)}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-sm">
                              Expected Delivery:{" "}
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                {formatDate(po.expectedDeliveryDate)}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-sm">
                              Payment Terms:{" "}
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                {po.paymentTerms || "-"}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-sm">
                            <p className="text-[rgb(var(--color-text-tertiary))]">
                              Supplier
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
                            Items
                          </h3>
                        </div>

                        <div className="overflow-y-auto max-h-64 border border-[rgb(var(--color-border-primary))] rounded-lg">
                          <div className="grid grid-cols-12 text-xs text-[rgb(var(--color-text-secondary))] sticky top-0 z-10 bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]">
                            <div className="col-span-6 p-3">Product</div>
                            <div className="col-span-2 p-3 text-right">
                              Ordered
                            </div>
                            <div className="col-span-2 p-3 text-right">
                              Received
                            </div>
                            <div className="col-span-2 p-3 text-right">
                              Pending
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
                                    0,
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end mt-6">
                          <div className="w-full md:w-80 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                Total Items
                              </span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                {(po.items || []).reduce(
                                  (sum, item) => sum + (item.quantity || 0),
                                  0,
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                Items Received
                              </span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                {(po.items || []).reduce(
                                  (sum, item) =>
                                    sum + (item.receivedQuantity || 0),
                                  0,
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                Pending Items
                              </span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                {Math.max(
                                  (po.items || []).reduce(
                                    (sum, item) => sum + (item.quantity || 0),
                                    0,
                                  ) -
                                    (po.items || []).reduce(
                                      (sum, item) =>
                                        sum + (item.receivedQuantity || 0),
                                      0,
                                    ),
                                  0,
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm border-t border-[rgb(var(--color-border-primary))] pt-2">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                Advance Paid
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

                <div className="space-y-6">
                  <Card>
                    <div className="p-5">
                      <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                        Meta
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">
                            Created
                          </span>
                          <span className="text-[rgb(var(--color-text-primary))]">
                            {formatDateTime(po.createdAt)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">
                            Updated
                          </span>
                          <span className="text-[rgb(var(--color-text-primary))]">
                            {formatDateTime(po.updatedAt)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">
                            Completion
                          </span>
                          <span className="text-[rgb(var(--color-text-primary))]">
                            {po.completionPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {po.notes || po.internalNotes || po.supplierNotes ? (
                    <Card>
                      <div className="p-5">
                        <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
                          Notes
                        </h3>
                        {po.notes && (
                          <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-2">
                            {po.notes}
                          </p>
                        )}
                        {po.internalNotes && (
                          <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-2">
                            Internal: {po.internalNotes}
                          </p>
                        )}
                        {po.supplierNotes && (
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                            Supplier: {po.supplierNotes}
                          </p>
                        )}
                      </div>
                    </Card>
                  ) : null}

                  <Card>
                    <div className="p-5">
                      <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
                        Actions
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/dashboard/purchase-orders/${po.id || po._id}/edit`,
                            )
                          }
                          className="w-full"
                        >
                          Edit
                        </Button>
                        <Button variant="danger" className="w-full">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
