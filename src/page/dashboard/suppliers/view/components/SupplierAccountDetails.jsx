"use client";
import React from 'react';
import moment from 'moment';
import {
  Wallet,
  IndianRupee,
  Receipt,
  CheckCircle,
  AlertCircle,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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
    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
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
        <div className="mt-6 pt-6 border-t border-[rgb(var(--color-border-primary))]">
          <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-4">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {account.creditUtilized !== undefined && (
              <div>
                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                  Credit Utilized
                </p>
                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  ₹
                  {account.creditUtilized?.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </p>
              </div>
            )}
            {account.paymentTerms && (
              <div>
                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                  Payment Terms
                </p>
                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  {account.paymentTerms?.replace("_", " ") || t("common.na")}
                </p>
              </div>
            )}
            {account.riskLevel && (
              <div>
                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                  Risk Level
                </p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    account.riskLevel === "LOW"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                      : account.riskLevel === "MEDIUM"
                        ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20"
                        : account.riskLevel === "HIGH"
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                  }`}
                >
                  {account.riskLevel}
                </span>
              </div>
            )}
            {account.riskScore !== undefined && (
              <div>
                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                  Risk Score
                </p>
                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  {account.riskScore || 0}/100
                </p>
              </div>
            )}
            {account.lastPaymentDate && (
              <div>
                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                  Last Payment Date
                </p>
                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  {moment(account.lastPaymentDate).format("DD MMM YYYY")}
                </p>
              </div>
            )}
            {account.lastPaymentAmount !== undefined && (
              <div>
                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                  Last Payment Amount
                </p>
                <p className="text-base font-semibold text-green-600 dark:text-green-400">
                  ₹
                  {account.lastPaymentAmount?.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </p>
              </div>
            )}
            {account.averagePaymentDays !== undefined && (
              <div>
                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                  Avg Payment Days
                </p>
                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  {account.averagePaymentDays || 0} days
                </p>
              </div>
            )}
            {account.totalTransactions !== undefined && (
              <div>
                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                  Total Transactions
                </p>
                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  {account.totalTransactions || 0}
                </p>
              </div>
            )}
            {account.averageTransactionValue !== undefined && (
              <div>
                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                  Avg Transaction Value
                </p>
                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  ₹
                  {account.averageTransactionValue?.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </p>
              </div>
            )}
            {account.totalOrders !== undefined && (
              <div>
                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                  Total Orders
                </p>
                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  {account.totalOrders || 0}
                </p>
              </div>
            )}
            {account.paidBills !== undefined && (
              <div>
                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                  Paid Bills
                </p>
                <p className="text-base font-semibold text-green-600 dark:text-green-400">
                  {account.paidBills || 0}
                </p>
              </div>
            )}
            {account.pendingBills !== undefined && (
              <div>
                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                  Pending Bills
                </p>
                <p className="text-base font-semibold text-orange-600 dark:text-orange-400">
                  {account.pendingBills || 0}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierAccountDetails;

