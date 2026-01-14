"use client"
import React from 'react';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui';
import { getStatusColor, getPaymentStatusColor } from '../utils/invoiceView.utils';
import { useTranslation } from '@/hooks/useTranslation';

const InvoiceSummaryCard = ({ invoiceData, calculatedSubtotal, calculatedGstAmount }) => {
    const { t } = useTranslation();
    
    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                            {invoiceData.invoiceNumber}
                        </h3>
                        <div className="flex space-x-1">
                            <Badge className={getStatusColor(invoiceData?.invoiceStatus)}>
                                {invoiceData?.invoiceStatus}
                            </Badge>
                            <Badge className={getPaymentStatusColor(invoiceData.paymentStatus)}>
                                {invoiceData.paymentStatus}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-[rgb(var(--color-primary))]">
                        ₹{invoiceData.totalAmount?.toLocaleString()}
                    </div>
                    <div className="text-xs text-[rgb(var(--color-text-secondary))]">{t('common.total')}</div>
                </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-[rgb(var(--color-border-primary))]">
                <div className="flex justify-between text-sm">
                    <span className="text-[rgb(var(--color-text-secondary))]">{t('invoices.customer')}:</span>
                    <span className="font-medium text-[rgb(var(--color-text-primary))] truncate max-w-24">
                        {invoiceData.customer?.name || t('invoices.walkInCustomer')}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-[rgb(var(--color-text-secondary))]">{t('invoices.subtotal')}:</span>
                    <span className="font-medium text-[rgb(var(--color-text-primary))]">
                        ₹{calculatedSubtotal?.toLocaleString()}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-[rgb(var(--color-text-secondary))]">{t('invoices.gst')}:</span>
                    <span className="font-medium text-[rgb(var(--color-text-primary))]">
                        ₹{calculatedGstAmount?.toLocaleString() || '0'}
                    </span>
                </div>
                {invoiceData.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-[rgb(var(--color-text-secondary))]">{t('invoices.discount')}:</span>
                        <span className="font-medium text-[rgb(var(--color-danger))]">
                            -₹{invoiceData.totalDiscount?.toLocaleString()}
                        </span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-[rgb(var(--color-text-secondary))]">{t('invoices.items')}:</span>
                    <span className="font-medium text-[rgb(var(--color-text-primary))]">
                        {invoiceData.items?.length || 0}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default InvoiceSummaryCard;

