"use client";

import {
  GripHorizontal,
  Keyboard,
  Mic,
  MicOff,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "@/hooks/keyboard/useHotkeys";
import useVoiceCapture, {
  VOICE_CAPTURE_ERRORS,
} from "@/hooks/media/useVoiceCapture";
import { useTranslation } from "@/hooks/ui/useTranslation";

const AUDIO_BAR_MULTIPLIERS = [0.55, 0.8, 1, 0.7, 0.9, 0.6, 0.75];
const POSITION_STORAGE_KEY = "dragbizz.voice.position";
const VIEWPORT_MARGIN = 8;
const DRAG_THRESHOLD = 4;

const VoiceLevel = ({ audioLevel, active }) => (
  <div
    className="flex h-9 items-center justify-center gap-1"
    aria-hidden="true"
  >
    {AUDIO_BAR_MULTIPLIERS.map((multiplier) => {
      const reactiveHeight = Math.min(
        32,
        Math.max(5, audioLevel * 380 * multiplier)
      );

      return (
        <span
          className={`w-1 rounded-full transition-[height,background-color] duration-100 ${
            active
              ? "bg-[rgb(var(--color-primary))]"
              : "bg-[rgb(var(--color-border-primary))]"
          }`}
          key={multiplier}
          style={{ height: active ? `${reactiveHeight}px` : "5px" }}
        />
      );
    })}
  </div>
);

const VoiceCommandLauncher = () => {
  const { t, locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const launcherRef = useRef(null);
  const dragStateRef = useRef(null);
  const positionRef = useRef(position);
  const suppressClickRef = useRef(false);

  const language = useMemo(() => {
    if (locale === "hi" || locale === "hi-en") return "hi-IN";
    if (locale === "gu") return "gu-IN";
    return "en-IN";
  }, [locale]);

  const {
    isSupported,
    isListening,
    isSpeaking,
    audioLevel,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
  } = useVoiceCapture({ language });

  const closePanel = useCallback(() => {
    abortListening();
    setIsOpen(false);
  }, [abortListening]);

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

  const keepInViewport = useCallback(() => {
    const element = launcherRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const adjustmentX =
      rect.left < VIEWPORT_MARGIN
        ? VIEWPORT_MARGIN - rect.left
        : rect.right > window.innerWidth - VIEWPORT_MARGIN
          ? window.innerWidth - VIEWPORT_MARGIN - rect.right
          : 0;
    const adjustmentY =
      rect.top < VIEWPORT_MARGIN
        ? VIEWPORT_MARGIN - rect.top
        : rect.bottom > window.innerHeight - VIEWPORT_MARGIN
          ? window.innerHeight - VIEWPORT_MARGIN - rect.bottom
          : 0;

    if (adjustmentX || adjustmentY) {
      setPosition((current) => ({
        x: current.x + adjustmentX,
        y: current.y + adjustmentY,
      }));
    }
  }, []);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    try {
      const storedPosition = JSON.parse(
        window.localStorage.getItem(POSITION_STORAGE_KEY)
      );
      if (
        Number.isFinite(storedPosition?.x) &&
        Number.isFinite(storedPosition?.y)
      ) {
        setPosition(storedPosition);
      }
    } catch {
      window.localStorage.removeItem(POSITION_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(keepInViewport);
    window.addEventListener("resize", keepInViewport);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", keepInViewport);
    };
  }, [keepInViewport]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const frame = requestAnimationFrame(keepInViewport);
    return () => cancelAnimationFrame(frame);
  }, [isOpen, keepInViewport]);

  const handleDragStart = (event) => {
    if (event.button !== 0) return;

    const element = launcherRef.current;
    if (!element) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPosition: position,
      startRect: element.getBoundingClientRect(),
    };
    suppressClickRef.current = false;
    setIsDragging(true);
  };

  const handleDragMove = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const rawDeltaX = event.clientX - dragState.startClientX;
    const rawDeltaY = event.clientY - dragState.startClientY;
    if (
      Math.abs(rawDeltaX) > DRAG_THRESHOLD ||
      Math.abs(rawDeltaY) > DRAG_THRESHOLD
    ) {
      suppressClickRef.current = true;
    }

    const deltaX = Math.min(
      window.innerWidth - VIEWPORT_MARGIN - dragState.startRect.right,
      Math.max(VIEWPORT_MARGIN - dragState.startRect.left, rawDeltaX)
    );
    const deltaY = Math.min(
      window.innerHeight - VIEWPORT_MARGIN - dragState.startRect.bottom,
      Math.max(VIEWPORT_MARGIN - dragState.startRect.top, rawDeltaY)
    );

    const nextPosition = {
      x: dragState.startPosition.x + deltaX,
      y: dragState.startPosition.y + deltaY,
    };
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  };

  const handleDragEnd = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    dragStateRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    window.localStorage.setItem(
      POSITION_STORAGE_KEY,
      JSON.stringify(positionRef.current)
    );
  };

  const handleLauncherClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    togglePanel();
  };

  const handleMicrophoneClick = async () => {
    if (isListening) {
      stopListening();
      return;
    }

    await startListening();
  };

  const handleReset = () => {
    resetTranscript();
  };

  const statusText = (() => {
    if (!isSupported) return t("voice.status.unsupported");
    if (error) return t(`voice.errors.${error.code}`);
    if (isSpeaking) return t("voice.status.hearing");
    if (isListening) return t("voice.status.listening");
    return t("voice.status.ready");
  })();

  const displayTranscript =
    [transcript, interimTranscript].filter(Boolean).join(" ") ||
    t("voice.transcriptPlaceholder");

  const isPermissionError =
    error?.code === VOICE_CAPTURE_ERRORS.PERMISSION_DENIED;

  return (
    <div
      className={`pointer-events-none fixed bottom-5 left-1/2 z-[300] w-[min(430px,calc(100vw-24px))] -translate-x-1/2 sm:bottom-6 ${
        isDragging ? "select-none" : ""
      }`}
      ref={launcherRef}
      style={{
        transform: `translate3d(calc(-50% + ${position.x}px), ${position.y}px, 0)`,
      }}
    >
      <div className="pointer-events-auto flex w-full flex-col items-center gap-3">
        {isOpen && (
          <section
            aria-label={t("voice.title")}
            aria-modal="false"
            className="w-full overflow-hidden rounded-[28px] border border-[rgb(var(--color-border-primary))]/70 bg-[rgb(var(--color-bg-primary))]/95 shadow-[0_24px_80px_-20px_rgba(15,23,42,0.45)] backdrop-blur-2xl"
            role="dialog"
          >
            <div className="relative overflow-hidden px-5 pb-5 pt-4 sm:px-6">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[rgb(var(--color-primary))]/10 blur-3xl"
              />

              <header className="relative flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-[rgb(var(--color-text-primary))] sm:text-base">
                      {t("voice.title")}
                    </h2>
                    <p className="mt-0.5 text-xs text-[rgb(var(--color-text-secondary))]">
                      {t("voice.subtitle")}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    aria-label={t("voice.move")}
                    className={`flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-full text-[rgb(var(--color-text-secondary))] transition-colors hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] ${
                      isDragging ? "cursor-grabbing" : ""
                    }`}
                    onPointerCancel={handleDragEnd}
                    onPointerDown={handleDragStart}
                    onPointerMove={handleDragMove}
                    onPointerUp={handleDragEnd}
                    title={t("voice.move")}
                    type="button"
                  >
                    <GripHorizontal className="h-4 w-4" />
                  </button>
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

              <div className="relative mt-5 flex flex-col items-center">
                <div className="relative flex h-28 w-28 items-center justify-center">
                  {isListening && (
                    <>
                      <span className="absolute inset-1 animate-ping rounded-full bg-[rgb(var(--color-primary))]/15 [animation-duration:1.8s]" />
                      <span className="absolute inset-3 rounded-full border border-[rgb(var(--color-primary))]/25" />
                    </>
                  )}
                  <button
                    aria-label={
                      isListening
                        ? t("voice.stopListening")
                        : t("voice.startListening")
                    }
                    className={`relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full text-white shadow-[0_16px_32px_-12px_rgb(var(--color-primary))] transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--color-primary))]/25 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isListening
                        ? "bg-gradient-to-br from-rose-500 to-red-600"
                        : "bg-gradient-to-br from-[rgb(var(--color-primary))] to-indigo-600"
                    }`}
                    disabled={!isSupported}
                    onClick={handleMicrophoneClick}
                    type="button"
                  >
                    {isListening ? (
                      <MicOff className="h-7 w-7" />
                    ) : (
                      <Mic className="h-7 w-7" />
                    )}
                  </button>
                </div>

                <VoiceLevel active={isListening} audioLevel={audioLevel} />

                <div className="mt-1 flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full ${
                      error
                        ? "bg-rose-500"
                        : isSpeaking
                          ? "animate-pulse bg-emerald-500"
                          : isListening
                            ? "bg-[rgb(var(--color-primary))]"
                            : "bg-[rgb(var(--color-text-secondary))]/50"
                    }`}
                  />
                  <p
                    aria-live="polite"
                    className={`text-xs font-medium ${
                      error
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-[rgb(var(--color-text-secondary))]"
                    }`}
                  >
                    {statusText}
                  </p>
                </div>
              </div>

              <div className="relative mt-5 rounded-2xl border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-secondary))]/65 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--color-text-secondary))]">
                    {t("voice.transcript")}
                  </span>
                  {(transcript || interimTranscript) && (
                    <button
                      className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-[rgb(var(--color-primary))] transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                      onClick={handleReset}
                      type="button"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {t("voice.clear")}
                    </button>
                  )}
                </div>
                <p
                  className={`min-h-12 text-sm leading-6 ${
                    transcript || interimTranscript
                      ? "text-[rgb(var(--color-text-primary))]"
                      : "text-[rgb(var(--color-text-secondary))]"
                  }`}
                >
                  {displayTranscript}
                </p>
              </div>

              {isPermissionError && (
                <p className="mt-3 text-center text-xs leading-5 text-rose-600 dark:text-rose-400">
                  {t("voice.permissionHelp")}
                </p>
              )}

              <footer className="relative mt-4 flex items-center justify-between gap-3 text-[11px] text-[rgb(var(--color-text-secondary))]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("voice.privacy")}
                </span>
                <span className="hidden items-center gap-1.5 sm:flex">
                  <Keyboard className="h-3.5 w-3.5" />
                  {t("voice.shortcut")}
                </span>
              </footer>
            </div>
          </section>
        )}

        {!isOpen && (
          <button
            aria-label={`${t("voice.open")} — ${t("voice.shortcut")}`}
            className={`group flex touch-none items-center gap-2.5 rounded-full border border-white/20 bg-slate-950/90 py-2.5 pl-3 pr-4 text-white shadow-[0_14px_40px_-12px_rgba(15,23,42,0.8)] backdrop-blur-xl transition-[background-color,box-shadow] duration-300 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--color-primary))]/25 ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            onClick={handleLauncherClick}
            onPointerCancel={handleDragEnd}
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            type="button"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--color-primary))] to-indigo-500 shadow-lg">
              <Mic className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">{t("voice.open")}</span>
            <kbd className="hidden rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/65 sm:inline">
              Alt V
            </kbd>
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceCommandLauncher;
