import { Suspense } from "react";
import VerifyInvitation from "@/page/invite/verify";

export const metadata = {
    title: "Verify Invitation - DragBizz Store",
    description: "Verify your staff invitation for DragBizz Store",
};

export default function VerifyInvitationPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[rgb(var(--color-text-secondary))]">
                            Loading...
                        </p>
                    </div>
                </div>
            }
        >
            <VerifyInvitation />
        </Suspense>
    );
}
