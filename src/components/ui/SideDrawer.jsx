"use client";
import { Download, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

const SideDrawer = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  description,
  children,
  width = "w-2/3",
  showDownloadButton = false,
  onDownload = null,
  closeOnOutsideClick = true,
  draggable = true,
  resizable = true,
  autoHeight = false,
}) => {
  const drawerRef = useRef(null);
  const dragStateRef = useRef(null);
  const rafRef = useRef(0);
  const pendingOffsetRef = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const resizeStateRef = useRef(null);
  const resizeRafRef = useRef(0);
  const pendingSizeRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [drawerSize, setDrawerSize] = useState({ width: null, height: null }); // px overrides
  const [mounted, setMounted] = useState(false);

  const marginPx = 10;
  const minWidthPx = 320;
  const minHeightPx = 220;

  const clampOffsetToViewport = useMemo(() => {
    return (next) => {
      const el = drawerRef.current;
      if (!el || typeof window === "undefined") return next;

      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Base position is top-right with margin (top=margin, right=margin)
      const baseLeft = vw - marginPx - rect.width;
      const baseTop = marginPx;

      const minX = marginPx - baseLeft; // allows moving left until left hits margin
      const maxX = 0; // cannot move further right than base
      const minY = 0; // cannot move above base top margin
      const maxY = Math.max(0, vh - marginPx - rect.height - baseTop); // until bottom hits margin

      return {
        x: Math.min(maxX, Math.max(minX, next.x)),
        y: Math.min(maxY, Math.max(minY, next.y)),
      };
    };
  }, []);

  const clampSizeToViewport = useMemo(() => {
    return (next) => {
      if (typeof window === "undefined") return next;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxW = Math.max(minWidthPx, vw - marginPx * 2);
      const maxH = Math.max(minHeightPx, vh - marginPx * 2);
      return {
        width: Math.min(maxW, Math.max(minWidthPx, next.width)),
        height: Math.min(maxH, Math.max(minHeightPx, next.height)),
      };
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && closeOnOutsideClick) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnOutsideClick]);

  // Reset position when opened
  useEffect(() => {
    if (!isOpen) return;
    setDragOffset({ x: 0, y: 0 });
    setDrawerSize({ width: null, height: null });
  }, [isOpen]);

  // Keep drawer within viewport on resize
  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => {
      setDragOffset((prev) => clampOffsetToViewport(prev));
      setDrawerSize((prev) => {
        if (!prev.width && !prev.height) return prev;
        return clampSizeToViewport({
          width: prev.width ?? Math.max(minWidthPx, window.innerWidth - marginPx * 2),
          height: prev.height ?? Math.max(minHeightPx, window.innerHeight - marginPx * 2),
        });
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen, clampOffsetToViewport, clampSizeToViewport]);

  const startDrag = (e) => {
    if (!draggable) return;
    if (e.button != null && e.button !== 0) return; // only left click

    // Don't start drag when interacting with controls inside header
    const target = e.target;
    if (target?.closest?.("button, a, input, textarea, select")) return;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;

    dragStateRef.current = {
      startX: clientX,
      startY: clientY,
      startOffset: dragOffset,
    };
    setIsDragging(true);

    const onMove = (ev) => {
      const s = dragStateRef.current;
      if (!s) return;
      const mx = ev.clientX ?? ev.touches?.[0]?.clientX;
      const my = ev.clientY ?? ev.touches?.[0]?.clientY;
      if (mx == null || my == null) return;
      const next = clampOffsetToViewport({
        x: s.startOffset.x + (mx - s.startX),
        y: s.startOffset.y + (my - s.startY),
      });

      // Smooth + efficient: update state at most once per frame
      pendingOffsetRef.current = next;
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0;
        if (pendingOffsetRef.current) {
          setDragOffset(pendingOffsetRef.current);
          pendingOffsetRef.current = null;
        }
      });
    };

    const onUp = () => {
      dragStateRef.current = null;
      setIsDragging(false);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      pendingOffsetRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchcancel", onUp);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp, { passive: true });
    window.addEventListener("touchcancel", onUp, { passive: true });
  };

  const startResize = (e, axis = "both") => {
    if (!resizable) return;
    if (e.button != null && e.button !== 0) return; // only left click
    e.stopPropagation();
    e.preventDefault?.();

    const el = drawerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;

    setIsResizing(true);
    resizeStateRef.current = {
      startX: clientX,
      startY: clientY,
      startWidth: drawerSize.width ?? rect.width,
      startHeight: drawerSize.height ?? rect.height,
      axis,
    };

    const onMove = (ev) => {
      const s = resizeStateRef.current;
      if (!s) return;
      const mx = ev.clientX ?? ev.touches?.[0]?.clientX;
      const my = ev.clientY ?? ev.touches?.[0]?.clientY;
      if (mx == null || my == null) return;

      // Right-anchored drawer:
      // - Left edge drag: moving left increases width, moving right decreases width.
      // - Bottom edge drag: moving down increases height, moving up decreases height.
      const dx = s.startX - mx;
      const dy = my - s.startY;

      const next = clampSizeToViewport({
        width: s.axis === "height" ? s.startWidth : s.startWidth + dx,
        height: s.axis === "width" ? s.startHeight : s.startHeight + dy,
      });

      pendingSizeRef.current = next;
      if (resizeRafRef.current) return;
      resizeRafRef.current = window.requestAnimationFrame(() => {
        resizeRafRef.current = 0;
        if (pendingSizeRef.current) {
          setDrawerSize(pendingSizeRef.current);
          pendingSizeRef.current = null;
        }
      });
    };

    const onUp = () => {
      resizeStateRef.current = null;
      setIsResizing(false);
      if (resizeRafRef.current) {
        window.cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = 0;
      }
      pendingSizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchcancel", onUp);
    };

    window.addEventListener("mousemove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp, { passive: true });
    window.addEventListener("touchcancel", onUp, { passive: true });
  };

  if (!isOpen || !mounted) return null;

  const drawerContent = (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 10050 }} role="presentation">
      {/* Glass Effect Backdrop */}
      <div
        onClick={() => closeOnOutsideClick && onClose()}
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300"
        style={{ zIndex: 10050 }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          zIndex: 10051,
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
          width: drawerSize.width ? `${drawerSize.width}px` : undefined,
          height: drawerSize.height ? `${drawerSize.height}px` : undefined,
        }}
        className={`absolute right-[10px] top-[10px] ${drawerSize.height ? "" : autoHeight ? "h-auto" : "h-[calc(100vh-20px)]"} max-h-[calc(100vh-20px)] ${width} max-w-[calc(100vw-20px)] bg-[rgb(var(--color-bg-primary))] shadow-2xl transform ${isDragging || isResizing ? "transition-none" : "transition-transform duration-300 ease-in-out"} flex flex-col rounded-[10px] overflow-hidden will-change-transform`}
      >
        {/* Header */}
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-[rgb(var(--color-border-primary))] flex-shrink-0 ${draggable ? "cursor-move select-none" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {Icon && (
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--color-primary))]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-[rgb(var(--color-text-primary))] truncate">
                  {title}
                </h2>
                {description && (
                  <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))] truncate mt-0.5">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
              {showDownloadButton && onDownload && (
                <Button
                  onClick={onDownload}
                  variant="primary"
                  size="sm"
                  className="hidden sm:flex"
                  leftIcon={Download}
                >
                  <span className="hidden md:inline">
                    Download Purchase Order
                  </span>
                  <span className="md:hidden">Download</span>
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--color-text-secondary))]" />
              </button>
            </div>
          </div>
        </div>

        {/* Content — flex column so drawer forms can pin footer actions */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden overscroll-contain">
          {children}
        </div>

        {/* Resize handles (left + bottom edges) */}
        {resizable && (
          <>
            {/* Left edge (width) */}
            <div
              role="presentation"
              onMouseDown={(e) => startResize(e, "width")}
              onTouchStart={(e) => startResize(e, "width")}
              className={`absolute left-0 top-14 bottom-10 w-2 z-[10000] cursor-ew-resize ${
                isResizing ? "bg-[rgb(var(--color-bg-secondary))]/60" : "bg-transparent hover:bg-[rgb(var(--color-bg-secondary))]/40"
              }`}
              title="Resize width"
            />

            {/* Bottom edge (height) */}
            <div
              role="presentation"
              onMouseDown={(e) => startResize(e, "height")}
              onTouchStart={(e) => startResize(e, "height")}
              className={`absolute bottom-0 left-10 right-10 h-2 z-[10000] cursor-ns-resize ${
                isResizing ? "bg-[rgb(var(--color-bg-secondary))]/60" : "bg-transparent hover:bg-[rgb(var(--color-bg-secondary))]/40"
              }`}
              title="Resize height"
            />
          </>
        )}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default SideDrawer;
