"use client";
import { useState } from "react";
import Image from "next/image";
import { Package, MessageCircle, ShoppingBag, Zap, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui";

export default function ProductCard({ product, onWhatsAppShare, onUpdateQuantity, quantity = 0 }) {
    const [imageError, setImageError] = useState(false);

    const discount = product.mrp > product.sellingPrice
        ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
        : 0;

    const handleImageError = () => {
        setImageError(true);
    };

    const handleIncrement = () => onUpdateQuantity(product, quantity + 1);
    const handleDecrement = () => onUpdateQuantity(product, quantity - 1);

    const isOutOfStock = product.status === 'OUT_OF_STOCK';
    return (
        <div className="group flex flex-col bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]/40 hover:border-[rgb(var(--color-primary))]/30 transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(var(--color-primary),0.15)] h-full relative overflow-hidden">
            {/* Soft Glow Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--color-primary))]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            {/* Image Section */}
            <div className="relative aspect-square m-3 overflow-hidden rounded-xl bg-gradient-to-br from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))]">
                {product.images?.[0]?.url && !imageError ? (
                    <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={handleImageError}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[rgb(var(--color-text-tertiary))] opacity-50">
                        <Package className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Modern Select</span>
                    </div>
                )}

                {/* Badges - Vibrant & Glassy */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {discount > 0 && (
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 leading-none">
                            <Zap className="w-3 h-3 fill-white" />
                            {discount}% OFF
                        </div>
                    )}
                    {product.brand && (
                        <div className="bg-[rgb(var(--color-bg-primary))]/60 backdrop-blur-md text-[rgb(var(--color-text-primary))] text-[9px] font-bold px-3 py-1.5 rounded-lg border border-[rgb(var(--color-bg-primary))]/40 shadow-sm uppercase tracking-wider leading-none">
                            {product.brand}
                        </div>
                    )}
                    {isOutOfStock && (
                        <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-wider leading-none">
                            Out of Stock
                        </div>
                    )}
                </div>

                {/* Floating Enquire Icon - Top Right */}
                <button
                    onClick={() => onWhatsAppShare(product)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-[rgb(var(--color-bg-primary))]/80 backdrop-blur-md border border-[rgb(var(--color-bg-primary))]/40 flex items-center justify-center text-green-600 shadow-sm hover:shadow-green-500/20 hover:bg-green-600 hover:text-white transition-all duration-300 active:scale-90"
                    title="Enquire on WhatsApp"
                >
                    <MessageCircle className="w-5 h-5 flex-shrink-0" />
                </button>
            </div>

            {/* Content Section */}
            <div className="px-6 pb-6 pt-2 flex flex-col flex-1">
                <div className="space-y-1.5 mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[rgb(var(--color-primary))] block">
                        {typeof product.category === 'object' ? product.category.name : (product.category || 'New Arrival')}
                    </span>
                    <h3 className="text-md font-extrabold text-[rgb(var(--color-text-primary))] line-clamp-2 leading-snug tracking-tight min-h-[2.5rem]">
                        {product.name}
                    </h3>
                </div>

                {/* Price Display */}
                <div className="mt-auto flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-[rgb(var(--color-text-primary))] tracking-tighter">
                                    ₹{product.sellingPrice.toLocaleString()}
                                </span>
                                {discount > 0 && (
                                    <span className="text-xs font-medium text-[rgb(var(--color-text-tertiary))] line-through">
                                        ₹{product.mrp.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider leading-none border ${isOutOfStock ? 'bg-red-50 text-red-500 border-red-500/20' : 'bg-orange-50/10 text-orange-500 border-orange-500/20'}`}>
                            {isOutOfStock ? 'Sold Out' : 'Premium'}
                        </div>
                    </div>

                    {/* Action Area: Quantity Toggle */}
                    <div className="h-[52px] flex items-center">
                        {isOutOfStock ? (
                            <Button
                                disabled
                                className="w-full !py-4 !bg-gray-200 !text-gray-400 !font-black !text-[11px] !uppercase !tracking-widest !rounded-xl cursor-not-allowed"
                                leftIcon={Package}
                            >
                                Out of Stock
                            </Button>
                        ) : quantity === 0 ? (
                            <Button
                                onClick={() => onUpdateQuantity(product, 1)}
                                variant="primary"
                                className="w-full !py-4 !bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary))]/80 !text-white !font-black !text-[11px] !uppercase !tracking-widest !rounded-xl !transition-all hover:!shadow-lg hover:!shadow-[rgb(var(--color-primary))]/20 active:!scale-95"
                                leftIcon={ShoppingBag}
                            >
                                Add To Cart
                            </Button>
                        ) : (
                            <div className="w-full flex items-center justify-between bg-[rgb(var(--color-primary))]/5 p-1 rounded-xl border border-[rgb(var(--color-primary))]/10">
                                <button
                                    onClick={handleDecrement}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-[rgb(var(--color-bg-primary))] shadow-sm hover:bg-red-500/10 hover:text-red-500 text-[rgb(var(--color-text-primary))] transition-all active:scale-90"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-black text-[rgb(var(--color-text-primary))]">{quantity}</span>
                                    <span className="text-[8px] uppercase font-bold text-[rgb(var(--color-primary))] tracking-tighter">In Cart</span>
                                </div>
                                <button
                                    onClick={handleIncrement}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-[rgb(var(--color-bg-primary))] shadow-sm hover:bg-green-500/10 hover:text-green-600 text-[rgb(var(--color-text-primary))] transition-all active:scale-90"
                                    aria-label="Increase quantity"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
