"use client";

import { Input } from "@/components/ui";
import { Loader2, Search, User } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import KhataDueBadge from "./KhataDueBadge";

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function KhataCustomerPicker({
  customers = [],
  selectedCustomer,
  onSelect,
  search,
  onSearchChange,
  loading = false,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium mb-2 text-[rgb(var(--color-text-secondary))]">
          {t("khata.selectCustomer")}
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--color-text-secondary))]" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("khata.searchCustomer")}
            className="pl-10"
          />
        </div>
      </div>

      {selectedCustomer ? (
        <div className="rounded-xl border border-[rgb(var(--color-primary))]/30 bg-[rgb(var(--color-primary))]/5 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-[rgb(var(--color-primary))]/15 flex items-center justify-center text-sm font-semibold text-[rgb(var(--color-primary))]">
              {getInitials(selectedCustomer.name)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{selectedCustomer.name}</p>
              {selectedCustomer.phone ? (
                <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate">
                  {selectedCustomer.phone}
                </p>
              ) : null}
            </div>
          </div>
          <KhataDueBadge totalDue={selectedCustomer.account?.totalDue ?? selectedCustomer.totalDue} />
        </div>
      ) : null}

      <div className="max-h-56 overflow-y-auto rounded-xl border border-[rgb(var(--color-border-primary))] divide-y divide-[rgb(var(--color-border-primary))]">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-[rgb(var(--color-text-secondary))]">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            {t("common.loading")}
          </div>
        ) : customers.length ? (
          customers.map((customer) => {
            const id = customer.id ?? customer._id;
            const isSelected = (selectedCustomer?.id ?? selectedCustomer?._id) === id;
            const totalDue = customer.account?.totalDue ?? customer.totalDue ?? 0;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(customer)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                  isSelected
                    ? "bg-[rgb(var(--color-primary))]/10"
                    : "hover:bg-[rgb(var(--color-bg-secondary))]"
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center shrink-0">
                  {customer.name ? (
                    <span className="text-xs font-semibold">{getInitials(customer.name)}</span>
                  ) : (
                    <User className="h-4 w-4 text-[rgb(var(--color-text-secondary))]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {customer.name || t("common.notAvailable")}
                  </p>
                  {customer.phone ? (
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate">
                      {customer.phone}
                    </p>
                  ) : null}
                </div>
                <KhataDueBadge totalDue={totalDue} />
              </button>
            );
          })
        ) : (
          <p className="text-sm text-[rgb(var(--color-text-secondary))] px-4 py-6 text-center">
            {t("common.noResults")}
          </p>
        )}
      </div>
    </div>
  );
}

export default KhataCustomerPicker;
