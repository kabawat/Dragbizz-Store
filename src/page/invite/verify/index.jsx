"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalToast } from "@/contexts/ToastContext";
import staffService from "@/service/retailer/staff.service";
import useApiResponse from "@/hooks/useApiResponse";
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, MailOpen } from "lucide-react";
import Link from "next/link";
import { AnimatedBackground, AnimatedGridPattern } from "@/components/ui";

export default function VerifyInvitation() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const { showSuccess, showError } = useGlobalToast();

    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("We are verifying your invitation code...");
    const hasVerifiedRef = useRef(false);
    const { execute } = useApiResponse();
    const { showSuccess, showError } = useGlobalToast();

    useEffect(() => {
        // Only verify once strictly
        if (hasVerifiedRef.current) return;

        if (!token) {
            setStatus("error");
            setMessage("Invalid or missing invitation token. Please check the link from your email.");
            return;
        }

        const verifyToken = async () => {
            hasVerifiedRef.current = true;

            const result = await execute(
                staffService.verifyStaff(token),
                { showToast: false }
            );

            if (result?.success) {
                setStatus("success");
                setMessage(result?.message || "Your staff invitation has been verified successfully! You can now join your store.");
                showSuccess(result?.message || "Invitation verified successfully!");
                setTimeout(() => { router.push("/login"); }, 4000);
            } else {
                setStatus("error");
                setMessage(result?.message || "Failed to verify invitation. The link may have expired or is invalid.");
                showError(result?.message || "Failed to verify invitation");
            }
        };

        verifyToken();
    }, [token, router, showSuccess, showError]);

    return (
        <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            <AnimatedBackground variant={status === "success" ? "success" : status === "error" ? "error" : "primary"} />
            <AnimatedGridPattern opacity={30} blur={1} gridSize={80} />

            <div className="absolute inset-0 z-0 backdrop-blur-[2px] bg-white/5 dark:bg-black/5 pointer-events-none"></div>

            {/* Main card */}
            <div className="max-w-md w-full relative z-10">
                <div className="bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">

                    {/* Icon state */}
                    <div className="mb-6 relative">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${status === "loading" ? "bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))]" :
                            status === "success" ? "bg-green-500/10 text-green-500 scale-110" :
                                "bg-red-500/10 text-red-500 scale-110"
                            }`}>
                            {status === "loading" && <Loader2 size={36} className="animate-spin" />}
                            {status === "success" && <ShieldCheck size={36} className="animate-[pulse_2s_ease-in-out_infinite]" />}
                            {status === "error" && <XCircle size={36} />}
                        </div>

                        {status === "loading" && (
                            <div className="absolute top-0 right-0 w-6 h-6 bg-[rgb(var(--color-bg-primary))] rounded-full flex items-center justify-center shadow-md">
                                <MailOpen size={12} className="text-[rgb(var(--color-text-secondary))]" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-3">
                        {status === "loading" && "Verifying Invitation"}
                        {status === "success" && "Welcome Aboard!"}
                        {status === "error" && "Verification Failed"}
                    </h1>

                    <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed px-4">
                        {message}
                    </p>

                    <div className="w-full flex flex-col gap-3">
                        {status === "success" && (
                            <Link href="/login" className="w-full py-3 bg-[rgb(var(--color-primary))] text-white font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[rgba(var(--color-primary),0.2)] flex items-center justify-center gap-2">
                                Go to Dashboard <ArrowRight size={16} />
                            </Link>
                        )}

                        {status === "error" && (
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-3 bg-[rgb(var(--color-primary))] text-white font-medium rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                Try Again
                            </button>
                        )}

                        {status !== "loading" && (
                            <Link href="/" className="w-full py-3 bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))] font-medium rounded-xl hover:bg-[rgba(var(--color-primary),0.05)] border border-[rgb(var(--color-border-primary))] transition-all">
                                Return Home
                            </Link>
                        )}
                    </div>

                    {status === "success" && (
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-6 animate-pulse">
                            Redirecting automatically...
                        </p>
                    )}

                </div>
            </div>
        </div>
    );
}
