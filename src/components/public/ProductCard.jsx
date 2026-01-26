"use client";
import { useState } from "react";
import Image from "next/image";
import { Package, MessageCircle, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui";


export default function ProductCard({ product, onWhatsAppShare, onBuyNow }) {
    const [imageError, setImageError] = useState(false);

    // Calculate discount percentage
    const discount = product.mrp > product.sellingPrice
        ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
        : 0;

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className="group relative flex flex-col bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-primary))] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
            {/* Image Area */}
            <div className="relative aspect-square bg-[rgb(var(--color-bg-tertiary))]/50 overflow-hidden">
                {product.images?.[0]?.url && !imageError ? (
                    <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={handleImageError}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[rgb(var(--color-text-tertiary))]">
                        <Package className="w-12 h-12 mb-2 opacity-20" />
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">No Preview</span>
                    </div>
                )}

                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute top-3 left-3">
                        <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg">
                            {discount}% OFF
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-1">
                <div className="mb-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-[9px] uppercase font-black px-1.5 py-0">
                            {typeof product.category === 'object' ? product.category.name : (product.category || 'Product')}
                        </Badge>
                        {product.brand && (
                            <span className="text-[10px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-tight truncate max-w-[80px]">
                                {product.brand}
                            </span>
                        )}
                    </div>
                    <h3 className="text-md font-bold text-[rgb(var(--color-text-primary))] line-clamp-2 leading-tight min-h-[2.5rem] mb-2 group-hover:text-[rgb(var(--color-primary))] transition-colors">
                        {product.name}
                    </h3>
                </div>

                {/* Pricing */}
                <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]/50 space-y-3">
                    <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-black text-[rgb(var(--color-text-primary))]">
                                ₹{product.sellingPrice.toLocaleString()}
                            </span>
                            {discount > 0 && (
                                <span className="text-xs font-semibold text-[rgb(var(--color-text-tertiary))] line-through opacity-70">
                                    ₹{product.mrp.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => onWhatsAppShare(product)}
                            className="flex items-center justify-center gap-2 py-3 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))] font-bold text-sm rounded-xl transition-all border border-[rgb(var(--color-border-primary))] active:scale-[0.98] cursor-pointer"
                            aria-label={`Chat about ${product.name}`}
                        >
                            <MessageCircle className="w-4 h-4 fill-current opacity-60" />
                            Chat
                        </button>
                        <button
                            onClick={() => onBuyNow(product)}
                            className="flex items-center justify-center gap-2 py-3 bg-[rgb(var(--color-primary))] hover:opacity-90 text-white font-black text-sm rounded-xl transition-all shadow-[0_4px_12px_rgba(var(--color-primary),0.3)] active:scale-[0.98] cursor-pointer"
                            aria-label={`Buy ${product.name}`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
