"use client";

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
    return (
        <div className="relative">
            <div className="flex gap-8 overflow-x-auto w-full no-scrollbar pt-2 cursor-grab active:cursor-grabbing">
                <button
                    onClick={() => onCategoryChange("all")}
                    className={`flex-shrink-0 relative py-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 ${selectedCategory === "all"
                        ? "text-[rgb(var(--color-primary))]"
                        : "text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                        }`}
                    aria-pressed={selectedCategory === "all"}
                >
                    All Collection
                    {selectedCategory === "all" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[rgb(var(--color-primary))] rounded-full" />
                    )}
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        onClick={() => onCategoryChange(cat._id)}
                        className={`flex-shrink-0 relative py-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 capitalize ${selectedCategory === cat._id
                            ? "text-[rgb(var(--color-primary))]"
                            : "text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                            }`}
                        aria-pressed={selectedCategory === cat._id}
                    >
                        {cat.name}
                        {selectedCategory === cat._id && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[rgb(var(--color-primary))] rounded-full" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}



