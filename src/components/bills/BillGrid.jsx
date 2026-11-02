"use client";
import { BillGridPresentation } from "@dragorbit/features/bills";

import BillCard from "./BillCard";

const BillGrid = ({
  bills,
  onEdit,
  onDelete,
  onViewDetails,
  isLoadingMore,
  openMenuId,
  onMenuToggle,
  onMenuAction,
  menuRefs,
  formatCurrency,
  formatDate,
}) => {
  return (
    <BillGridPresentation
      model={{
        bills,
        BillCard,
        onEdit,
        onDelete,
        onViewDetails,
        openMenuId,
        onMenuToggle,
        onMenuAction,
        menuRefs,
        formatCurrency,
        formatDate,
        isLoadingMore,
      }}
    />
  );
};

export default BillGrid;
