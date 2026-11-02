import { Tooltip as SharedTooltip } from "@dragorbit/ui";
import { Check, Copy, Download, ExternalLink, Printer } from "lucide-react";
import React from "react";
import { Button, Input } from "@/components/ui";

const CatalogDetailsPanel = ({
    catalog,
    store,
    displayUrl,
    inStoreLocation,
    onInStoreLocationChange,
    onCopy,
    isCopied,
    onDownloadPDF,
    onPrint,
    onView,
    marketingText,
    layout = "compact",
}) => {
    const isFull = layout === "full";
    const displayName = catalog?.name || store?.name || "Digital Shop";
    const address = store?.address;
    const addressString = address
        ? [address.line1, address.city, address.state, address.pincode].filter(Boolean).join(", ")
        : "";

    return (
        <div className={`flex flex-col ${isFull ? "space-y-5" : "space-y-4"} w-full`}>
            {/* Header info */}
            <div className={`space-y-1.5 ${isFull ? "text-center md:text-left" : "text-center sm:text-left"}`}>
                <div className={`flex items-center gap-2 flex-wrap ${isFull ? "justify-center md:justify-start" : "justify-center sm:justify-start"}`}>
                    <h3 className={`${isFull ? "text-2xl sm:text-3xl" : "text-xl"} font-bold text-[rgb(var(--color-text-primary))] tracking-tight truncate`}>
                        {displayName}
                    </h3>
                    {catalog?.status && (
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                catalog.status === "ACTIVE"
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                            }`}
                        >
                            {catalog.status}
                        </span>
                    )}
                </div>

                {addressString && (
                    <p className={`${isFull ? "text-sm text-[rgb(var(--color-text-secondary))]" : "text-xs text-[rgb(var(--color-text-secondary))] line-clamp-2"}`}>
                        {addressString}
                    </p>
                )}

                {marketingText && (
                    <p className={`${isFull ? "text-sm" : "text-xs"} font-medium text-[rgb(var(--color-text-secondary))]`}>
                        {marketingText}
                    </p>
                )}
            </div>

            {/* Optional In-Store Location Field */}
            <div>
                <Input
                    label="In-Store Dining Location (Optional)"
                    placeholder="e.g. Table 4, Counter A"
                    value={inStoreLocation}
                    onChange={onInStoreLocationChange}
                    hint={
                        isFull
                            ? "If you enter an in-store location, the QR code will act as an in-store ordering code (No delivery/OTP required)."
                            : "If you enter an in-store location, the QR code will act as an in-store ordering code."
                    }
                    className="w-full"
                />
            </div>

            {/* Shareable Link Box */}
            <div className={`bg-[rgb(var(--color-bg-secondary))] ${isFull ? "p-4" : "p-3"} rounded-xl border border-[rgb(var(--color-border-primary)/0.4)] flex items-center justify-between gap-3`}>
                <div className="flex flex-col truncate min-w-0">
                    <span className="text-[0.625rem] uppercase tracking-widest font-bold text-[rgb(var(--color-text-tertiary))] mb-0.5">
                        Digital Shop URL
                    </span>
                    <code className="text-[0.8125rem] text-[rgb(var(--color-primary))] font-mono font-bold truncate">
                        {displayUrl || "N/A"}
                    </code>
                </div>
                <SharedTooltip content={isCopied ? "Copied" : "Copy Link"}>
                    <button
                        onClick={onCopy}
                        className={`flex-shrink-0 ${isFull ? "p-2.5" : "p-2"} rounded-lg transition-colors active:scale-95 ${
                            isCopied
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:text-white"
                        }`}
                    >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                </SharedTooltip>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="outline"
                    className={`${isFull ? "h-10" : "h-9"} text-xs font-bold text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))]"}`}
                    onClick={onDownloadPDF}
                    leftIcon={Download}
                >
                    Download PDF
                </Button>
                <Button
                    variant="outline"
                    className={`${isFull ? "h-10" : "h-9"} text-xs font-bold text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))]"}`}
                    onClick={onPrint}
                    leftIcon={Printer}
                >
                    Print QR
                </Button>
            </div>

            <Button
                variant="primary"
                className={`w-full ${isFull ? "h-11 text-sm tracking-wider" : "h-10 text-xs tracking-wider"} font-bold uppercase bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-white`}
                onClick={onView}
                leftIcon={ExternalLink}
            >
                Visit Digital Shop
            </Button>
        </div>
    );
};

export default CatalogDetailsPanel;

