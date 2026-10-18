"use client";

import {
  BrainCircuit,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ChatAssistantMessage from "@/components/voice/ChatAssistantMessage";
import ChatCustomerResultCard, {
  collectCustomerWrites,
  stripCustomerOpenLinks,
} from "@/components/voice/ChatCustomerResultCard";
import ChatExpandedWorkspace from "@/components/voice/ChatExpandedWorkspace";
import ChatSlashMenu from "@/components/voice/ChatSlashMenu";
import KhataDownloadButtons from "@/components/voice/KhataDownloadButtons";
import { matchSlashCommands } from "@/components/voice/voiceSlashCommands";
import { useAiVoiceChat } from "@/hooks/ai/useAiVoiceChat";
import { useChatHistory } from "@/hooks/ai/useChatHistory";
import { useHotkeys } from "@/hooks/keyboard/useHotkeys";
import useVoiceCapture, { VOICE_CAPTURE_ERRORS } from "@/hooks/media/useVoiceCapture";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";
import { titleFromUserText } from "@/utils/ai/chatHistory";
import ENV_CONFIG from "@/config/env.config";

// Tool-call trace ("search_customer: done") is a debug aid — dev/test only.
const SHOW_TOOL_TRACE = !ENV_CONFIG.ENV.IS_PRODUCTION;

function greetingForLocale(locale, name, t) {
  const hour = new Date().getHours();
  const who = name ? `, ${name}` : "";
  if (locale === "hi" || locale === "hi-en") {
    if (hour < 12) return `${t("voice.greet.morning")}${who}`;
    if (hour < 17) return `${t("voice.greet.afternoon")}${who}`;
    return `${t("voice.greet.evening")}${who}`;
  }
  if (hour < 12) return `${t("voice.greet.morning")}${who}`;
  if (hour < 17) return `${t("voice.greet.afternoon")}${who}`;
  return `${t("voice.greet.evening")}${who}`;
}

function formatConfirmSummary(pending, t) {
  const summary = pending?.summary || {};
  const parts = [];
  if (summary.action === "payment") {
    parts.push("Payment");
  } else if (summary.action === "debit") {
    parts.push("Debit");
  }
  if (typeof summary.total === "number") {
    parts.push(`₹${summary.total}`);
  }
  if (summary.invoiceNumber) {
    parts.push(String(summary.invoiceNumber));
  }
  return parts.length > 0
    ? parts.join(" · ")
    : t("voice.confirm.defaultSummary");
}

function AssistantMessageBubble({
  item,
  isExpanded,
  storeId,
  t,
  isSending,
  isConfirming,
  confirmPending,
  rejectPending,
}) {
  const customerWrites = collectCustomerWrites(item.toolResults);
  const assistantText =
    customerWrites.length > 0
      ? stripCustomerOpenLinks(item.content)
      : item.content;

  return (
    <div className="flex animate-[chatFadeUp_0.3s_ease-out_both] justify-start">
      <div
        className={`rounded-2xl rounded-bl-md border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] px-3.5 py-3 ${
          isExpanded ? "max-w-[92%]" : "max-w-[94%]"
        }`}
      >
        <ChatAssistantMessage message={assistantText} />
        <ChatCustomerResultCard toolResults={item.toolResults} />
        <KhataDownloadButtons storeId={storeId} toolResults={item.toolResults} />
        {SHOW_TOOL_TRACE &&
          Array.isArray(item.toolResults) &&
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
        {item.pendingConfirmation && (
          <div className="mt-3 space-y-2 border-t border-[rgb(var(--color-border-primary))]/50 pt-3">
            <p className="text-[12px] leading-4 text-[rgb(var(--color-text-secondary))]">
              {t("voice.confirm.prompt")}
              {": "}
              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                {formatConfirmSummary(item.pendingConfirmation, t)}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                className="ai-chat-on-primary cursor-pointer rounded-lg bg-[rgb(var(--color-primary))] px-3 py-1.5 text-[12px] font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isConfirming || isSending}
                onClick={() => confirmPending(item.pendingConfirmation)}
                style={{ color: "#fff" }}
                type="button"
              >
                {t("voice.confirm.approve")}
              </button>
              <button
                className="cursor-pointer rounded-lg border border-[rgb(var(--color-border-primary))] px-3 py-1.5 text-[12px] font-medium text-[rgb(var(--color-text-primary))] transition-colors hover:bg-[rgb(var(--color-bg-primary))] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isConfirming || isSending}
                onClick={() => rejectPending(item.pendingConfirmation)}
                type="button"
              >
                {t("voice.confirm.reject")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const VoiceCommandLauncher = () => {
  const { t, locale } = useTranslation();
  const { selectedStore, user } = useAppSelector((state) => state.profile);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const [portalReady, setPortalReady] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionCreatedAtRef = useRef(Date.now());

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
    isConfirming,
    chatError,
    sendChat,
    confirmPending,
    rejectPending,
    resetChat,
    loadChat,
    storeId,
    sessionId,
  } = useAiVoiceChat({ language });

  const {
    grouped,
    loading: historyLoading,
    error: historyError,
    refresh: refreshHistory,
    getSession,
    optimisticTouch,
  } = useChatHistory(storeId);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    setActiveSessionId(sessionId);
  }, [sessionId]);

  // Optimistic sidebar row after first user message; server persists on reply.
  useEffect(() => {
    if (!storeId || !activeSessionId || messages.length === 0) return;
    if (isSending || isConfirming) return;
    const firstUser = messages.find(
      (item) => item?.role === "user" && typeof item.content === "string"
    );
    if (!firstUser?.content) return;
    optimisticTouch({
      id: activeSessionId,
      title: titleFromUserText(firstUser.content),
      createdAt: sessionCreatedAtRef.current,
    });
  }, [
    messages,
    storeId,
    activeSessionId,
    optimisticTouch,
    isSending,
    isConfirming,
  ]);

  // After a completed turn, refresh list from server (source of truth).
  useEffect(() => {
    if (!storeId || isSending || isConfirming) return;
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last?.role !== "assistant" || last?.streaming) return;
    void refreshHistory();
  }, [messages, storeId, isSending, isConfirming, refreshHistory]);

  useEffect(() => {
    if (!isListening && !interimTranscript) return;
    const live = [transcript, interimTranscript].filter(Boolean).join(" ").trim();
    if (live) setDraftText(live);
  }, [transcript, interimTranscript, isListening]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, isSending, isConfirming, chatError]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen, isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isExpanded]);

  const closePanel = useCallback(() => {
    abortListening();
    setIsExpanded(false);
    setIsOpen(false);
  }, [abortListening]);

  const openPanel = useCallback(() => {
    setIsExpanded(false);
    setIsOpen(true);
  }, []);

  const expandPanel = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapsePanel = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsOpen((current) => {
      if (current) {
        abortListening();
        setIsExpanded(false);
        return false;
      }
      setIsExpanded(false);
      return true;
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
      if (isExpanded) {
        collapsePanel();
        return;
      }
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

  const handleQuickPrompt = useCallback(
    async (prompt) => {
      const text = typeof prompt === "string" ? prompt.trim() : "";
      if (!text || isSending || isConfirming || !storeId) return;
      if (isListening) stopListening();
      setDraftText("");
      resetTranscript();
      await sendChat(text);
    },
    [
      isSending,
      isConfirming,
      storeId,
      isListening,
      stopListening,
      resetTranscript,
      sendChat,
    ]
  );

  const slashMatches = useMemo(
    () => matchSlashCommands(draftText),
    [draftText]
  );
  const showSlashMenu = slashMatches.length > 0;

  useEffect(() => {
    setSlashIndex(0);
  }, [draftText]);

  const applySlashCommand = useCallback(
    (item) => {
      if (!item) return;
      const prompt = t(item.promptKey);
      if (typeof prompt === "string" && prompt.endsWith(" ")) {
        setDraftText(prompt);
        requestAnimationFrame(() => inputRef.current?.focus());
        return;
      }
      void handleQuickPrompt(prompt);
    },
    [t, handleQuickPrompt]
  );

  const handleDraftKeyDown = (event) => {
    if (showSlashMenu) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSlashIndex((current) =>
          current + 1 >= slashMatches.length ? 0 : current + 1
        );
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSlashIndex((current) =>
          current - 1 < 0 ? slashMatches.length - 1 : current - 1
        );
        return;
      }
      if (event.key === "Tab" || (event.key === "Enter" && !event.shiftKey)) {
        event.preventDefault();
        applySlashCommand(slashMatches[slashIndex] || slashMatches[0]);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setDraftText("");
        return;
      }
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    resetTranscript();
    resetChat();
    setDraftText("");
    sessionCreatedAtRef.current = Date.now();
  };

  const handleNewChat = () => {
    handleReset();
    void refreshHistory();
  };

  const handleSelectSession = async (session) => {
    if (!session?.id) return;
    setDraftText("");
    const result = await getSession(session.id);
    if (!result?.success || !result.session) {
      return;
    }
    loadChat({
      sessionId: result.session.id,
      messages: result.session.messages || [],
    });
    sessionCreatedAtRef.current = result.session.createdAt || Date.now();
  };

  const canSend =
    Boolean(draftText.trim()) &&
    Boolean(storeId) &&
    !isSending &&
    !isConfirming;
  const isPermissionError =
    error?.code === VOICE_CAPTURE_ERRORS.PERMISSION_DENIED;
  const hasThread =
    messages.length > 0 || isSending || isConfirming || Boolean(chatError);

  const emptyHint = !storeId
    ? t("voice.status.noStore")
    : !isSupported
      ? t("voice.status.typeOnly")
      : t("voice.emptyHint");

  const userName =
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : null) ||
    user?.name ||
    user?.fullName ||
    user?.firstName ||
    "";

  const greeting = greetingForLocale(locale, userName, t);

  const storeName =
    selectedStore?.storeName || selectedStore?.name || t("voice.storeFallback");
  const storeGst = selectedStore?.gst || selectedStore?.gstNumber || "";

  const aiStatus = isListening
    ? t("voice.status.listening")
    : isConfirming
      ? t("voice.status.confirming")
      : isSending
        ? t("voice.status.thinking")
        : t("voice.status.waiting");

  const headerStatus = isListening
    ? t("voice.status.listening")
    : isSending || isConfirming
      ? t("voice.status.thinking")
      : t("voice.subtitle");

  const messageList = (
    <>
      {messages.map((item) =>
        item.role === "user" ? (
          <div
            className="flex animate-[chatFadeUp_0.3s_ease-out_both] justify-end"
            key={item.id}
          >
            <div
              className={`ai-chat-on-primary rounded-2xl rounded-br-md bg-[rgb(var(--color-primary))] px-3.5 py-2.5 text-[13px] leading-5 transition-transform hover:-translate-y-0.5 ${
                isExpanded ? "max-w-[80%]" : "max-w-[85%]"
              }`}
              style={{ color: "#fff" }}
            >
              <span className="block whitespace-pre-wrap">{item.content}</span>
            </div>
          </div>
        ) : (
          <AssistantMessageBubble
            confirmPending={confirmPending}
            isConfirming={isConfirming}
            isExpanded={isExpanded}
            isSending={isSending}
            item={item}
            key={item.id}
            rejectPending={rejectPending}
            storeId={storeId}
            t={t}
          />
        )
      )}

      {(isSending || isConfirming) && (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-md border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] px-3.5 py-2.5 text-[13px] text-[rgb(var(--color-text-secondary))]">
            {isConfirming
              ? t("voice.status.confirming")
              : t("voice.status.thinking")}
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
    </>
  );

  const composer = (
    <>
      {isPermissionError && (
        <p className="mb-2 text-center text-[11px] leading-4 text-[rgb(var(--color-danger))]">
          {t("voice.permissionHelp")}
        </p>
      )}
      {showSlashMenu && (
        <ChatSlashMenu
          activeIndex={slashIndex}
          items={slashMatches}
          onHover={setSlashIndex}
          onSelect={applySlashCommand}
          t={t}
        />
      )}
      {!hasThread && isExpanded && !showSlashMenu && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {[
            {
              label: t("voice.quick.chipRevenue"),
              prompt: t("voice.quick.revenuePrompt"),
            },
            {
              label: t("voice.quick.chipDues"),
              prompt: t("voice.quick.duesPrompt"),
            },
            {
              label: t("voice.quick.chipStock"),
              prompt: t("voice.quick.stockPrompt"),
            },
            {
              label: t("voice.quick.chipInvoice"),
              prompt: t("voice.quick.invoicePrompt"),
            },
          ].map((chip) => (
            <button
              className="cursor-pointer rounded-full border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] px-2.5 py-1 text-[11px] font-medium text-[rgb(var(--color-text-primary))] transition-colors hover:border-[rgb(var(--color-primary))]/45 hover:bg-[rgb(var(--color-bg-tertiary))]"
              key={chip.label}
              onClick={() => handleQuickPrompt(chip.prompt)}
              type="button"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-1.5 rounded-[22px] border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] p-1.5 transition-[border-color] focus-within:border-[rgb(var(--color-primary))]/55">
        <button
          aria-label={
            isListening ? t("voice.stopListening") : t("voice.startListening")
          }
          className={`mb-0.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]/40 disabled:cursor-not-allowed disabled:opacity-40 ${
            isListening
              ? "ai-chat-on-primary bg-[rgb(var(--color-danger))]"
              : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))]"
          }`}
          disabled={!isSupported || isSending || isConfirming || !storeId}
          onClick={handleMicrophoneClick}
          style={isListening ? { color: "#fff" } : undefined}
          type="button"
        >
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </button>
        <textarea
          aria-autocomplete="list"
          aria-expanded={showSlashMenu}
          aria-label={t("voice.message")}
          className="max-h-28 min-h-9 w-full resize-none !border-0 bg-transparent px-1 py-2 text-[13px] leading-5 text-[rgb(var(--color-text-primary))] !shadow-none outline-none ring-0 placeholder:text-[rgb(var(--color-text-secondary))] focus:!border-0 focus:!shadow-none focus:outline-none focus:ring-0"
          disabled={isSending || isConfirming || !storeId}
          onChange={(event) => setDraftText(event.target.value)}
          onKeyDown={handleDraftKeyDown}
          placeholder={t("voice.messagePlaceholder")}
          ref={inputRef}
          rows={1}
          value={draftText}
        />
        <button
          aria-label={t("voice.send")}
          className="ai-chat-on-primary mb-0.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[rgb(var(--color-primary))] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]/40 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canSend}
          onClick={handleSend}
          style={{ color: "#fff" }}
          type="button"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1.5 px-1 text-center text-[10px] text-[rgb(var(--color-text-secondary))]">
        {t("voice.sendHint")} · {t("voice.shortcut")}
      </p>
    </>
  );

  const headerActions = (
    <div className="flex shrink-0 items-center gap-1">
      {isExpanded && (
        <span className="mr-2 hidden items-center gap-1.5 text-[11px] text-[rgb(var(--color-text-secondary))] sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--color-success))]" />
          {t("voice.online")}
        </span>
      )}
      {hasThread && (
        <button
          aria-label={t("voice.clear")}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[rgb(var(--color-text-secondary))] transition-colors hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
          onClick={handleNewChat}
          title={t("voice.clear")}
          type="button"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
      {isExpanded ? (
        <button
          aria-label={t("voice.collapse")}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[rgb(var(--color-text-secondary))] transition-colors hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
          onClick={collapsePanel}
          title={t("voice.collapse")}
          type="button"
        >
          <Minimize2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          aria-label={t("voice.expand")}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[rgb(var(--color-text-secondary))] transition-colors hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
          onClick={expandPanel}
          title={t("voice.expand")}
          type="button"
        >
          <Maximize2 className="h-3.5 w-3.5" />
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
  );

  const compactPanel = (
    <section
      aria-label={t("voice.title")}
      aria-modal="false"
      className="pointer-events-auto flex h-[min(640px,calc(100dvh-6.5rem))] w-[min(400px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]"
      role="dialog"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--color-border-primary))] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="ai-chat-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--color-primary))]/10 ring-1 ring-[rgb(var(--color-primary))]/20"
            style={{ color: "rgb(var(--color-primary))" }}
          >
            <BrainCircuit className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold tracking-tight text-[rgb(var(--color-text-primary))]">
              {t("voice.title")}
            </h2>
            <p className="mt-0.5 truncate text-[11px] text-[rgb(var(--color-text-secondary))]">
              {headerStatus}
            </p>
          </div>
        </div>
        {headerActions}
      </header>

      <div className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
        {!hasThread ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-4 text-center">
            <div
              className="ai-chat-accent mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgb(var(--color-primary))]/10 ring-1 ring-[rgb(var(--color-primary))]/20"
              style={{ color: "rgb(var(--color-primary))" }}
            >
              <BrainCircuit className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
              {t("voice.emptyTitle")}
            </p>
            <p className="mt-1.5 max-w-[260px] text-[12.5px] leading-5 text-[rgb(var(--color-text-secondary))]">
              {emptyHint}
            </p>
          </div>
        ) : (
          messageList
        )}
      </div>

      <div className="shrink-0 border-t border-[rgb(var(--color-border-primary))] px-3 pb-3 pt-2.5">
        {composer}
      </div>
    </section>
  );

  const expandedOverlay =
    portalReady &&
    isOpen &&
    isExpanded &&
    createPortal(
      <div className="fixed inset-0 z-[400] flex items-stretch justify-stretch p-[20px] sm:p-[24px]">
        <button
          aria-label={t("voice.collapse")}
          className="absolute inset-0 cursor-default bg-[rgb(var(--color-text-primary))]/40 backdrop-blur-[2px]"
          onClick={collapsePanel}
          type="button"
        />
        <div className="relative z-10 flex h-full w-full animate-[chatFadeUp_0.2s_ease-out_both] flex-col overflow-hidden rounded-2xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] shadow-[var(--card-shadow-hover)]">
          <header className="pointer-events-auto flex shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] px-4 py-3.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="ai-chat-on-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--color-primary))]"
                style={{ color: "#fff" }}
              >
                <BrainCircuit className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold tracking-tight text-[rgb(var(--color-text-primary))]">
                  {t("voice.title")}
                </h2>
                <p className="mt-0.5 truncate text-[11px] text-[rgb(var(--color-text-secondary))]">
                  {t("voice.subtitle")}
                </p>
              </div>
            </div>
            {headerActions}
          </header>
          <ChatExpandedWorkspace
            activeSessionId={activeSessionId}
            aiStatus={aiStatus}
            composer={composer}
            emptyHint={emptyHint}
            greeting={greeting}
            hasThread={hasThread}
            historyError={historyError}
            historyGrouped={grouped}
            historyLoading={historyLoading}
            onNewChat={handleNewChat}
            onQuickPrompt={handleQuickPrompt}
            onSelectSession={handleSelectSession}
            storeGst={storeGst}
            storeName={storeName}
            t={t}
          >
            {messageList}
          </ChatExpandedWorkspace>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      {expandedOverlay}

      <div className="pointer-events-none fixed bottom-5 right-5 z-[300] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        {isOpen && !isExpanded && compactPanel}

        {!isExpanded && (
          <button
            aria-expanded={isOpen}
            aria-label={
              isOpen
                ? t("common.close")
                : `${t("voice.open")} — ${t("voice.shortcut")}`
            }
            className={`pointer-events-auto flex h-14 w-14 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--color-primary))]/25 ${
              isOpen
                ? "bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] shadow-md ring-2 ring-[rgb(var(--color-border-primary))]"
                : "ai-chat-on-primary bg-[rgb(var(--color-primary))] shadow-lg shadow-[rgb(var(--color-primary))]/30"
            }`}
            onClick={isOpen ? closePanel : openPanel}
            style={isOpen ? undefined : { color: "#fff" }}
            type="button"
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <BrainCircuit className="h-6 w-6" strokeWidth={1.75} />
            )}
          </button>
        )}
      </div>
    </>
  );
};

export default VoiceCommandLauncher;
