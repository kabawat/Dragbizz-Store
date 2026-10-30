import { Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import CatalogListItem from "./CatalogListItem";

const CatalogList = ({
    catalogs = [],
    selectedCatalogId,
    onSelectCatalog,
    onCopyCatalog,
    copiedId,
    title = "Digital Shops",
}) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCatalogs = useMemo(() => {
        if (!searchQuery.trim()) return catalogs;
        const q = searchQuery.toLowerCase().trim();
        return catalogs.filter(
            (c) =>
                c.name?.toLowerCase().includes(q) ||
                c.subdomain?.toLowerCase().includes(q) ||
                c.catalogId?.toLowerCase().includes(q)
        );
    }, [catalogs, searchQuery]);

    return (
        <div className="lg:col-span-5 flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-text-secondary))]">
                    {title} ({catalogs.length})
                </span>
                <span className="text-[11px] text-[rgb(var(--color-text-tertiary))]">
                    Click to view QR
                </span>
            </div>

            {catalogs.length > 4 && (
                <div className="relative mb-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))]" />
                    <input
                        type="text"
                        placeholder="Search catalogs…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary)/0.5)] focus:outline-none focus:border-[rgb(var(--color-primary))] text-[rgb(var(--color-text-primary))]"
                    />
                </div>
            )}

            <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredCatalogs.map((cat) => {
                    const isSelected =
                        cat.id === selectedCatalogId || cat.catalogId === selectedCatalogId;

                    return (
                        <CatalogListItem
                            key={cat.id || cat.catalogId}
                            catalog={cat}
                            isSelected={isSelected}
                            onSelect={() => onSelectCatalog(cat.id || cat.catalogId)}
                            onCopy={() => onCopyCatalog(cat)}
                            isCopied={copiedId === (cat.id || cat.catalogId)}
                        />
                    );
                })}

                {filteredCatalogs.length === 0 && (
                    <p className="text-xs text-[rgb(var(--color-text-tertiary))] text-center py-4">
                        No catalogs match your search.
                    </p>
                )}
            </div>
        </div>
    );
};

export default CatalogList;

