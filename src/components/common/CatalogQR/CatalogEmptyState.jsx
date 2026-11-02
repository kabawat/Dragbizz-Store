import { ShoppingBag } from "lucide-react";
import React from "react";

const CatalogEmptyState = () => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-14 h-14 bg-[rgb(var(--color-bg-secondary))] rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-[rgb(var(--color-text-secondary))]" />
            </div>
            <h3 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-1">
                No Digital Shops Found
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))] max-w-sm">
                No active digital shops or catalogs were found for this store.
            </p>
        </div>
    );
};

export default CatalogEmptyState;

