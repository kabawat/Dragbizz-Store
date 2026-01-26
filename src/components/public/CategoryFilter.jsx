"use client";


export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
    return (
        <div className="flex gap-2 overflow-x-auto w-full no-scrollbar pb-1">
            <button
                onClick={() => onCategoryChange("all")}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${selectedCategory === "all"
                    ? "bg-[rgb(var(--color-primary))] text-white"
                    : "bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border-primary))] hover:bg-[rgb(var(--color-bg-tertiary))]"
                    }`}
                aria-pressed={selectedCategory === "all"}
                aria-label="Show all products"
            >
                All Products
            </button>
            {categories.map((cat) => (
                <button
                    key={cat._id}
                    onClick={() => onCategoryChange(cat._id)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm capitalize ${selectedCategory === cat._id
                        ? "bg-[rgb(var(--color-primary))] text-white"
                        : "bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border-primary))] hover:bg-[rgb(var(--color-bg-tertiary))]"
                        }`}
                    aria-pressed={selectedCategory === cat._id}
                    aria-label={`Filter by ${cat.name}`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}
