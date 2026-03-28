"use client";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import PurchaseOrderDetails from "@/components/purchaseOrders/PurchaseOrderDetails";
import { SideDrawer } from "@/components/ui";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { purchaseOrderService } from "@/service/retailer";
import { useApiResponse } from "@/hooks/useApiResponse";
import { getStatusBadge as getCommonStatusBadge } from "@/utils/statusBadge";

const ViewPurchaseOrder = ({ purchaseOrderId }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const { execute, data: purchaseOrder, loading } = useApiResponse();

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      if (purchaseOrderId) {
        try {
          await execute(
            purchaseOrderService.getPublicPurchaseOrder(purchaseOrderId),
            { showToast: false }
          );
        } finally {
          setHasAttempted(true);
        }
      }
    };
    fetchPurchaseOrder();
  }, [purchaseOrderId, execute]);

  const _formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusUpper = (status || "").toUpperCase();
    const config = getCommonStatusBadge(statusUpper, "purchase-order");

    // Map icons for compatibility
    const iconMap = {
      PENDING: Clock,
      APPROVED: CheckCircle,
      REJECTED: AlertTriangle,
      OPEN: AlertTriangle,
    };

    // Convert to color class format for compatibility
    const getColorClass = (variant) => {
      switch (variant) {
        case "success":
          return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700";
        case "danger":
          return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700";
        case "primary":
          return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700";
        default:
          return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700";
      }
    };

    // Handle OPEN status separately
    if (statusUpper === "OPEN") {
      return {
        icon: AlertTriangle,
        text: "Open",
        color:
          "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700",
      };
    }

    return {
      icon: iconMap[statusUpper] || Clock,
      text: config.text,
      color: getColorClass(config.variant),
    };
  };

  const handleDownload = () => {
    // Implement download functionality
    // Download purchase order PDF
  };

  const handleViewDetails = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  if (loading || (!hasAttempted && purchaseOrderId)) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Loading Purchase Order...
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Please wait while we fetch the details
          </p>
        </div>
      </div>
    );
  }

  if (hasAttempted && !purchaseOrder) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Purchase Order Not Found
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            The purchase order you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(
    purchaseOrder.approvalStatus || purchaseOrder.status
  );
  const StatusIcon = statusBadge.icon;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] relative">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] opacity-5">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z"
              fill="currentColor"
              className="text-[rgb(var(--color-primary))]"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-8">
          {/* Store Profile Section */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-3">
              Hello, {purchaseOrder.supplier?.name || "Supplier"}
            </h1>
            <p className="text-lg text-[rgb(var(--color-text-secondary))]">
              Purchase Order #
              {purchaseOrder.poNumber ||
                purchaseOrder.billNumber ||
                `PO-${purchaseOrderId}`}
            </p>
          </div>

          {/* Purchase Order Card */}
          <div className="bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-2xl shadow-sm p-12 max-w-4xl w-full mb-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                Purchase Order Details
              </h2>
            </div>

            {/* Store Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6">
                <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
                  Store Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">
                      Store Name:
                    </span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold text-right">
                      {purchaseOrder.store?.name || "DragBizz Store"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">
                      Phone:
                    </span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold">
                      {purchaseOrder.store?.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">
                      Email:
                    </span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold">
                      {purchaseOrder.store?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">
                      Address:
                    </span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold text-sm text-right max-w-[60%]">
                      {purchaseOrder.store?.address
                        ? `${purchaseOrder.store.address.line1}, ${purchaseOrder.store.address.city}, ${purchaseOrder.store.address.state} - ${purchaseOrder.store.address.pincode}`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6">
                <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
                  Order Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">
                      PO Date:
                    </span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold">
                      {formatDate(
                        purchaseOrder.poDate || purchaseOrder.billDate
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">
                      Expected Delivery:
                    </span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold">
                      {formatDate(
                        purchaseOrder.expectedDeliveryDate ||
                        purchaseOrder.dueDate
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">
                      Status:
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusBadge.color}`}
                    >
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {statusBadge.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Count */}
            <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-xl font-bold">
                      {purchaseOrder.items?.length || 0}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                  Number of Items
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                  {purchaseOrder.items?.length === 1 ? "item" : "items"} in this
                  order
                </p>
              </div>
            </div>

            {/* Notes Section */}
            {purchaseOrder.notes && (
              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 mb-8 border border-[rgb(var(--color-border-primary))]">
                <h4 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
                  Notes
                </h4>
                <p className="text-[rgb(var(--color-text-secondary))] text-sm leading-relaxed">
                  {purchaseOrder.notes}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleViewDetails}
                className="cursor-pointer flex-1 text-[rgb(var(--color-primary))] font-medium text-base flex items-center justify-center py-3 border-2 border-[rgb(var(--color-primary))] border-opacity-30 rounded-lg transition-colors"
              >
                View details
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:opacity-90 text-white font-medium text-base flex items-center justify-center py-3 px-6 rounded-lg transition-colors shadow-md"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PO
              </button>
            </div>
          </div>

          {/* Decorative Element */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="text-4xl">🙏</div>
            </div>
          </div>

          {/* Promotional Banner */}
          <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-2xl p-8 max-w-4xl w-full text-center shadow-sm">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-[rgb(var(--color-primary))] bg-opacity-10 dark:bg-opacity-20 rounded-lg px-6 py-3 border border-[rgb(var(--color-primary))] border-opacity-20 shadow-sm backdrop-blur-sm">
                <span className="text-xl font-bold text-[rgb(var(--color-primary))] tracking-wide">
                  DragBizz
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[rgb(var(--color-text-primary))]">
              Easily manage purchase orders in 10 seconds 😉
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6 text-lg">
              and share them with your suppliers!
            </p>
            <button className="bg-[rgb(var(--color-primary))] hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Try now for free 🚀
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-[rgb(var(--color-text-secondary))] text-sm">
            <p className="font-semibold">
              Powered by{" "}
              <span className="text-[rgb(var(--color-primary))] font-bold">
                DragBizz
              </span>
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <a
                href="#"
                className="hover:text-[rgb(var(--color-text-primary))]"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-[rgb(var(--color-text-primary))]"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>

        {/* Side Drawer */}
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          title={`Purchase Order #${purchaseOrder?.poNumber || purchaseOrder?.billNumber || purchaseOrderId}`}
          showDownloadButton={true}
          onDownload={handleDownload}
          width="w-1/2"
        >
          {purchaseOrder && (
            <PurchaseOrderDetails purchaseOrder={purchaseOrder} />
          )}
        </SideDrawer>
      </div>
    </ThemeProvider>
  );
};

export default ViewPurchaseOrder;
