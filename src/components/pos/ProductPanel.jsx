import React, { useState, useMemo } from "react";
import { Search, Grid3X3, List, Package } from "lucide-react";
import { Select } from "@/components/ui";
import ProductCard from "./ProductCard";
import { CATEGORIES, PRODUCTS } from "@/page/dashboard/pos/data/mockData";

const ProductPanel = ({ addToCart }) => {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [viewMode, setViewMode] = useState("grid");

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter((p) => {
            const matchCat = selectedCategory === "all" || p.category === selectedCategory;
            const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
            return matchCat && matchSearch;
        });
    }, [search, selectedCategory]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3 min-h-0">
            {/* Search + View toggle */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" />
                        <input
                            type="text"
                            placeholder="Search product or SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-secondary))] focus:outline-none focus:border-[rgb(var(--color-primary))]"
                        />
                    </div>
                    {/* Category Filter */}
                    <div className="w-56">
                        <Select
                            value={selectedCategory}
                            onChange={(val) => setSelectedCategory(val)}
                            options={CATEGORIES.map(c => ({ label: c.name, value: c.id }))}
                            placeholder="All Categories"
                            className="h-[40px]"
                            searchable={true}
                        />
                    </div>
                </div>
                {/* View Mode */}
                <div className="flex items-center gap-1 bg-[rgb(var(--color-bg-secondary))] rounded-lg p-1">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-md transition-all ${viewMode === "grid"
                            ? "bg-[rgb(var(--color-primary))] text-white shadow-sm"
                            : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                            }`}
                    >
                        <Grid3X3 size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-md transition-all ${viewMode === "list"
                            ? "bg-[rgb(var(--color-primary))] text-white shadow-sm"
                            : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                            }`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Products grid/list */}
            <div className={`flex-1 overflow-y-auto min-h-0 custom-scrollbar ${viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 content-start"
                : "flex flex-col gap-2"
                }`}>
                {filteredProducts.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-[rgb(var(--color-text-secondary))]">
                        <Package className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">No products found</p>
                    </div>
                ) : (
                    filteredProducts.map((p) => (
                        <ProductCard key={p.id} product={p} onAdd={addToCart} viewMode={viewMode} />
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductPanel;
