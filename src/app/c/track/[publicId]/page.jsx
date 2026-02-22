import { Suspense } from "react";
import OrderTrackingPage from "@/page/c/track";

export async function generateMetadata({ params }) {
    const { publicId } = params;

    return {
        title: "Track Order - DragBizz Store",
        description: "Track your order status and view order details",
        keywords: "order tracking, order status, DragBizz Store",
        openGraph: {
            title: "Track Order - DragBizz Store",
            description: "Track your order status and view order details",
            type: "website",
        },
    };
}

export default async function OrderTrackingPageRoute({ params }) {
    const { publicId } = await params;

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#2980b9] rounded-full animate-spin mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-gray-700">Loading Order Details...</h2>
                    </div>
                </div>
            }
        >
            <OrderTrackingPage publicId={publicId} />
        </Suspense>
    );
}
