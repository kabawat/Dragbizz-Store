"use client";
import { BrainPanel, useVoiceCapture } from "@dragorbit/features/brain";
import Link from "next/link";
import ENV_CONFIG from "@/config/env.config";
import { useAiVoiceChat } from "@/hooks/ai/useAiVoiceChat";
import { useChatHistory } from "@/hooks/ai/useChatHistory";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";
import KhataDownloadButtons from "./KhataDownloadButtons";

export default function VoiceCommandLauncher() {
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
    />
  );
}
