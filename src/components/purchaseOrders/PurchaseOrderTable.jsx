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
        const path = getShareUrl ? getShareUrl(row) : `/dashboard/purchase-orders/${row._id || row.id}`;
        return `${base}${path}`;
    };

    const handleCopy = async (text) => {
        try {
            if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(text);
        } catch { }
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
                            <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                                Total Amount
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
            <div className="overflow-auto min-h-[calc(100vh-400px)]">
                <table className="w-full min-w-[800px] table-fixed">
                    <tbody className="divide-y divide-gray-100">
                        {bills.map((row) => {
                            const statusBadge = getStatusBadge(row);
                            const StatusIcon = statusBadge.icon;
                            const isSelected = selectedBills.includes(row._id || row.id);

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
                                            <div>
                                                <div className="text-[rgb(var(--color-text-primary))] font-medium">
                                                    {row.supplier?.name || 'N/A'}
                                                </div>
                                                {(row.supplier?.phone || row.supplier?.email) && (
                                                    <div className="text-xs mt-0.5 flex items-center gap-1.5">
                                                        {row.supplier?.phone ? (
                                                            <>
                                                                <Phone className="w-3.5 h-3.5" style={{ color: 'rgb(var(--color-success))' }} />
                                                                <span className="text-[rgb(var(--color-text-secondary))]">{row.supplier.phone}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Mail className="w-3.5 h-3.5" style={{ color: 'rgb(var(--color-primary))' }} />
                                                                <span className="text-[rgb(var(--color-text-secondary))]">{row.supplier?.email}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="w-1/6 px-6 py-4 text-[rgb(var(--color-text-secondary))]">{formatDate(row.billDate)}</td>
                                    <td className="w-1/5 px-6 py-4 text-[rgb(var(--color-text-secondary))]">{formatDate(row.dueDate)}</td>
                                    <td className="w-1/6 px-6 py-4 font-medium text-[rgb(var(--color-text-primary))]">{formatCurrency(row.totalAmount)}</td>
                                    <td className="w-1/6 px-6 py-4 text-[rgb(var(--color-text-secondary))]">{formatCurrency(row.paidAmount || 0)}</td>
                                    <td className="w-1/6 px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                                            <StatusIcon className="w-3 h-3 mr-1" />
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
                                                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer" style={{ color: '#25D366' }}>
                                                                <MessageCircle className="w-4 h-4" /> WhatsApp
                                                            </button>
                                                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer" style={{ color: '#2563EB' }}>
                                                                <Mail className="w-4 h-4" /> Email
                                                            </button>
                                                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer" style={{ color: '#6B7280' }}>
                                                                <MessageSquare className="w-4 h-4" /> Message
                                                            </button>
                                                            <div className="my-1 border-t border-[rgb(var(--color-border-primary))]" />
                                                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer" style={{ color: '#7C3AED' }}>
                                                                <Copy className="w-4 h-4" /> Copy link
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
                                                        <button
                                                            onClick={() => onMenuAction(row._id || row.id, 'advancePayment')}
                                                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                                                        >
                                                            <IndianRupee className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                                            Advance Payment
                                                        </button>
                                                        <button
                                                            onClick={() => onMenuAction(row._id || row.id, 'createBill')}
                                                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                                                        >
                                                            <Receipt className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                                            Create Bill
                                                        </button>
                                                        <button
                                                            onClick={() => onMenuAction(row._id || row.id, 'edit')}
                                                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                                                        >
                                                            <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => onMenuAction(row._id || row.id, 'delete')}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
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


