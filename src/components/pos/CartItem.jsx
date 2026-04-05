import { Plus, Minus, X, Tag, Trash2 } from "lucide-react";

const fmt = (n) => `₹${Number(n).toFixed(2)}`;

export default function CartItem({ item, onIncrease, onDecrease, onRemove, onDiscount }) {
    const price = item.pricing?.sellingPrice || item.price || 0;
    const name = item.name || "Unknown Product";
    const emoji = item.emoji || item.icon || "📦";

    const lineTotal = price * item.qty * (1 - item.discount / 100);
    return (
        <div className="flex items-start gap-2 py-2.5 border-b border-[rgb(var(--color-border-primary))] last:border-0">
            <div className="w-8 h-8 bg-[rgb(var(--color-bg-secondary))] rounded-lg flex items-center justify-center text-base flex-shrink-0 overflow-hidden">
                {item.images?.[0] ? (
                    <img src={item.images[0]} alt={name} className="w-full h-full object-cover" />
                ) : (
                    emoji
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate">{name}</p>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">{fmt(price)} each</p>
                {/* Qty + Discount */}
                <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center gap-1 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                        <button onClick={() => onDecrease(item.id)} className="w-6 h-6 flex items-center justify-center text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors">
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-[rgb(var(--color-text-primary))]">{item.qty}</span>
                        <button onClick={() => onIncrease(item.id)} className="w-6 h-6 flex items-center justify-center text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors">
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                    <button onClick={() => onDiscount(item.id)} className="flex items-center gap-1 text-xs text-[rgb(var(--color-primary))] hover:underline">
                        <Tag className="w-3 h-3" />
                        {item.discount > 0 ? `${item.discount}%` : "Disc"}
                    </button>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1">
                <button onClick={() => onRemove(item.id)} className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-danger))] transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-[rgb(var(--color-text-primary))]">{fmt(lineTotal)}</span>
            </div>
        </div>
    );
}
