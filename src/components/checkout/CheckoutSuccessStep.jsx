"use client";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button, Card, CardBody } from "@/components/ui";

export default function CheckoutSuccessStep({
  catalogId,
  orderResult,
  subtotal,
}) {
  const router = useRouter();

  return (
    <div className="animate-in zoom-in-95 duration-500">
      <div className="max-w-md mx-auto text-center pt-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in shadow-xl shadow-green-100">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-[rgb(var(--color-text-primary))] mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
          Thank you for your purchase. Your order{" "}
          <span className="font-mono font-bold text-[rgb(var(--color-text-primary))]">
            #{orderResult.orderNumber}
          </span>{" "}
          has been placed successfully.
        </p>

        <Card className="border-none shadow-sm mb-8 bg-[rgb(var(--color-bg-secondary))]">
          <CardBody className="p-6">
            <div className="flex justify-between items-center text-sm mb-4 pb-4 border-b border-gray-200/50">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono font-bold">
                {orderResult.orderNumber}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-green-600">
                ₹{subtotal.toLocaleString()}
              </span>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-3">
          <Button
            href={orderResult.trackingUrl}
            target="_blank"
            variant="primary"
            fullWidth
            className="!h-12 !rounded-xl font-bold shadow-lg shadow-[rgb(var(--color-primary))]/20"
          >
            Track Order Status
          </Button>
          <Button
            onClick={() => router.push(`/c/${catalogId}`)}
            variant="outline"
            fullWidth
            className="!h-12 !rounded-xl font-bold border-gray-200 hover:bg-white"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
