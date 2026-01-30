"use client";
import Image from "next/image";
import { ShoppingBag, ShieldCheck } from "lucide-react";
import { Card, CardBody } from "@/components/ui";

export default function CheckoutOrderSummary({ items, subtotal }) {
  return (
    <div className="sticky top-24">
      <Card className="border-none shadow-lg shadow-gray-100/50 overflow-hidden">
        <div className="bg-[rgb(var(--color-bg-secondary))]/50 p-6 border-b border-[rgb(var(--color-border-primary))]/50">
          <h3 className="font-bold text-[rgb(var(--color-text-primary))] text-lg">
            Order Summary
          </h3>
        </div>
        <CardBody className="p-6">
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item) => (
              <div key={item._id} className="flex gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
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
                  <div className="absolute bottom-0 right-0 bg-black/50 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg font-bold">
                    x{item.quantity}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[rgb(var(--color-text-primary))] truncate mb-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[rgb(var(--color-text-tertiary))] mb-2">
                    {item.brand || "Brand"}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
                      ₹{(item.sellingPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-gray-100 my-6" />

          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-base font-bold text-[rgb(var(--color-text-primary))]">
                Total Amount
              </span>
              <span className="text-xl font-bold text-[rgb(var(--color-primary))]">
                ₹{subtotal.toLocaleString()}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="w-3 h-3" />
        <span>Secure Checkout powered by DragBizz</span>
      </div>
    </div>
  );
}
