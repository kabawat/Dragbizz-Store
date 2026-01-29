"use client";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import SideDrawer from "@/components/ui/SideDrawer";
import { Button } from "@/components/ui";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { setCartOpen, updateCartQuantity } from "@/store/slices/publicCartSlice";

import { useRouter } from "next/navigation";

export default function CartDrawer({
    catalogId
}) {
    const router = useRouter();
    const dispatch = useDispatch();
    const isOpen = useSelector(state => state.publicCart.isOpen);
    const items = useSelector(state => state.publicCart.items);

    const onClose = () => dispatch(setCartOpen(false));
    const onUpdateQuantity = (productId, quantity) => dispatch(updateCartQuantity({ productId, quantity }));
    const subtotal = items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Bag Details"
            icon={ShoppingBag}
            width="w-full sm:w-[520px]"
        >
            <div className="flex flex-col h-full bg-[rgb(var(--color-bg-primary))] font-sans text-[rgb(var(--color-text-primary))]">
                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[rgb(var(--color-bg-primary))]">
                        <div className="w-20 h-20 bg-[rgb(var(--color-bg-secondary))] rounded-2xl shadow-sm flex items-center justify-center mb-6">
                            <ShoppingBag className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                        </div>
                        <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-2">Your bag is empty</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))] max-w-[240px] mb-8">
                            Looks like you haven't added anything to your bag yet.
                        </p>
                        <Button
                            variant="primary"
                            className="!px-8 !py-3 !rounded-xl"
                            onClick={onClose}
                        >
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {items?.map((item, index) => (
                                <div key={item._id}>
                                    {index > 0 && (
                                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full mx-auto my-4" />
                                    )}
                                    <div className="flex gap-4 group">
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))]/50 flex-shrink-0">
                                            {item.images?.[0]?.url ? (
                                                <Image
                                                    src={item.images[0].url}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingBag className="w-6 h-6 text-gray-200" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-bold text-[rgb(var(--color-text-primary))] truncate pr-4">
                                                    {item.name}
                                                </h4>
                                                <button
                                                    onClick={() => onUpdateQuantity(item._id, 0)}
                                                    className="text-[rgb(var(--color-text-tertiary))] hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <p className="text-xs font-medium text-[rgb(var(--color-text-tertiary))] mb-auto">
                                                {item.brand || 'Brand'}
                                            </p>

                                            <div className="flex items-center justify-between mt-0">
                                                <span className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
                                                    ₹{(item.sellingPrice * item.quantity).toLocaleString()}
                                                </span>
                                                <div className="flex items-center gap-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg p-1">
                                                    <button
                                                        onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                                                        className="w-6 h-6 flex items-center justify-center rounded bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-primary))] transition-colors shadow-sm"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                                                        className="w-6 h-6 flex items-center justify-center rounded bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-primary))] transition-colors shadow-sm"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[rgb(var(--color-border-primary))]/20 bg-[rgb(var(--color-bg-secondary))]/30">
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[rgb(var(--color-text-secondary))]">Subtotal</span>
                                    <span className="font-bold text-[rgb(var(--color-text-primary))]">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[rgb(var(--color-text-secondary))]">Delivery</span>
                                    <span className="font-bold text-green-600">FREE</span>
                                </div>
                                <div className="pt-4 border-t border-[rgb(var(--color-border-primary))]/30 flex justify-between items-center">
                                    <span className="text-base font-bold text-[rgb(var(--color-text-primary))]">Total</span>
                                    <span className="text-xl font-bold text-[rgb(var(--color-primary))]">
                                        ₹{subtotal.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    onClose();
                                    router.push(`/c/${catalogId}/checkout`);
                                }}
                                variant="primary"
                                fullWidth
                                className="!py-4 !rounded-xl !text-sm !uppercase !tracking-wider !font-bold"
                                rightIcon={ArrowRight}
                            >
                                Secure Checkout
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </SideDrawer>
    );
}
