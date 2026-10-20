"use client";
import { bootstrapSession } from "@dragorbit/core/auth";
import { SessionGate } from "@dragorbit/ui/app";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { useStore } from "react-redux";
import { useAppSelector } from "@/store/hooks";
import * as profileActions from "@/store/slices/profileSlice";

export default function AuthGuard({ children }) {
  const store = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const profile = useAppSelector((state) => state.profile);
  const navigate = useCallback(
    (path) => {
      if (path.startsWith("/login")) window.location.replace(path);
      else router.replace(path);
    },
    [router]
  );
  const retry = () =>
    bootstrapSession(store, profileActions, { sessionHint: true, force: true });
  return (
    <SessionGate
      allowShellPreview
      profile={profile}
      pathname={pathname}
      onRedirect={navigate}
      onRetry={retry}
    >
      {children}
    </SessionGate>
  );
}
