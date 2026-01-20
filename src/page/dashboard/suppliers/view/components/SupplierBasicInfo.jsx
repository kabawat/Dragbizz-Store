"use client";
import React from 'react';
import { Building, Phone, Mail, Hash } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const SupplierBasicInfo = ({ supplierData }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
            <Building className="w-6 h-6 text-[rgb(var(--color-primary))]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
              Supplier Information
            </h2>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              Basic supplier details
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative p-4 bg-gradient-to-br from-[rgb(var(--color-primary))]/15 to-[rgb(var(--color-primary))]/10 dark:from-[rgb(var(--color-primary))]/5 dark:to-[rgb(var(--color-primary))]/3 rounded-xl overflow-hidden">
          <Building className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-[rgb(var(--color-primary))]/35 dark:!text-[rgb(var(--color-primary))] dark:opacity-40" />
          <div className="relative z-10">
            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
              Supplier Name
            </p>
            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
              {supplierData.name || t("common.na")}
            </p>
          </div>
        </div>

        <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-xl overflow-hidden">
          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
          <div className="relative z-10">
            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
              Phone Number
            </p>
            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
              {supplierData.phone || t("common.na")}
            </p>
          </div>
        </div>

        <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-xl overflow-hidden">
          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
          <div className="relative z-10">
            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
              Email Address
            </p>
            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))] break-all">
              {supplierData.email || t("common.na")}
            </p>
          </div>
        </div>

        {supplierData.agency && (
          <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-xl overflow-hidden">
            <Building className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
            <div className="relative z-10">
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                Agency
              </p>
              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                {supplierData.agency || t("common.na")}
              </p>
            </div>
          </div>
        )}

        {supplierData.gstNumber && (
          <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-xl overflow-hidden">
            <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
            <div className="relative z-10">
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                GST Number
              </p>
              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))] font-mono">
                {supplierData.gstNumber || t("common.na")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierBasicInfo;

