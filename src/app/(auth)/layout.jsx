"use client";
import { ensureMainDomain } from "@/utils/helper/domain";
import { useEffect } from "react";
import GuestGuard from "@/components/auth/GuestGuard";

// Auth Layout Component
export default function AuthLayout({ children }) {

  useEffect(() => {
    ensureMainDomain();
  }, []);

  return <GuestGuard>{children}</GuestGuard>;
}
