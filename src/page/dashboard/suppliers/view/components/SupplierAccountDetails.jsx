"use client";
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  IndianRupee,
  Receipt,
  TrendingUp,
  Wallet,
  ShieldCheck,
  CalendarDays,
  Activity,
  BarChart3,
  FileSpreadsheet,
  BadgeAlert,
  Clock,
  CircleDollarSign,
  TrendingDown,
  Layers
} from "lucide-react";
import moment from "moment";
import { useTranslation } from "@/hooks/ui/useTranslation";

const SupplierAccountDetails = ({ account }) => {
  const { t } = useTranslation();

  if (!account) return null;

  const hasAdditionalInfo =
    account.creditUtilized !== undefined ||
    account.paymentTerms ||
    account.riskLevel ||
    account.lastPaymentDate ||
    account.lastPaymentAmount !== undefined ||
    account.averagePaymentDays !== undefined ||
    account.totalTransactions !== undefined ||
    account.averageTransactionValue !== undefined ||
    account.riskScore !== undefined ||
    account.totalOrders !== undefined ||
    account.paidBills !== undefined ||
    account.pendingBills !== undefined;

  return (
    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl shadow-soft p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center">
          <Wallet className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
            Account Details
          </h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            Supplier purchase and payment information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-xl overflow-hidden">
          <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
          <div className="relative z-10">
            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
              Total Purchases
            </p>
            <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
              ₹
              {account.totalPurchases?.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              }) || "0.00"}
            </p>
          </div>
        </div>

        <div className="relative p-4 bg-gradient-to-br from-emerald-50/15 to-emerald-100/10 dark:from-emerald-900/5 dark:to-emerald-800/3 rounded-xl overflow-hidden">
          <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-emerald-500/35 dark:text-emerald-400/40" />
          <div className="relative z-10">
            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
              Total Paid
            </p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ₹
              {account.totalPaid?.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              }) || "0.00"}
            </p>
          </div>
        </div>

        <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-xl overflow-hidden">
          <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
          <div className="relative z-10">
            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
              Due Amount
            </p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              ₹
              {account.dueAmount?.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              }) || "0.00"}
            </p>
          </div>
        </div>

        <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-xl overflow-hidden">
          <Receipt
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-purple-500/35 dark:!text-purple-400"
            style={{ opacity: "0.4" }}
          />
          <div className="relative z-10">
            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
              Total Bills
            </p>
            <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
              {account.totalBills || 0}
            </p>
          </div>
        </div>

        {account.creditLimit !== undefined && (
          <div className="relative p-4 bg-gradient-to-br from-indigo-50/15 to-indigo-100/10 dark:from-indigo-900/5 dark:to-indigo-800/3 rounded-xl overflow-hidden">
            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-indigo-500/35 dark:!text-indigo-400 dark:opacity-40" />
            <div className="relative z-10">
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                Credit Limit
              </p>
              <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                ₹
                {account.creditLimit?.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                }) || "0.00"}
              </p>
            </div>
          </div>
        )}

        {account.availableCredit !== undefined && (
          <div className="relative p-4 bg-gradient-to-br from-teal-50/15 to-teal-100/10 dark:from-teal-900/5 dark:to-teal-800/3 rounded-xl overflow-hidden">
            <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-teal-500/35 dark:!text-teal-400 dark:opacity-40" />
            <div className="relative z-10">
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                Available Credit
              </p>
              <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                ₹
                {account.availableCredit?.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                }) || "0.00"}
              </p>
            </div>
          </div>
        )}

        {account.accountStatus && (
          <div className="relative p-4 bg-gradient-to-br from-gray-50/15 to-gray-100/10 dark:from-gray-900/5 dark:to-gray-800/3 rounded-xl overflow-hidden">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center">
              <div
                className={`w-8 h-8 rounded-full ${account.accountStatus === "ACTIVE" ? "bg-green-500/35 dark:!bg-green-400 dark:opacity-40" : account.accountStatus === "BLOCKED" ? "bg-red-500/35 dark:!bg-red-400 dark:opacity-40" : "bg-gray-500/35 dark:!bg-gray-400 dark:opacity-40"}`}
              ></div>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                Account Status
              </p>
              <p
                className={`text-lg font-bold ${account.accountStatus === "ACTIVE" ? "text-green-600 dark:text-green-400" : account.accountStatus === "BLOCKED" ? "text-red-600 dark:text-red-400" : "text-[rgb(var(--color-text-primary))]"}`}
              >
                {account.accountStatus || "ACTIVE"}
              </p>
            </div>
          </div>
        )}

        {account.onTimePaymentRate !== undefined && (
          <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-xl overflow-hidden">
            <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
            <div className="relative z-10">
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                On-Time Payment
              </p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {account.onTimePaymentRate || 0}%
              </p>
            </div>
          </div>
        )}
      </div>

      {hasAdditionalInfo && (
        <div className="mt-8 pt-6 border-t border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            <h3 className="text-sm font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              {t("common.additionalInformation", "Additional Information")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {account.paymentTerms && (
              <div className="p-3.5 rounded-xl bg-[rgb(var(--color-bg-secondary))] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest mb-0.5">
                    Payment Terms
                  </p>
                  <p className="text-[0.8125rem] font-[600] text-[rgb(var(--color-text-primary))]">
                    {account.paymentTerms?.replace("_", " ") || t("common.na")}
                  </p>
                </div>
              </div>
            )}

            {account.creditUtilized !== undefined && (
              <div className="p-3.5 rounded-xl bg-[rgb(var(--color-bg-secondary))] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest mb-0.5">
                    Credit Utilized
                  </p>
                  <p className="text-[0.8125rem] font-[600] text-[rgb(var(--color-text-primary))]">
                    ₹{account.creditUtilized?.toLocaleString("en-IN") || "0"}
                  </p>
                </div>
              </div>
            )}

            {account.riskLevel && (
              <div className="p-3.5 rounded-xl bg-[rgb(var(--color-bg-secondary))] flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${account.riskLevel === "LOW" ? "bg-emerald-500/10" :
                  account.riskLevel === "MEDIUM" ? "bg-yellow-500/10" : "bg-red-500/10"
                  }`}>
                  <ShieldCheck className={`w-4 h-4 ${account.riskLevel === "LOW" ? "text-emerald-500" :
                    account.riskLevel === "MEDIUM" ? "text-yellow-500" : "text-red-500"
                    }`} />
                </div>
                <div>
                  <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest mb-0.5">
                    Risk Level
                  </p>
                  <p className={`text-[0.8125rem] font-[600] ${account.riskLevel === "LOW" ? "text-emerald-600 dark:text-emerald-400" :
                    account.riskLevel === "MEDIUM" ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
                    }`}>
                    {account.riskLevel}
                  </p>
                </div>
              </div>
            )}

            {account.lastPaymentDate && (
              <div className="p-3.5 rounded-xl bg-[rgb(var(--color-bg-secondary))] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest mb-0.5">
                    Last Payment
                  </p>
                  <p className="text-[0.8125rem] font-[600] text-[rgb(var(--color-text-primary))]">
                    {moment(account.lastPaymentDate).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>
            )}

            {account.averagePaymentDays !== undefined && (
              <div className="p-3.5 rounded-xl bg-[rgb(var(--color-bg-secondary))] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest mb-0.5">
                    Avg Payment Cycle
                  </p>
                  <p className="text-[0.8125rem] font-[600] text-[rgb(var(--color-text-primary))]">
                    {account.averagePaymentDays} Days
                  </p>
                </div>
              </div>
            )}

            {account.totalTransactions !== undefined && (
              <div className="p-3.5 rounded-xl bg-[rgb(var(--color-bg-secondary))] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <BadgeAlert className="w-4 h-4 text-cyan-500" />
                </div>
                <div>
                  <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest mb-0.5">
                    Total Txns
                  </p>
                  <p className="text-[0.8125rem] font-[600] text-[rgb(var(--color-text-primary))]">
                    {account.totalTransactions}
                  </p>
                </div>
              </div>
            )}

            {account.paidBills !== undefined && (
              <div className="p-3.5 rounded-xl bg-[rgb(var(--color-bg-secondary))] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <CircleDollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest mb-0.5">
                    Paid Bills
                  </p>
                  <p className="text-[0.8125rem] font-[600] text-emerald-600">
                    {account.paidBills}
                  </p>
                </div>
              </div>
            )}

            {account.pendingBills !== undefined && (
              <div className="p-3.5 rounded-xl bg-[rgb(var(--color-bg-secondary))] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest mb-0.5">
                    Pending Bills
                  </p>
                  <p className="text-[0.8125rem] font-[600] text-orange-600">
                    {account.pendingBills}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierAccountDetails;
