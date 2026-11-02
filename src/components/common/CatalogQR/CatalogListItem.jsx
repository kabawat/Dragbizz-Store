import { Tooltip as SharedTooltip } from "@dragorbit/ui";
import { Check, Copy } from "lucide-react";
import React from "react";
import { getEffectiveSubdomain } from "./catalogQr.util";

const CatalogListItem = ({ catalog, isSelected, onSelect, onCopy, isCopied }) => {
    const displaySubdomain = getEffectiveSubdomain(catalog) || catalog.subdomain || catalog.catalogId;

    return (
        <div
            onClick={onSelect}
            className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-2 ${
                isSelected
                    ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))] ring-1 ring-[rgb(var(--color-primary))]/20 shadow-sm"
                    : "bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary)/0.4)] hover:border-[rgb(var(--color-border-primary))] hover:bg-[rgb(var(--color-bg-secondary))]/80"
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm text-[rgb(var(--color-text-primary))] truncate">
                            {catalog.name || "Digital Shop"}
                        </span>
                        {catalog.status && (
                            <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                    catalog.status === "ACTIVE"
                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                        : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                                }`}
                            >
                                {catalog.status}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate mt-1 font-mono">
                        {displaySubdomain}
                    </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <SharedTooltip content={isCopied ? "Copied" : "Copy Link"}>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCopy(e);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] transition-colors"
                        >
                            {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                                <Copy className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </SharedTooltip>
                </div>
            </div>
        </div>
    );
};

export default CatalogListItem;

