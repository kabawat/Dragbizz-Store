"use client";
import {
  Building,
  Calendar,
  CreditCard,
  Edit,
  Eye,
  FileText,
  IndianRupee,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  getCategoryLabel,
  getPaymentMethodIcon,
  getPaymentMethodLabel,
  getStatusLabel,
} from "@/data/constants/expenses";
import { getStatusBadge } from "@/utils/statusBadge";

const ExpenseCard = ({
  expense,
  onEdit,
  onDelete,
  onView,
  isSelected = false,
  onSelect,
}) => {
  const {
    id,
    title,
    billNumber,
    date,
    category,
    amount,
    gst,
    netAmount,
    paymentMethod,
    vendor,
    status,
  } = expense;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadgeColor = (status) => {
    const config = getStatusBadge(status, "general");
    // Map variant to color name for Badge component
    const colorMap = {
      success: "green",
      warning: "yellow",
      danger: "red",
      secondary: "gray",
      primary: "blue",
    };
    return colorMap[config.variant] || "gray";
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? "ring-2 ring-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5"
          : ""
      }`}
      onClick={() => onSelect?.(id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-1">
              {title}
            </CardTitle>
            {billNumber && (
              <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">
                Bill: {billNumber}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Badge color={getStatusBadgeColor(status)} size="sm">
              {getStatusLabel(status)}
            </Badge>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-[rgb(var(--color-bg-secondary))]"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle menu toggle
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className="pt-0">
        <div className="space-y-3">
          {/* Amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IndianRupee className="h-4 w-4 text-[rgb(var(--color-text-secondary))]" />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                Amount
              </span>
            </div>
            <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
              ₹{formatCurrency(netAmount || amount)}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-[rgb(var(--color-text-secondary))]" />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                Date
              </span>
            </div>
            <span className="text-sm text-[rgb(var(--color-text-primary))]">
              {formatDate(date)}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-[rgb(var(--color-text-secondary))]" />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                Category
              </span>
            </div>
            <span className="text-sm text-[rgb(var(--color-text-primary))]">
              {getCategoryLabel(category?.name || category)}
            </span>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-[rgb(var(--color-text-secondary))]" />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                Payment
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm">
                {getPaymentMethodIcon(paymentMethod)}
              </span>
              <span className="text-sm text-[rgb(var(--color-text-primary))]">
                {getPaymentMethodLabel(paymentMethod)}
              </span>
            </div>
          </div>

          {/* Vendor */}
          {vendor && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-[rgb(var(--color-text-secondary))]" />
                <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Vendor
                </span>
              </div>
              <span className="text-sm text-[rgb(var(--color-text-primary))] truncate max-w-32">
                {vendor.name || vendor}
              </span>
            </div>
          )}

          {/* GST Info */}
          {gst && gst.amount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                  GST ({gst.percentage}%)
                </span>
              </div>
              <span className="text-xs text-[rgb(var(--color-text-primary))]">
                {formatCurrency(gst.amount)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-[rgb(var(--color-border-primary))]">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))]"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(expense);
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))]"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(expense);
            }}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[rgb(var(--color-danger))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(expense);
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default ExpenseCard;
