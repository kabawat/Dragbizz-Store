import { Plus } from "lucide-react";

const fmt = (n) => `₹${Number(n).toFixed(2)}`;

export default function ProductCard({ product, onAdd, viewMode }) {
    const isGrid = viewMode === "grid";
    return (
        <button
            onClick={() => onAdd(product)}
            className={`group w-full relative bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-xl transition-all duration-200 hover:border-[rgb(var(--color-primary))] text-left overflow-hidden shrink-0 ${isGrid ? "p-3 flex flex-col gap-2 h-[150px]" : "p-3 flex items-center gap-4 h-auto"}`}
        >
            <div className={`bg-[rgb(var(--color-bg-secondary))] rounded-lg flex items-center justify-center flex-shrink-0 ${isGrid ? "w-full flex-1 text-3xl min-h-0" : "w-12 h-12 text-2xl"}`}>
                {product.emoji}
            </div>
            <div className={`min-w-0 ${isGrid ? "w-full" : "flex-1"}`}>
                <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate leading-tight">{product.name}</p>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5">SKU: {product.sku}</p>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-[rgb(var(--color-primary))]">{fmt(product.price)}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${product.stock < 10 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                        {product.stock} left
                    </span>
                </div>
            </div>
            {/* Add overlay */}
            <div className="absolute inset-0 bg-[rgb(var(--color-primary))]/0 group-hover:bg-[rgb(var(--color-primary))]/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-[rgb(var(--color-primary))] text-white rounded-full p-1 shadow-lg">
                    <Plus className="w-4 h-4" />
                </div>
            </div>
        </button>
    );
}
