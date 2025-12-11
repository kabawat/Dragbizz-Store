"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Building2, User, Calendar, IndianRupee, AlertTriangle, CheckCircle, Clock, Percent, Download } from 'lucide-react';
import { invoiceService } from '@/service/retailer';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { getStatusBadge as getCommonStatusBadge } from '@/utils/statusBadge';

const ViewInvoicePublic = ({ invoiceId }) => {
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) return;
      try {
        setLoading(true);
        const result = await invoiceService.getPublicInvoice(invoiceId);
        if (result.success && result.data) {
          setInvoice(result.data);
        } else {
          setError('Invoice not found');
        }
      } catch (err) {
        setError('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  const formatDate = (date) => (date ? new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '-');
  const formatAddress = (addr) => {
    if (!addr) return 'N/A';
    if (typeof addr === 'string') return addr;
    if (typeof addr === 'object') {
      const { line1, line2, city, state, pincode, country, location, ...rest } = addr;
      const parts = [
        line1,
        line2,
        city,
        state,
        pincode,
        country,
        location,
      ].filter(Boolean);
      // Include other fields if present
      const extra = Object.values(rest || {}).filter(Boolean);
      return [...parts, ...extra].join(', ') || 'N/A';
    }
    return String(addr);
  };

  const handleDownload = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const getStatusBadge = (status, type) => {
    const config = getCommonStatusBadge(status, type || 'invoice');
    const variant = config.variant || 'secondary';
    const colorMap = {
      success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
      danger: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
      warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
      primary: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
      secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700',
    };
    const iconMap = {
      PAID: CheckCircle,
      UNPAID: AlertTriangle,
      PAY_LATTER: Clock,
      RELEASED: CheckCircle,
      DRAFT: Clock,
      CANCELLED: AlertTriangle,
    };
    return {
      text: config.text,
      Icon: iconMap[(status || '').toUpperCase()] || Clock,
      color: colorMap[variant] || colorMap.secondary,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">Loading Invoice...</h2>
          <p className="text-[rgb(var(--color-text-secondary))]">Please wait while we fetch the details</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">Invoice Not Found</h2>
          <p className="text-[rgb(var(--color-text-secondary))]">{error || 'The invoice you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  const paymentBadge = getStatusBadge(invoice.paymentStatus, 'invoice');
  const invoiceBadge = getStatusBadge(invoice.invoiceStatus, 'invoice');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] relative">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] opacity-5">
          <svg className="w-full h-full" viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z" fill="currentColor" className="text-[rgb(var(--color-primary))]"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-3">
              Invoice #{invoice.invoiceNumber || invoice.publicId || invoiceId}
            </h1>
            <p className="text-lg text-[rgb(var(--color-text-secondary))]">
              Thank you for your business!
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgb(var(--color-primary))] text-white hover:opacity-90 transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                Download / Print
              </button>
            </div>
          </div>

          {/* Invoice Card */}
          <div className="bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-2xl shadow-sm p-10 max-w-5xl w-full mb-8">
            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${invoiceBadge.color}`}>
                <invoiceBadge.Icon className="w-4 h-4 mr-1" />
                {invoiceBadge.text}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${paymentBadge.color}`}>
                <paymentBadge.Icon className="w-4 h-4 mr-1" />
                {paymentBadge.text}
              </span>
            </div>

            {/* Store & Customer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6">
                <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
                  Store Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">Store Name:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold text-right">{invoice.store?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">Phone:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold">{invoice.store?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">Email:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold">{invoice.store?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[rgb(var(--color-text-secondary))]">Address:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold text-right max-w-[60%]">
                      {formatAddress(invoice.store?.address)}
                    </span>
                  </div>
                  {invoice.store?.gstNumber && (
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">GST:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-semibold">{invoice.store.gstNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6">
                <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
                  Customer Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">Customer Name:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold text-right">{invoice.customer?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">Phone:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold">{invoice.customer?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">Email:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold break-all">{invoice.customer?.email || 'N/A'}</span>
                  </div>
                  {invoice.releasedAt && (
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Released:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-semibold">{formatDate(invoice.releasedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-lg overflow-hidden">
                <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                <div className="relative z-10">
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Subtotal</p>
                  <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">{formatCurrency(invoice.subtotal)}</p>
                </div>
              </div>
              <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-lg overflow-hidden">
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                <div className="relative z-10">
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">GST</p>
                  <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">{formatCurrency(invoice.gstAmount)}</p>
                </div>
              </div>
              <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-lg overflow-hidden">
                <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
                <div className="relative z-10">
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(invoice.totalAmount)}</p>
                </div>
              </div>
              <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-lg overflow-hidden">
                <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
                <div className="relative z-10">
                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Paid / Due</p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">Paid: {formatCurrency(invoice.paidAmount)}</p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">Due: {formatCurrency(invoice.dueAmount)}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            {invoice.items && invoice.items.length > 0 && (
              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))] mb-8">
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
                  Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))]">
                        <th className="py-2 text-left font-medium">Item</th>
                        <th className="py-2 text-left font-medium">Qty</th>
                        <th className="py-2 text-left font-medium">Price</th>
                        <th className="py-2 text-left font-medium">GST</th>
                        <th className="py-2 text-left font-medium">Discount</th>
                        <th className="py-2 text-left font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
                      {invoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 text-[rgb(var(--color-text-primary))]">
                            <div className="font-semibold">{item.name || 'Item'}</div>
                            {item.barcode && <div className="text-xs text-[rgb(var(--color-text-secondary))]">Barcode: {item.barcode}</div>}
                          </td>
                          <td className="py-2 text-[rgb(var(--color-text-primary))]">{item.quantity || 0}</td>
                          <td className="py-2 text-[rgb(var(--color-text-primary))]">{formatCurrency(item.price)}</td>
                          <td className="py-2 text-[rgb(var(--color-text-primary))]">{item.gstRate ? `${item.gstRate}%` : '0%'}</td>
                          <td className="py-2 text-[rgb(var(--color-text-primary))]">{item.discount ? `${item.discount}%` : '0%'}</td>
                          <td className="py-2 text-[rgb(var(--color-text-primary))]">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-[rgb(var(--color-text-secondary))] text-sm">
            <p className="font-semibold">Powered by <span className="text-[rgb(var(--color-primary))] font-bold">DragBizz</span></p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ViewInvoicePublic;
