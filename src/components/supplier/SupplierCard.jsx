"use client";
import { SupplierCardView } from "@dragorbit/features/suppliers";

import { Edit, Eye, Printer, Trash2 } from "lucide-react";
import { useCallback } from "react";
import CopyableContactValue from "@/components/common/CopyableContactValue";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useTheme } from "../../contexts/ThemeContext";
import { IconButton } from "../ui";

const SupplierCard = ({
  supplier,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onPrint,
  className = "",
  canEdit = true,
  canDelete = true,
  ...props
}) => {
  const { t } = useTranslation();
  const { menu, menuRefs, closeMenu, toggleDropdown } = useRowActionMenu();
  const { currentVariant, themeConfig } = useTheme();

  const handleMenuAction = useCallback(
    (supplierId, action) => {
      closeMenu();
      switch (action) {
        case "view":
          onViewDetails?.(supplierId);
          break;
        case "print":
          onPrint?.(supplierId);
          break;
        case "edit":
          onEdit?.(supplierId);
          break;
        case "delete":
          onDelete?.(supplierId);
          break;
        default:
          break;
      }
    },
    [closeMenu, onViewDetails, onPrint, onEdit, onDelete],
  );

  const buildMenuItems = useCallback(
    (rowId) => {
      const run = (action) => () => handleMenuAction(rowId, action);
      const items = [
        {
          key: "view",
          label: t("common.viewDetails"),
          icon: Eye,
          onClick: run("view"),
        },
      ];
      if (onPrint) {
        items.push({
          key: "print",
          label: t("common.print"),
          icon: Printer,
          onClick: run("print"),
        });
      }
      if (canEdit) {
        items.push({
          key: "edit",
          label: t("common.edit"),
          icon: Edit,
          onClick: run("edit"),
        });
      }
      if (canEdit && canDelete) {
        items.push({ type: "separator" });
      }
      if (canDelete) {
        items.push({
          key: "delete",
          label: t("common.delete"),
          icon: Trash2,
          tone: "danger",
          onClick: run("delete"),
        });
      }
      return items;
    },
    [t, onPrint, canEdit, canDelete, handleMenuAction],
  );

  // Grid view - Modern Card Design
  return (
    <SupplierCardView
      model={{
        className,
        props,
        menuRefs,
        supplier,
        IconButton,
        toggleDropdown,
        menu,
        RowActionsMenu,
        buildMenuItems,
        themeConfig,
        t,
        CopyableContactValue,
      }}
    />
  );
};

export default SupplierCard;
