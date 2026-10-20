"use client";

import { BrainPanel, useVoiceCapture } from "@dragorbit/features/brain";
import Link from "next/link";
import ENV_CONFIG from "@/config/env.config";
import { useAiVoiceChat } from "@/hooks/ai/useAiVoiceChat";
import { useChatHistory } from "@/hooks/ai/useChatHistory";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";
import AiLottieIcon from "./AiLottieIcon";
import KhataDownloadButtons from "./KhataDownloadButtons";

export default function VoiceCommandLauncher({ className = "" }) {
  const { t, locale } = useTranslation();
  const { selectedStore, user } = useAppSelector((state) => state.profile);
  const language =
    locale === "hi" || locale === "hi-en"
      ? "hi-IN"
      : locale === "gu"
        ? "gu-IN"
        : "en-IN";
  const chat = useAiVoiceChat({ language });
  const history = useChatHistory(chat.storeId);
  const voice = useVoiceCapture({ language });

  return (
    <BrainPanel
      t={t}
      locale={locale}
      selectedStore={selectedStore}
      user={user}
      chat={chat}
      history={history}
      voice={voice}
      LinkComponent={Link}
      DownloadButtons={KhataDownloadButtons}
      showToolTrace={!ENV_CONFIG.ENV.IS_PRODUCTION}
      triggerClassName={className}
      customTrigger={({ isOpen, setIsOpen }) => (
        <button
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={t("voice.buttonLabel", "AI Assistant")}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          title={t("voice.title", "AI Assistant")}
          className={`relative flex h-9 w-9 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-300 group active:scale-95 border ${
            isOpen
              ? "bg-[rgb(var(--color-primary))]/15 border-[rgb(var(--color-primary))]/40 ring-2 ring-[rgb(var(--color-primary))]/20"
              : "bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] border-[rgb(var(--color-border-primary))]/60 hover:border-[rgb(var(--color-primary))]/40"
          } ${className}`}
        >
          {/* Lottie Animation from ai.json used in place of the chat icon */}
          <AiLottieIcon
            size={24}
            className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
          />

          {/* Active online indicator dot */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[rgb(var(--color-primary))] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[rgb(var(--color-primary))] ring-1 ring-[rgb(var(--color-bg-primary))]" />
          </span>
        </button>
      )}
    />
  );
}
