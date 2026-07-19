import { Plus, Minus, Tag, Trash2 } from "lucide-react";

const fmt = (n) => `₹${Number(n).toFixed(2)}`;

export default function CartItem({ item, onIncrease, onDecrease, onRemove, onDiscount }) {
    const price = item.pricing?.sellingPrice || item.price || 0;
    const name = item.name || "Unknown Product";
    const emoji = item.emoji || item.icon || "📦";

    const getImageUrl = (images) => {
        const first = images?.[0];
        if (!first) return null;
        if (typeof first === "string") return first;
        if (typeof first === "object" && first.url) return first.url;
        return null;
    };

    const imageUrl = getImageUrl(item.images);

    const lineTotal = price * item.qty * (1 - item.discount / 100);
    return (
        <div className="flex items-start gap-2 py-3.5 transition-colors hover:bg-[rgb(var(--color-bg-secondary))]/30 group px-1 rounded-lg">
            <div className="w-10 h-10 bg-[rgb(var(--color-bg-secondary))] rounded-xl flex items-center justify-center text-lg flex-shrink-0 overflow-hidden border border-[rgb(var(--color-border-primary))]">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                    emoji
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[rgb(var(--color-text-primary))] truncate mb-0.5">{name}</p>
                <div className="flex items-center gap-2">
                    <span className="text-[0.625rem] font-medium text-[rgb(var(--color-text-secondary))]">{fmt(price)} / unit</span>
                    {item.discount > 0 && <span className="text-[0.625rem] font-bold text-red-500 bg-red-50 px-1 rounded">-{item.discount}%</span>}
                </div>

                {/* Qty & Discount Trigger */}
                <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
                        <button onClick={() => onDecrease(item.id)} className="w-7 h-7 flex items-center justify-center text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-border-primary))]/20 transition-all rounded-l-lg cursor-pointer">
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-[rgb(var(--color-text-primary))]">{item.qty}</span>
                        <button onClick={() => onIncrease(item.id)} className="w-7 h-7 flex items-center justify-center text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-border-primary))]/20 transition-all rounded-r-lg cursor-pointer">
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <button onClick={() => onDiscount(item.id)} className="flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-wider text-[rgb(var(--color-primary))] hover:opacity-80 transition-opacity cursor-pointer">
                        <Tag className="w-3 h-3" />
                        Discount
                    </button>
                </div>
            </div>
            <div className="flex flex-col items-end justify-between h-full py-0.5 gap-2">
                <button onClick={() => onRemove(item.id)} className="text-[rgb(var(--color-text-secondary))] hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-md cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                </button>
                <span className="text-sm font-black text-[rgb(var(--color-text-primary))] mt-auto">{fmt(lineTotal)}</span>
            </div>
        </div>
    );
}
