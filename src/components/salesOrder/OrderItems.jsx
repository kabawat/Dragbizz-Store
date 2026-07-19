import React from "react";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

const OrderItems = ({ order }) => {
    const { t } = useTranslation();

    return (
        <div className="w-full">
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary)/0.5)] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-[rgb(var(--color-border-primary)/0.5)] bg-[rgb(var(--color-bg-secondary))]/30 flex justify-between items-center">
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">{t("salesOrder.orderItems")}</h2>
                    <Badge variant="outline" className="font-bold text-[0.625rem] uppercase tracking-wider">{order.items.length} {t("common.products")}</Badge>
                </div>
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[rgb(var(--color-bg-secondary))]/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[0.625rem] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">{t("common.product")}</th>
                                <th className="px-6 py-4 text-center text-[0.625rem] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">{t("products.qty")}</th>
                                <th className="px-6 py-4 text-right text-[0.625rem] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">{t("common.price")}</th>
                                <th className="px-6 py-4 text-right text-[0.625rem] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">{t("invoice.gst")}</th>
                                <th className="px-6 py-4 text-right text-[0.625rem] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">{t("common.total")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">

                            {(order.items || []).map((item, idx) => (
                                <tr key={idx} className="group hover:bg-[rgb(var(--color-bg-secondary))]/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary)/0.5)] overflow-hidden flex-shrink-0">
                                                {item.product?.images?.[0] ? (
                                                    <img
                                                        src={item.product.images[0].url || item.product.images[0]}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-[rgb(var(--color-text-tertiary))] opacity-50" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{item.product?.name || item.name}</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {item.product?.sku && (
                                                        <span className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] font-mono uppercase tracking-tight bg-[rgb(var(--color-bg-secondary))] px-1.5 py-0.5 rounded">{t("common.sku")}: {item.product.sku}</span>
                                                    )}
                                                    {item.product?.barcode && (
                                                        <span className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] font-mono uppercase tracking-tight bg-[rgb(var(--color-bg-secondary))] px-1.5 py-0.5 rounded">{t("common.barcode")}: {item.product.barcode}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-medium text-[rgb(var(--color-text-secondary))]">{item.quantity}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium text-[rgb(var(--color-text-secondary))]">₹{item.price.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                                        {(item.gst || item.gstAmount > 0) ? (
                                            <div className="flex flex-col items-end">
                                                <span>₹{(item.gstAmount || item.gst?.breakdown?.total || 0).toLocaleString()}</span>
                                                <span className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))]">({item.gstRate || item.gst?.rate || 0}%)</span>
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-[rgb(var(--color-text-primary))]">₹{(item.total || item.totalAmount || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-[rgb(var(--color-bg-secondary))]/50 flex justify-end">
                    <div className="w-full md:w-80 space-y-3">
                        <div className="flex justify-between text-xs font-semibold text-[rgb(var(--color-text-secondary))]">
                            <span>{t("invoice.subtotal")}</span>
                            <span className="text-[rgb(var(--color-text-primary))]">₹{order.financials?.subtotal?.toLocaleString() || order.subtotal?.toLocaleString()}</span>
                        </div>
                        {order.financials?.totalDiscount > 0 && (
                            <div className="flex justify-between text-xs font-semibold text-[rgb(var(--color-primary))]">
                                <span>{t("products.discount")}</span>
                                <span>-₹{order.financials.totalDiscount.toLocaleString()}</span>
                            </div>
                        )}
                        {order.financials?.gstAmount > 0 && (
                            <div className="flex justify-between text-xs font-semibold text-[rgb(var(--color-text-secondary))]">
                                <span>{t("invoice.gst")}</span>
                                <span className="text-[rgb(var(--color-text-primary))]">₹{order.financials.gstAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="border-t border-[rgb(var(--color-border-primary)/0.5)] pt-3 flex justify-between items-center">
                            <span className="font-bold text-[rgb(var(--color-text-primary))] text-sm uppercase tracking-wider">{t("salesOrder.netAmount")}</span>
                            <span className="font-bold text-[rgb(var(--color-primary))] text-2xl">₹{order.financials?.totalAmount?.toLocaleString() || order.total?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderItems;
