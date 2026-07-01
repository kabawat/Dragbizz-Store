"use client";
import { Edit, Eye, MoreVertical, Trash2, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CustomerSourceBadge from "@/components/customer/CustomerSourceBadge";
import KhataDueBadge from "@/components/khata/KhataDueBadge";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { formatDateDash, getRecordCreatedAt } from "@/utils/dateFormatter";

const CustomerTable = ({
  customers = [],
  onEdit,
  onDelete,
  onViewDetails,
  className = "",
  canEdit = true,
  canDelete = true,
}) => {
  const { t } = useTranslation();
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMenuId &&
        menuRefs.current[openMenuId] &&
        !menuRefs.current[openMenuId].contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleMenuToggle = (customerId) => {
    setOpenMenuId(openMenuId === customerId ? null : customerId);
  };

  const handleMenuAction = (customerId, action) => {
    setOpenMenuId(null);
    switch (action) {
      case "view": onViewDetails?.(customerId); break;
      case "edit": onEdit?.(customerId); break;
      case "delete": onDelete?.(customerId); break;
      default: break;
    }
  };

  return (
    <div className={`${className}`}>
      {/* Sticky Header */}
      <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-20">
        <table className="w-full min-w-[760px] table-fixed">
          <thead>
            <tr>
              <th className="w-[26%] px-6 py-4 text-left">
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                  {t("customers.customer")}
                </span>
              </th>
              <th className="w-[17%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("customers.phone")}
              </th>
              <th className="w-[22%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("customers.email")}
              </th>
              <th className="w-[17%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("customers.source")}
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("common.status")}
              </th>
              <th className="w-[4%] px-1 py-4 text-center">
                <MoreVertical className="w-4 h-4 mx-auto" />
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full min-w-[760px] table-fixed">
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]"
              >
                {/* Customer Column */}
                <td
                  className="w-[26%] px-6 py-4 cursor-pointer group/cell"
                  onClick={() => onViewDetails?.(customer.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/20 rounded-lg flex-shrink-0 flex items-center justify-center border border-[rgb(var(--color-primary))]/20 group-hover/cell:border-[rgb(var(--color-primary))]/40 transition-colors">
                      <Users className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm truncate group-hover/cell:text-[rgb(var(--color-primary))] transition-colors">
                          {customer.name || "N/A"}
                        </h3>
                        <KhataDueBadge totalDue={customer.account?.totalDue ?? customer.totalDue} />
                      </div>
                      <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {t("common.added")}:{" "}
                        {formatDateDash(getRecordCreatedAt(customer))}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Phone Column */}
                <td className="w-[17%] px-6 py-4">
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {customer.phone || "N/A"}
                  </span>
                </td>

                {/* Email Column */}
                <td className="w-[22%] px-6 py-4">
                  <span className="text-sm text-[rgb(var(--color-text-primary))]">
                    {customer.email || "N/A"}
                  </span>
                </td>

                {/* Source Column */}
                <td className="w-[17%] px-6 py-4">
                  <CustomerSourceBadge source={customer.source} />
                </td>

                {/* Status Column */}
                <td className="w-[14%] px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    customer.isActive === false
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : "bg-green-500/10 text-green-600 border-green-500/20"
                  }`}>
                    {customer.isActive === false ? t("common.inactive") : t("common.active")}
                  </span>
                </td>

                {/* Actions Column */}
                <td className="w-[4%] px-1 py-4 text-center">
                  <div
                    className="relative inline-block"
                    ref={(el) => (menuRefs.current[customer.id] = el)}
                  >
                    <button
                      onClick={() => handleMenuToggle(customer.id)}
                      className="p-1.5 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                      title={t("common.actions")}
                    >
                      <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                    </button>

                    {openMenuId === customer.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                        <button
                          onClick={() => handleMenuAction(customer.id, "view")}
                          className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors cursor-pointer focus:outline-none"
                        >
                          <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                          {t("common.viewDetails")}
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleMenuAction(customer.id, "edit")}
                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors cursor-pointer focus:outline-none"
                          >
                            <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                            {t("common.edit")}
                          </button>
                        )}
                        {canEdit && canDelete && (
                          <div className="border-t border-[rgb(var(--color-border-primary))] my-1" />
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleMenuAction(customer.id, "delete")}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors cursor-pointer focus:outline-none"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                            {t("common.delete")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
