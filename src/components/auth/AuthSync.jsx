"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cookieManager } from "@/utils/cookieManager";

export default function AuthSync() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            cookieManager.setAuthToken(token);

            // Clean URL
            const url = new URL(window.location.href);
            url.searchParams.delete("token");
            window.history.replaceState({}, "", url);
        }
    }, [searchParams]);

    return null;
}
