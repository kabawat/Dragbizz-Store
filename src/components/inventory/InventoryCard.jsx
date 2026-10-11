"use client";
import { InventoryCardView } from "@dragorbit/features/inventory";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getStatusBadge as getCommonStatusBadge } from "@/utils/statusBadge";
import { useTheme } from "../../contexts/ThemeContext";
import { Badge, IconButton } from "../ui";

const InventoryCard = ({
  inventory,
  onDelete,
  onDuplicate,
  onViewDetails,
  onStockIn,
  onSelect,
  selected = false,
  className = "",
  canEdit = false,
  canDelete = false,
  canCreate = false,
  ...props
}) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const { currentVariant, themeConfig } = useTheme();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getStatusBadge = (inventory) => {
    let status = "INACTIVE";
    if (inventory.status?.isOutOfStock) {
      status = "OUT_OF_STOCK";
    } else if (inventory.status?.isLowStock) {
      status = "LOW_STOCK";
    } else if (inventory.status?.isActive) {
      status = "ACTIVE";
    }

    const config = getCommonStatusBadge(status, "general");
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const config = getCommonStatusBadge(paymentStatus, "bill");
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getStockStatus = () => {
    const availableStock = inventory.stockSummary?.availableQuantity || 0;

    if (availableStock === 0)
      return { status: "out", color: "danger", text: t("products.outOfStock") };
    if (availableStock <= 10)
      return { status: "low", color: "warning", text: t("products.lowStock") };
    if (availableStock <= 50)
      return {
        status: "medium",
        color: "secondary",
        text: t("inventory.mediumStock"),
      };
    return { status: "good", color: "success", text: t("inventory.goodStock") };
  };

  const _stockStatus = getStockStatus();
  const profitMargin = inventory.pricingSummary?.profitMargin || 0;
  const totalValue = inventory.pricingSummary?.totalSellingValue || 0;

  const handleMenuToggle = (inventoryId) => {
    setOpenMenuId(openMenuId === inventoryId ? null : inventoryId);
  };

  const handleMenuAction = (inventoryId, action) => {
    setOpenMenuId(null);
    switch (action) {
      case "view":
        onViewDetails?.(inventoryId);
        break;
      case "stock-in":
        onStockIn?.(inventoryId);
        break;
      case "duplicate":
        onDuplicate?.(inventoryId);
        break;
      case "delete":
        onDelete?.(inventoryId);
        break;
      default:
        break;
    }
  };

  // Grid view - Modern Card Design
  return (
    <InventoryCardView
      model={{
        selected,
        className,
        props,
        onSelect,
        inventory,
        themeConfig,
        imageError,
        Image,
        setImageError,
        menuRef,
        IconButton,
        handleMenuToggle,
        openMenuId,
        handleMenuAction,
        t,
        canEdit,
        canCreate,
        canDelete,
        getStatusBadge,
        profitMargin,
        getPaymentStatusBadge,
        totalValue,
      }}
    />
  );
};

export default InventoryCard;
