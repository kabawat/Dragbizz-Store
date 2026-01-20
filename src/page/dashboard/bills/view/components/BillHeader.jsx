"use client";
import React from 'react';
import { Badge } from '@/components/ui';
import { AlertTriangle, CheckCircle2, Clock, Clock3 } from 'lucide-react';

export const getPaymentStatusBadge = (status, isOverdue = false) => {
  if (isOverdue) {
    return (
      <Badge variant="danger" className="flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Overdue
      </Badge>
    );
  }

  const statusConfig = {
    PAID: { variant: 'success', text: 'Paid', icon: CheckCircle2 },
    PARTIAL: { variant: 'warning', text: 'Partial', icon: Clock },
    UNPAID: { variant: 'secondary', text: 'Pending', icon: Clock3 }
  };

  const config = statusConfig[status] || { variant: 'secondary', text: status, icon: Clock };
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <IconComponent className="w-3 h-3" />
      {config.text}
    </Badge>
  );
};

const BillHeader = ({ billData, formatDate }) => {
  return (
    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
      <div className="px-6 py-6 border-b border-[rgb(var(--color-border-primary))]/40 bg-[rgb(var(--color-bg-secondary))]/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.5em] text-[rgb(var(--color-text-tertiary))]">Invoice</p>
            <div className="gap-3 text-[rgb(var(--color-text-primary))]">
              <div className="text-xl font-semibold">#{billData.billNumber || 'N/A'}</div>
              <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                Issued {formatDate(billData.billDate)} · Due {formatDate(billData.dueDate)}
              </div>
            </div>
          </div>
          <div className="flex md:justify-end">
            {getPaymentStatusBadge(billData.paymentStatus, billData.isOverdue)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillHeader;

