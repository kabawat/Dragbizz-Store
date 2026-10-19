"use client";
import { bootstrapSession, hasSessionHint } from "@dragorbit/core/auth";
import { useEffect } from "react";
import { useStore } from "react-redux";
import ForcePasswordModal from "@/components/auth/ForcePasswordModal";
import { useAppSelector } from "@/store/hooks";
import * as profileActions from "@/store/slices/profileSlice";

export default function GlobalProfileLoader({ initialSessionHint = false }) {
  const store = useStore();
  const authProfile = useAppSelector((state) => state.profile.authProfile);
  useEffect(() => {
    const expire = () => {
      store.dispatch(profileActions.clearAuth());
      store.dispatch(profileActions.setInitialized(true));
    };
    window.addEventListener("dragbizz:session-expired", expire);
    bootstrapSession(store, profileActions, {
      sessionHint: initialSessionHint || hasSessionHint(document.cookie),
    });
    return () => window.removeEventListener("dragbizz:session-expired", expire);
  }, [store, initialSessionHint]);
  return (
    <ForcePasswordModal
      isOpen={Boolean(authProfile && authProfile.ispwds === false)}
    />
  );
}
