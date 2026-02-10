"use client";
import updateSubdomain from "@/utils/helper/domain";
import { useEffect } from "react";
import GuestGuard from "@/components/auth/GuestGuard";

// Auth Layout Component
export default function AuthLayout({ children }) {

  useEffect(() => {
    if (window) {
      const domain = updateSubdomain(window.location.href, null)
      if (domain?.hasSubdomain) {
        window.location.href = domain.url
      }
    }
  }, [])

  return <GuestGuard>{children}</GuestGuard>;
}
