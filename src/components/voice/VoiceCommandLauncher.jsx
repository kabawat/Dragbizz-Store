"use client";

import {
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

const AUDIO_BARS = [
  { id: "a", multiplier: 0.45, idleHeight: 8 },
  { id: "b", multiplier: 0.65, idleHeight: 12 },
  { id: "c", multiplier: 0.85, idleHeight: 17 },
  { id: "d", multiplier: 0.6, idleHeight: 11 },
  { id: "e", multiplier: 1, idleHeight: 21 },
  { id: "f", multiplier: 0.75, idleHeight: 15 },
  { id: "g", multiplier: 0.9, idleHeight: 19 },
  { id: "h", multiplier: 0.55, idleHeight: 10 },
  { id: "i", multiplier: 0.8, idleHeight: 16 },
  { id: "j", multiplier: 0.6, idleHeight: 12 },
  { id: "k", multiplier: 0.4, idleHeight: 7 },
];
const POSITION_STORAGE_KEY = "dragbizz.voice.position";
const VIEWPORT_MARGIN = 8;
const DRAG_THRESHOLD = 4;

const VoiceLevel = ({ audioLevel, active }) => (
  <div
    className="flex h-9 items-center justify-center gap-1"
    aria-hidden="true"
  >
    {AUDIO_BARS.map(({ id, multiplier, idleHeight }) => {
      const reactiveHeight = Math.min(
        32,
        Math.max(7, audioLevel * 420 * multiplier)
      );

      return (
        <span
          className={`w-1 rounded-full transition-[height,background-color,opacity] duration-100 ${
            active
              ? "bg-[rgb(var(--color-primary))] opacity-75"
              : "bg-[rgb(var(--color-primary))] opacity-20"
          }`}
          key={id}
          style={{
            height: active ? `${reactiveHeight}px` : `${idleHeight}px`,
          }}
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
      className={`pointer-events-none fixed bottom-5 left-1/2 z-[300] w-[min(400px,calc(100vw-24px))] -translate-x-1/2 sm:bottom-6 ${
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
            className="relative w-full overflow-hidden rounded-3xl border border-[rgb(var(--color-border-primary))]/70 bg-[rgb(var(--color-bg-primary))]/95 backdrop-blur-2xl"
            role="dialog"
          >
            <button
              aria-label={t("voice.move")}
              className={`group absolute inset-x-16 top-0 z-10 flex h-7 touch-none items-center justify-center text-[rgb(var(--color-text-tertiary))] transition-colors hover:text-[rgb(var(--color-text-secondary))] focus-visible:outline-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              onPointerCancel={handleDragEnd}
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              title={t("voice.move")}
              type="button"
            >
              <span className="h-1 w-9 rounded-full bg-[rgb(var(--color-border-secondary))] transition-[width,background-color] group-hover:w-11" />
            </button>

            <div className="relative overflow-hidden px-4 pb-4 pt-7 sm:px-5">
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-24 h-52 w-52 rounded-full bg-[rgb(var(--color-primary))]/12 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute -left-20 top-20 h-40 w-40 rounded-full bg-[rgb(var(--color-primary))]/5 blur-3xl"
              />

              <header className="relative flex select-none items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] ring-1 ring-[rgb(var(--color-primary))]/15">
                    <Sparkles className="h-[18px] w-[18px]" />
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

                <button
                  aria-label={t("common.close")}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[rgb(var(--color-text-secondary))] transition-colors hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                  onClick={closePanel}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="relative mt-4 flex min-h-[112px] items-center gap-4 overflow-hidden rounded-[22px] border border-[rgb(var(--color-primary))]/15 bg-[rgb(var(--color-primary))]/[0.07] p-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--color-primary))]/5 via-transparent to-[rgb(var(--color-primary))]/10"
                />
                <div
                  aria-hidden="true"
                  className="absolute -right-10 -top-20 h-44 w-44 rounded-full bg-[rgb(var(--color-primary))]/10 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-24 left-12 h-40 w-40 rounded-full bg-[rgb(var(--color-primary))]/5 blur-3xl"
                />

                <div className="relative flex h-[78px] w-[78px] shrink-0 items-center justify-center">
                  {isListening && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--color-primary))]/10 [animation-duration:1.8s]" />
                  )}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-1 rounded-full border transition-colors ${
                      isListening
                        ? "border-[rgb(var(--color-primary))]/30"
                        : "border-[rgb(var(--color-primary))]/15"
                    }`}
                  />
                  <button
                    aria-label={
                      isListening
                        ? t("voice.stopListening")
                        : t("voice.startListening")
                    }
                    className={`relative flex h-[58px] w-[58px] cursor-pointer items-center justify-center rounded-full text-white transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--color-primary))]/20 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isListening
                        ? "bg-[rgb(var(--color-danger))]"
                        : "bg-[rgb(var(--color-primary))]/80 ring-1 ring-[rgb(var(--color-primary))]/20 hover:bg-[rgb(var(--color-primary))]/90"
                    }`}
                    disabled={!isSupported}
                    onClick={handleMicrophoneClick}
                    type="button"
                  >
                    {isListening ? (
                      <MicOff className="h-6 w-6" />
                    ) : (
                      <Mic className="h-6 w-6" />
                    )}
                  </button>
                </div>

                <div className="relative min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        error
                          ? "bg-[rgb(var(--color-danger))]"
                          : isSpeaking
                            ? "animate-pulse bg-[rgb(var(--color-success))]"
                            : isListening
                              ? "bg-[rgb(var(--color-primary))]"
                              : "bg-[rgb(var(--color-text-tertiary))]"
                      }`}
                    />
                    <p
                      aria-live="polite"
                      className="truncate text-xs font-semibold text-[rgb(var(--color-text-primary))]"
                    >
                      {statusText}
                    </p>
                  </div>
                  <p className="mt-1 text-[10px] text-[rgb(var(--color-text-secondary))]">
                    {isListening ? t("voice.stopHint") : t("voice.startHint")}
                  </p>
                  <div className="mt-1 flex h-9 items-center justify-start">
                    <VoiceLevel active={isListening} audioLevel={audioLevel} />
                  </div>
                </div>
              </div>

              <div className="relative mt-3 rounded-2xl border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-secondary))]/65 p-3.5">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--color-text-secondary))]">
                    {t("voice.transcript")}
                  </span>
                  {(transcript || interimTranscript) && (
                    <button
                      className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-[rgb(var(--color-primary))] transition-colors hover:bg-[rgb(var(--color-primary))]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                      onClick={handleReset}
                      type="button"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {t("voice.clear")}
                    </button>
                  )}
                </div>
                <p
                  className={`max-h-20 min-h-10 overflow-y-auto text-[13px] leading-5 ${
                    transcript || interimTranscript
                      ? "text-[rgb(var(--color-text-primary))]"
                      : "text-[rgb(var(--color-text-secondary))]"
                  }`}
                >
                  {displayTranscript}
                </p>
              </div>

              {isPermissionError && (
                <p className="mt-2.5 text-center text-[11px] leading-4 text-[rgb(var(--color-danger))]">
                  {t("voice.permissionHelp")}
                </p>
              )}

              <footer className="relative mt-3 flex select-none items-center justify-between gap-3 px-0.5 text-[10px] text-[rgb(var(--color-text-secondary))]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" />
                  {t("voice.privacy")}
                </span>
                <span className="hidden items-center gap-1.5 sm:flex">
                  <Keyboard className="h-3 w-3" />
                  {t("voice.shortcut")}
                </span>
              </footer>
            </div>
          </section>
        )}

        {!isOpen && (
          <button
            aria-label={`${t("voice.open")} — ${t("voice.shortcut")}`}
            className={`group flex touch-none items-center gap-2.5 rounded-full border border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-bg-primary))]/95 py-2.5 pl-3 pr-4 text-[rgb(var(--color-text-primary))] backdrop-blur-xl transition-colors duration-300 hover:bg-[rgb(var(--color-primary))]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--color-primary))]/20 ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            onClick={handleLauncherClick}
            onPointerCancel={handleDragEnd}
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            type="button"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] ring-1 ring-[rgb(var(--color-primary))]/15">
              <Mic className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">{t("voice.open")}</span>
            <kbd className="hidden rounded-md border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] px-1.5 py-0.5 text-[10px] font-medium text-[rgb(var(--color-text-secondary))] sm:inline">
              Alt V
            </kbd>
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceCommandLauncher;
