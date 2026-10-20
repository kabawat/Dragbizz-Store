"use client";
import { bootstrapSession, hasSessionHint } from "@dragorbit/core/auth";
import { usePathname } from "next/navigation";
import {
  readWorkspacePreview,
  saveWorkspacePreview,
  clearWorkspaceCache,
} from "@/utils/workspaceCache";
import { useEffect, useLayoutEffect } from "react";
import { useStore } from "react-redux";
import ForcePasswordModal from "@/components/auth/ForcePasswordModal";
import { useAppSelector } from "@/store/hooks";
import * as profileActions from "@/store/slices/profileSlice";

export default function GlobalProfileLoader({ initialSessionHint = false }) {
  const store = useStore();
  const pathname = usePathname();
  const profile = useAppSelector((state) => state.profile);
  const authProfile = profile.authProfile;
  // Restore navigation before the first client paint; authorization remains unverified.
  useLayoutEffect(() => {
    const sessionHint = initialSessionHint || hasSessionHint(document.cookie);
    if (!sessionHint) clearWorkspaceCache();
    if (
      sessionHint &&
      pathname?.startsWith("/dashboard") &&
      !store.getState().profile.authProfile
    ) {
      const preview = readWorkspacePreview();
      if (preview) store.dispatch(profileActions.restoreShellPreview(preview));
    }
  }, [store, initialSessionHint, pathname]);
  // Bootstrap once per server session hint; later route changes reuse the live store.
  useEffect(() => {
    const expire = () => {
      store.dispatch(profileActions.clearAuth());
      store.dispatch(profileActions.setInitialized(true));
    };
    window.addEventListener("dragbizz:session-expired", expire);
    const sessionHint = initialSessionHint || hasSessionHint(document.cookie);
    bootstrapSession(store, profileActions, {
      sessionHint,
      force: store.getState().profile.shellRestored === true,
    });
    return () => window.removeEventListener("dragbizz:session-expired", expire);
  }, [store, initialSessionHint]);
  useEffect(() => {
    saveWorkspacePreview(profile);
  }, [profile]);
  return (
    <ForcePasswordModal
      isOpen={Boolean(authProfile && authProfile.ispwds === false)}
    />
  );
}
