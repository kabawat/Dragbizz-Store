"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

const GstGuard = ({ children }) => {
    const router = useRouter();
    const { selectedStore } = useAppSelector((state) => state.profile);

    // Logic to determine if store is registered
    const isRegistered = !!selectedStore?.gst;

    useEffect(() => {
        if (!isRegistered) {
            router.push("/dashboard");
        }
    }, [isRegistered, router]);

    if (!isRegistered) {
        return null;
    }

    return <>{children}</>;
};

export default GstGuard;
