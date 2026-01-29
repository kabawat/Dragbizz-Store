"use client";
import Image from "next/image";
import { Building2, MapPin, Phone, Share2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui";
import { useSelector, useDispatch } from "react-redux";
import { setCartOpen } from "@/store/slices/publicCartSlice";

export default function CatalogHeader({ store, onShare, onCall }) {
    const dispatch = useDispatch();
    const cartCount = useSelector(state => state.publicCart.items.reduce((sum, item) => sum + item.quantity, 0));

    const onCartClick = () => dispatch(setCartOpen(true));
    return (
        <header className="bg-[rgb(var(--color-bg-primary))]/80 backdrop-blur-md border-b border-[rgb(var(--color-border-primary))]/50 shadow-sm transition-all h-16 sm:h-20">
            <div className="container mx-auto px-6 h-full flex items-center justify-between">
                {/* Store Info */}
                <div className="flex items-center gap-5">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[rgb(var(--color-bg-primary))]/20 bg-[rgb(var(--color-bg-primary))] shadow-xl flex-shrink-0 group">
                        {store.logo ? (
                            <Image
                                src={store.logo}
                                alt={store.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="56px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary))]/60">
                                <Building2 className="w-7 h-7 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-xl font-black text-[rgb(var(--color-text-primary))] tracking-tight leading-none mb-1.5 uppercase">
                            {store.name}
                        </h1>
                        <div className="flex items-center gap-2.5 text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest opacity-70">
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[rgb(var(--color-primary))]" />
                                <span>{store.address?.city}, {store.address?.state}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="md"
                        className="hidden md:flex gap-2 rounded-xl border border-[rgb(var(--color-border-primary))]/60 hover:bg-[rgb(var(--color-bg-secondary))] transition-all font-bold text-sm h-10 sm:h-11 px-5"
                        onClick={onShare}
                        aria-label="Share catalog"
                    >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                    </Button>

                    {/* Cart Button */}
                    <div className="relative">
                        <Button
                            variant="secondary"
                            size="md"
                            className="relative gap-2 bg-[rgb(var(--color-bg-primary))]/50 backdrop-blur-sm border border-[rgb(var(--color-border-primary))]/60 hover:bg-[rgb(var(--color-bg-secondary))] rounded-xl transition-all font-bold text-sm h-10 sm:h-11 px-6 active:scale-95 text-[rgb(var(--color-text-primary))]"
                            onClick={onCartClick}
                            aria-label="Open cart"
                        >
                            <ShoppingBag className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                            <span className="hidden sm:inline">My Cart</span>
                        </Button>
                        {cartCount > 0 && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[rgb(var(--color-primary))] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-[rgb(var(--color-bg-primary))] animate-in zoom-in-50">
                                {cartCount}
                            </div>
                        )}
                    </div>

                    {store.phone && (
                        <Button
                            variant="success"
                            size="md"
                            className="gap-2 bg-[rgb(var(--color-primary))] hover:brightness-110 text-white border-none shadow-lg shadow-[rgb(var(--color-primary))]/25 rounded-xl transition-all font-black text-sm h-11 px-6 active:scale-95"
                            onClick={onCall}
                            aria-label={`Call ${store.name}`}
                        >
                            <Phone className="w-4 h-4 fill-white/20" />
                            <span className="hidden sm:inline">Connect Store</span>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}

