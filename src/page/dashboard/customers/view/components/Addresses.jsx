"use client";
import { MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Addresses = ({ addresses }) => {
  const { t } = useTranslation();

  if (!addresses || (!addresses.billing && !addresses.shipping)) {
    return null;
  }

  return (
    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full flex items-center justify-center">
          <MapPin className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
            Addresses
          </h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            Billing and shipping addresses
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {addresses.billing && (
          <div className="border border-[rgb(var(--color-border-primary))]/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">
              Billing Address
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                    Address Line 1
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {addresses.billing.addressLine1 || t("common.na")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                    City
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {addresses.billing.city || t("common.na")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                    State
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {addresses.billing.state || t("common.na")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                    Pincode
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {addresses.billing.pincode || t("common.na")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                    Country
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {addresses.billing.country || t("common.na")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {addresses.shipping && (
          <div className="border border-[rgb(var(--color-border-primary))]/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">
              Shipping Address
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                    Address Line 1
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {addresses.shipping.addressLine1 || t("common.na")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                    City
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {addresses.shipping.city || t("common.na")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                    State
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {addresses.shipping.state || t("common.na")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                    Pincode
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {addresses.shipping.pincode || t("common.na")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                    Country
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {addresses.shipping.country || t("common.na")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;
