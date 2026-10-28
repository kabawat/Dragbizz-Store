"use client";

import { BrainPanel, useVoiceCapture } from "@dragorbit/features/brain";
import { Tooltip as SharedTooltip } from "@dragorbit/ui";
import Link from "next/link";
import { useState } from "react";
import ENV_CONFIG from "@/config/env.config";
import { useAiVoiceChat } from "@/hooks/ai/useAiVoiceChat";
import { useChatHistory } from "@/hooks/ai/useChatHistory";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";
import AiLottieIcon from "./AiLottieIcon";
import KhataDownloadButtons from "./KhataDownloadButtons";

export default function VoiceCommandLauncher({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, locale } = useTranslation();
  const { selectedStore, user, authProfile } = useAppSelector(
    (state) => state.profile
  );
  const currentUser = { ...(user || {}), ...(authProfile || {}) };
  const language =
    locale === "hi" || locale === "hi-en"
      ? "hi-IN"
      : locale === "gu"
        ? "gu-IN"
        : "en-IN";
  const chat = useAiVoiceChat({ language });
  const history = useChatHistory(chat.storeId, { enabled: isOpen });
  const voice = useVoiceCapture({ language });

  const renderTrigger = ({ isOpen, setIsOpen, togglePanel }) => (
    <SharedTooltip content={t("voice.title", "AI Assistant")}><button
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={t("voice.buttonLabel", "AI Assistant")}
      onClick={togglePanel || (() => setIsOpen?.(!isOpen))}
      type="button"

      className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 group cursor-pointer active:scale-95 border ${
        isOpen
          ? "bg-[rgb(var(--color-primary))]/15 border-[rgb(var(--color-primary))]/40 ring-2 ring-[rgb(var(--color-primary))]/20"
          : "bg-[rgb(var(--color-text-primary)/0.06)] border-[rgb(var(--color-border-primary)/0.6)] hover:bg-[rgb(var(--color-text-primary)/0.12)] hover:border-[rgb(var(--color-primary)/0.4)]"
      } ${className}`}
    >
      {/* Lottie Animation from ai.json used in place of the chat icon */}
      <AiLottieIcon
        size={22}
        className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
      />

      {/* Active online indicator dot */}
      <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[rgb(var(--color-primary))] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[rgb(var(--color-primary))] ring-1 ring-[rgb(var(--color-bg-primary))]" />
      </span>
    </button></SharedTooltip>
  );

  return (
    <BrainPanel
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      t={t}
      locale={locale}
      selectedStore={selectedStore}
      user={currentUser}
      chat={chat}
      history={history}
      voice={voice}
      LinkComponent={Link}
      DownloadButtons={KhataDownloadButtons}
      showToolTrace={!ENV_CONFIG.ENV.IS_PRODUCTION}
      triggerClassName={className}
      triggerButton={renderTrigger}
      customTrigger={renderTrigger}
    />
  );
}
