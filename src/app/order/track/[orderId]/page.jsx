import { Suspense } from "react";
import OrderTrackingPage from "@/page/order/track";

export async function generateMetadata({ params }) {
    const { orderId } = await params;
    return {
        title: `Track Order #${orderId} - DragBizz`,
        description: "Real-time order tracking status",
    };
}

export default async function OrderTrackingRoute({ params }) {
    const { orderId } = await params;

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-white">Loading Order Details...</h2>
                    </div>
                </div>
            }
        >
            <OrderTrackingPage orderId={orderId} />
        </Suspense>
    );
}
