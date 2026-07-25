"use client";

import {
  MessageCircle,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChatAssistantMessage from "@/components/voice/ChatAssistantMessage";
import { useAiVoiceChat } from "@/hooks/ai/useAiVoiceChat";
import { useHotkeys } from "@/hooks/keyboard/useHotkeys";
import useVoiceCapture, {
  VOICE_CAPTURE_ERRORS,
} from "@/hooks/media/useVoiceCapture";
import { useTranslation } from "@/hooks/ui/useTranslation";

const VoiceCommandLauncher = () => {
  const { t, locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [draftText, setDraftText] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const language = useMemo(() => {
    if (locale === "hi" || locale === "hi-en") return "hi-IN";
    if (locale === "gu") return "gu-IN";
    return "en-IN";
  }, [locale]);

  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
  } = useVoiceCapture({ language });

  const {
    messages,
    isSending,
    chatError,
    sendChat,
    resetChat,
    storeId,
  } = useAiVoiceChat({ language });

  useEffect(() => {
    if (!isListening && !interimTranscript) return;
    const live = [transcript, interimTranscript].filter(Boolean).join(" ").trim();
    if (live) setDraftText(live);
  }, [transcript, interimTranscript, isListening]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, isSending, chatError]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  const closePanel = useCallback(() => {
    abortListening();
    setIsOpen(false);
  }, [abortListening]);

  const openPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  const togglePanel = useCallback(() => {
    setIsOpen((current) => {
      if (current) abortListening();
      return !current;
    });
  }, [abortListening]);

  useHotkeys({
    "alt+v": (event) => {
      event.preventDefault();
      togglePanel();
    },
    escape: (event) => {
      if (!isOpen) return;
      event.preventDefault();
      closePanel();
    },
  });

  useEffect(() => {
    return () => abortListening();
  }, [abortListening]);

  const handleMicrophoneClick = async () => {
    if (isListening) {
      const finalText = stopListening();
      if (finalText) {
        setDraftText(finalText);
        await sendChat(finalText);
        setDraftText("");
        resetTranscript();
      }
      return;
    }

    await startListening();
  };

  const handleSend = async () => {
    const text = draftText.trim();
    if (!text || isSending || !storeId) return;
    if (isListening) stopListening();
    setDraftText("");
    resetTranscript();
    await sendChat(text);
  };

  const handleDraftKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    resetTranscript();
    resetChat();
    setDraftText("");
  };

  const canSend = Boolean(draftText.trim()) && Boolean(storeId) && !isSending;
  const isPermissionError =
    error?.code === VOICE_CAPTURE_ERRORS.PERMISSION_DENIED;
  const hasThread = messages.length > 0 || isSending || Boolean(chatError);

  const emptyHint = !storeId
    ? t("voice.status.noStore")
    : !isSupported
      ? t("voice.status.typeOnly")
      : t("voice.emptyHint");

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[300] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          aria-label={t("voice.title")}
          aria-modal="false"
          className="pointer-events-auto flex h-[min(640px,calc(100dvh-6.5rem))] w-[min(400px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-[rgb(var(--color-border-primary))]/70 bg-[rgb(var(--color-bg-primary))]"
          role="dialog"
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--color-border-primary))]/60 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] ring-1 ring-[rgb(var(--color-primary))]/15">
                <Sparkles className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold tracking-tight text-[rgb(var(--color-text-primary))]">
                  {t("voice.title")}
                </h2>
                <p className="mt-0.5 truncate text-[11px] text-[rgb(var(--color-text-secondary))]">
                  {isListening
                    ? t("voice.status.listening")
                    : isSending
                      ? t("voice.status.thinking")
                      : t("voice.subtitle")}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {hasThread && (
                <button
                  aria-label={t("voice.clear")}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[rgb(var(--color-text-secondary))] transition-colors hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                  onClick={handleReset}
                  title={t("voice.clear")}
                  type="button"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                aria-label={t("common.close")}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[rgb(var(--color-text-secondary))] transition-colors hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                onClick={closePanel}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
            {!hasThread && (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-4 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                  {t("voice.emptyTitle")}
                </p>
                <p className="mt-1.5 max-w-[260px] text-[12.5px] leading-5 text-[rgb(var(--color-text-secondary))]">
                  {emptyHint}
                </p>
              </div>
            )}

            {messages.map((item) =>
              item.role === "user" ? (
                <div
                  className="flex animate-[chatFadeUp_0.3s_ease-out_both] justify-end"
                  key={item.id}
                >
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[rgb(var(--color-primary))] px-3.5 py-2.5 text-[13px] leading-5 text-white transition-transform hover:-translate-y-0.5">
                    <p className="whitespace-pre-wrap">{item.content}</p>
                  </div>
                </div>
              ) : (
                <div
                  className="flex animate-[chatFadeUp_0.3s_ease-out_both] justify-start"
                  key={item.id}
                >
                  <div className="max-w-[94%] rounded-2xl rounded-bl-md border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-secondary))]/90 px-3.5 py-3">
                    <ChatAssistantMessage message={item.content} />
                    {Array.isArray(item.toolResults) &&
                      item.toolResults.length > 0 && (
                        <ul className="mt-2 space-y-1 border-t border-[rgb(var(--color-border-primary))]/50 pt-2">
                          {item.toolResults.map((tool, index) => (
                            <li
                              className="text-[11px] leading-4 text-[rgb(var(--color-text-secondary))]"
                              key={`${tool?.tool || "tool"}-${index}`}
                            >
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                {tool?.tool || t("voice.tool")}
                              </span>
                              {": "}
                              {tool?.success
                                ? t("voice.toolSuccess")
                                : t("voice.toolFailed")}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
              )
            )}

            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-secondary))]/80 px-3.5 py-2.5 text-[13px] text-[rgb(var(--color-text-secondary))]">
                  {t("voice.status.thinking")}
                </div>
              </div>
            )}

            {chatError && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-[rgb(var(--color-danger))]/25 bg-[rgb(var(--color-danger))]/8 px-3.5 py-2.5 text-[13px] leading-5 text-[rgb(var(--color-danger))]">
                  {chatError.code === "STORE_REQUIRED"
                    ? t("voice.status.noStore")
                    : chatError.message || t("voice.errors.ai_failed")}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 border-t border-[rgb(var(--color-border-primary))]/60 px-3 pb-3 pt-2.5">
            {isPermissionError && (
              <p className="mb-2 text-center text-[11px] leading-4 text-[rgb(var(--color-danger))]">
                {t("voice.permissionHelp")}
              </p>
            )}
            <div className="flex items-end gap-1.5 rounded-[22px] border border-[rgb(var(--color-border-primary))]/70 bg-[rgb(var(--color-bg-secondary))]/80 p-1.5 transition-[border-color] focus-within:border-[rgb(var(--color-primary))]/55">
              <button
                aria-label={
                  isListening
                    ? t("voice.stopListening")
                    : t("voice.startListening")
                }
                className={`mb-0.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]/40 disabled:cursor-not-allowed disabled:opacity-40 ${
                  isListening
                    ? "bg-[rgb(var(--color-danger))] text-white"
                    : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-primary))] hover:text-[rgb(var(--color-primary))]"
                }`}
                disabled={!isSupported || isSending || !storeId}
                onClick={handleMicrophoneClick}
                type="button"
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
              <textarea
                aria-label={t("voice.message")}
                className="max-h-28 min-h-9 w-full resize-none !border-0 bg-transparent px-1 py-2 text-[13px] leading-5 text-[rgb(var(--color-text-primary))] !shadow-none outline-none ring-0 placeholder:text-[rgb(var(--color-text-secondary))] focus:!border-0 focus:!shadow-none focus:outline-none focus:ring-0"
                disabled={isSending || !storeId}
                onChange={(event) => setDraftText(event.target.value)}
                onKeyDown={handleDraftKeyDown}
                placeholder={t("voice.messagePlaceholder")}
                ref={inputRef}
                rows={1}
                value={draftText}
              />
              <button
                aria-label={t("voice.send")}
                className="mb-0.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[rgb(var(--color-primary))] text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]/40 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canSend}
                onClick={handleSend}
                type="button"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 px-1 text-center text-[10px] text-[rgb(var(--color-text-secondary))]">
              {t("voice.sendHint")} · {t("voice.shortcut")}
            </p>
          </div>
        </section>
      )}

      <button
        aria-expanded={isOpen}
        aria-label={
          isOpen
            ? t("common.close")
            : `${t("voice.open")} — ${t("voice.shortcut")}`
        }
        className={`pointer-events-auto flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-white transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--color-primary))]/25 ${
          isOpen
            ? "bg-[rgb(var(--color-text-primary))]"
            : "bg-[rgb(var(--color-primary))]"
        }`}
        onClick={isOpen ? closePanel : openPanel}
        type="button"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default VoiceCommandLauncher;
