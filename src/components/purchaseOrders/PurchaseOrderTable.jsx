"use client"
import React, { useEffect, useState, useRef } from 'react';
import {
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Building2,
    Send,
    MessageCircle,
    Mail,
    MessageSquare,
    Copy,
    Phone,
    IndianRupee,
    Receipt
} from 'lucide-react';
import { AddActionButton } from '@/components/ui';

const PurchaseOrderTable = ({
    bills,
    selectedBills,
    onSelect,
    onSelectAll,
    onEdit,
    onDelete,
    onViewDetails,
    loading,
    emptyMessage = "No purchase orders found",
    hasMore,
    onLoadMore,
    isLoadingMore,
    openMenuId,
    onMenuToggle,
    onMenuAction,
    menuRefs,
    getStatusBadge,
    formatCurrency,
    formatDate,
    enableSendMenu = true,
    getShareUrl
}) => {
    const [openSendMenuId, setOpenSendMenuId] = useState(null);
    const sendMenuRefs = useRef({});

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                openSendMenuId &&
                sendMenuRefs.current[openSendMenuId] &&
                !sendMenuRefs.current[openSendMenuId].contains(event.target)
            ) {
                setOpenSendMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openSendMenuId]);

    const buildShareUrl = (row) => {
        if (typeof window === 'undefined') return '';
        const base = window.location.origin;
        // Use publicId for public sharing, fallback to _id if publicId doesn't exist
        const publicId = row.publicId || row._id || row.id;
        const path = `/view/purchase-order/${publicId}`;
        return `${base}${path}`;
    };

    const handleCopy = async (text) => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                // You can add a toast notification here
            }
        } catch (error) {
        }
    };

    const handleWhatsAppShare = (row) => {
        const shareUrl = buildShareUrl(row);
        const message = `Hello *${row.supplier?.name || 'Supplier'}*, Thanks for your business! *Purchase Order: ${row.billNumber || row.poNumber || 'N/A'}* *Link:* ${shareUrl} Thanks *${row.store?.name || 'DragBizz Store'}* *${row.store?.phone || 'N/A'}* Sent using *DragBizz: Simple Store Management* (dragbizz.com)`;

        // Get supplier's phone number and format it for WhatsApp
        const supplierPhone = row.supplier?.phone;
        if (supplierPhone) {
            // Remove any non-digit characters and ensure it starts with country code
            const cleanPhone = supplierPhone.replace(/\D/g, '');
            const whatsappPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
            window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            // Fallback to general WhatsApp if no phone number
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        }

        setOpenSendMenuId(null);
    };

    const handleCopyLink = (row) => {
        const shareUrl = buildShareUrl(row);
        handleCopy(shareUrl);
        setOpenSendMenuId(null);
    };

    return (
        <div className="h-full">
            {/* Fixed Header */}
            <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-20">
                <table className="w-full min-w-[800px] table-fixed">
                    <thead>
                        <tr>
                            <th className="w-1/6 px-6 py-4 text-left">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedBills.length === bills.length && bills.length > 0}
                                        onChange={(e) => onSelectAll(e.target.checked)}
                                        className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                                    />
                                    <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                                        PO
                                    </span>
                                </div>
                            </th>
                            <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                                Supplier
                            </th>
                            <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                                PO Date
                            </th>
                            <th className="w-1/5 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                                Expected Delivery
                            </th>
                            <th className="w-28 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                                Items
                            </th>
                            <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                                Advance Paid
                            </th>
                            <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                                Approval Status
                            </th>
                            <th className="w-50 py-4 text-center">
                                Actions
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-auto min-h-[calc(100vh-300px)]">
                <table className="w-full min-w-[800px] table-fixed">
                    <tbody className="divide-y divide-gray-100">
                        {bills.map((row) => {
                            const statusBadge = getStatusBadge(row);
                            const StatusIcon = statusBadge.icon;
                            const isSelected = selectedBills.includes(row._id || row.id);
                            const poStatus = (row.status || '').toUpperCase();
                            const isDeleted = poStatus === 'DELETED';

                            // Check if advance payment has been made
                            const advanceAmount = row.advanceAmount ?? 0;
                            const totalQuantity = row.totalQuantity ?? row.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0;
                            const receivedQuantity = row.receivedQuantity ?? row.items?.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0) ?? 0;
                            const pendingQuantity = row.pendingQuantity ?? Math.max(totalQuantity - receivedQuantity, 0);
                            const hasAdvancePayments = (row.payments || []).some(
                                payment => payment.paymentType === 'ADVANCE_PAYMENT'
                            );
                            const hasAdvancePayment = advanceAmount > 0 || hasAdvancePayments;

                            return (
                                <tr
                                    key={row._id || row.id || row.billNumber}
                                    className={`group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] ${isSelected ? 'bg-[rgb(var(--color-bg-tertiary))] border-l-4 border-l-[rgb(var(--color-primary))]' : ''}`}
                                >
                                    <td className="w-1/6 px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onSelect(row._id || row.id)}
                                                className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                                            />
                                            <div className="font-medium text-[rgb(var(--color-text-primary))]">{row.billNumber}</div>
                                        </div>
                                    </td>
                                    <td className="w-1/6 px-6 py-4">
                                        <div className="flex items-start">
                                            <Building2 className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] mr-2 mt-0.5" />
                                            <div className="text-[rgb(var(--color-text-primary))] font-medium">
                                                {row.supplier?.name || 'N/A'}
                                            </div>
                                        </div>
  
                                        <div>
                                            {(row.supplier?.phone || row.supplier?.email) && (
                                                <div className="text-xs mt-0.5 flex items-center justify-start gap-1.5">
                                                    {row.supplier?.phone ? (
                                                        <>
                                                            <Phone className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
                                                            <span className="text-[rgb(var(--color-text-secondary))]">{row.supplier.phone}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Mail className="w-3.5 h-3.5 text-[rgb(var(--color-primary))]" />
                                                            <span className="text-[rgb(var(--color-text-secondary))]">{row.supplier?.email}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="w-1/6 px-6 py-4 text-[rgb(var(--color-text-secondary))]">{formatDate(row.billDate)}</td>
                                    <td className="w-1/5 px-6 py-4 text-[rgb(var(--color-text-secondary))]">{formatDate(row.dueDate)}</td>
                                    <td className="w-28 px-6 py-4">
                                        <div className="text-sm text-[rgb(var(--color-text-primary))] font-medium">
                                            {receivedQuantity}/{totalQuantity || 0}
                                        </div>
                                        {totalQuantity > 0 && (
                                            <div className="w-full h-1.5 bg-[rgb(var(--color-bg-tertiary))] rounded-full mt-1">
                                                <div
                                                    className="h-full rounded-full bg-[rgb(var(--color-primary))]"
                                                    style={{ width: `${Math.min(100, Math.round((receivedQuantity / totalQuantity) * 100))}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="w-1/6 px-6 py-4 text-[rgb(var(--color-text-secondary))]">{formatCurrency(advanceAmount)}</td>
                                    <td className="w-1/6 px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                                            <StatusIcon className="w-3 h-3 mr-1 currentColor" />
                                            {statusBadge.text}
                                        </span>
                                    </td>
                                    <td className="w-50 py-4 text-center">
                                        <div className="relative inline-flex items-center gap-2">
                                            {enableSendMenu && (
                                                <div className="relative" ref={(el) => (sendMenuRefs.current[row._id || row.id] = el)}>
                                                    <AddActionButton
                                                        onClick={() => setOpenSendMenuId(openSendMenuId === (row._id || row.id) ? null : (row._id || row.id))}
                                                        Icon={Send}
                                                        label="Send"
                                                        size="sm"
                                                        title="Send"
                                                        className="h-9 px-3 rounded-lg"
                                                    />
                                                    {openSendMenuId === (row._id || row.id) && (
                                                        <div className="absolute right-0 top-full mt-1 w-44 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                                                            <button
                                                                className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200"
                                                                onClick={() => handleWhatsAppShare(row)}
                                                            >
                                                                <MessageCircle className="w-4 h-4 text-green-500 dark:text-green-400" /> WhatsApp
                                                            </button>
                                                            <button className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200">
                                                                <Mail className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Email
                                                            </button>
                                                            <button className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200">
                                                                <MessageSquare className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" /> Message
                                                            </button>
                                                            <div className="my-1 border-t border-[rgb(var(--color-border-primary))]" />
                                                            <button
                                                                className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200"
                                                                onClick={() => handleCopyLink(row)}
                                                            >
                                                                <Copy className="w-4 h-4 text-purple-500 dark:text-purple-400" /> Copy link
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="relative inline-block" ref={(el) => (menuRefs.current[row._id || row.id] = el)}>
                                                <button
                                                    onClick={() => onMenuToggle(row._id || row.id)}
                                                    className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                                                    title="More Actions"
                                                >
                                                    <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                                                </button>

                                                {/* Popup Menu */}
                                                {openMenuId === (row._id || row.id) && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                                                        <button
                                                            onClick={() => onMenuAction(row._id || row.id, 'view')}
                                                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                                                        >
                                                            <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                                            View Details
                                                        </button>
                                                        {!hasAdvancePayment && !isDeleted && (
                                                            <button
                                                                onClick={() => onMenuAction(row._id || row.id, 'advancePayment')}
                                                                className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                                                            >
                                                                <IndianRupee className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                                                Advance Payment
                                                            </button>
                                                        )}
                                                        {!isDeleted && (
                                                            <button
                                                                onClick={() => onMenuAction(row._id || row.id, 'createBill')}
                                                                className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                                                            >
                                                                <Receipt className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                                                Create Bill
                                                            </button>
                                                        )}
                                                        {!isDeleted && (
                                                            <button
                                                                onClick={() => onMenuAction(row._id || row.id, 'edit')}
                                                                className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                                                            >
                                                                <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                                                Edit
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => onMenuAction(row._id || row.id, 'delete')}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10 dark:focus:bg-red-500/20"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Loading More Indicator */}
                {isLoadingMore && (
                    <div className="text-center py-4">
                        <div className="w-6 h-6 border-2 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more purchase orders...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseOrderTable;


