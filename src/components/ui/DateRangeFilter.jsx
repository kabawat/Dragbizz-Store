"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CustomDateRangePanel from "./CustomDateRangePanel";
import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  DATE_RANGE_PRESETS,
  DATE_RANGE_PRESET_ORDER,
  formatDisplayDate,
  getPresetDateRange,
  getPresetLabelKey,
  inferPresetFromDates,
} from "@/utils/dateRange.util";

const PANEL_WIDTH = 820;

const DateRangeFilter = ({
  startDate = "",
  endDate = "",
  onChange,
  className = "",
  disabled = false,
}) => {
  const { t, locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const triggerRef = useRef(null);

  const activePreset = useMemo(
    () => inferPresetFromDates(startDate, endDate),
    [startDate, endDate],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      const isInsideTrigger = triggerRef.current?.contains(event.target);
      const isInsideDropdown = event.target.closest(".date-range-dropdown-portal");
      if (!isInsideTrigger && !isInsideDropdown) {
        setIsOpen(false);
        setShowCustomPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const emitChange = (nextStartDate, nextEndDate, preset = inferPresetFromDates(nextStartDate, nextEndDate)) => {
    onChange?.({
      startDate: nextStartDate,
      endDate: nextEndDate,
      preset,
    });
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setShowCustomPanel(false);
  };

  const handlePresetSelect = (preset) => {
    if (preset === DATE_RANGE_PRESETS.CUSTOM) {
      setShowCustomPanel(true);
      return;
    }

    const range = getPresetDateRange(preset);
    if (range) {
      emitChange(range.startDate, range.endDate, preset);
    }
    closeDropdown();
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    setShowCustomPanel(nextOpen && activePreset === DATE_RANGE_PRESETS.CUSTOM);
  };

  const triggerLabel = useMemo(() => {
    if (activePreset === DATE_RANGE_PRESETS.CUSTOM && startDate && endDate) {
      return `${formatDisplayDate(startDate, locale)} — ${formatDisplayDate(endDate, locale)}`;
    }
    if (activePreset) {
      return t(getPresetLabelKey(activePreset));
    }
    return t("common.dateRange.placeholder", "Date range");
  }, [activePreset, startDate, endDate, locale, t]);

  const dropdownPosition = isOpen && triggerRef.current
    ? (() => {
        const rect = triggerRef.current.getBoundingClientRect();
        const width = showCustomPanel ? PANEL_WIDTH : Math.max(rect.width, 208);
        let left = rect.left;
        const maxLeft = window.innerWidth - width - 16;
        if (left > maxLeft) left = Math.max(16, maxLeft);

        return {
          top: rect.bottom + 4,
          left,
          width,
        };
      })()
    : null;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <div className="relative min-w-[160px]" ref={triggerRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={handleTriggerClick}
          className="w-full h-10 px-3 rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] text-sm text-[rgb(var(--color-text-primary))] flex items-center justify-between gap-2 hover:bg-[rgb(var(--color-bg-secondary))] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span className="flex items-center gap-2 min-w-0">
            <Calendar className="w-4 h-4 shrink-0 text-[rgb(var(--color-text-secondary))]" />
            <span className="truncate">{triggerLabel}</span>
          </span>
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && dropdownPosition && typeof document !== "undefined" && createPortal(
          <div
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
            className="date-range-dropdown-portal fixed z-[999999] bg-[rgb(var(--color-bg-primary))] rounded-xl shadow-xl border border-[rgb(var(--color-border-primary))] overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {showCustomPanel ? (
              <CustomDateRangePanel
                startDate={startDate}
                endDate={endDate}
                onApply={({ startDate: nextStart, endDate: nextEnd }) => {
                  emitChange(nextStart, nextEnd, DATE_RANGE_PRESETS.CUSTOM);
                  closeDropdown();
                }}
                onCancel={closeDropdown}
                onClear={() => emitChange("", "", "")}
                onPresetSelect={({ startDate: nextStart, endDate: nextEnd, preset }) => {
                  emitChange(nextStart, nextEnd, preset);
                  closeDropdown();
                }}
              />
            ) : (
              <div className="py-1.5">
                {DATE_RANGE_PRESET_ORDER.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-[calc(100%-8px)] mx-1 px-3 py-2.5 rounded-lg text-left text-sm transition-colors hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer ${
                      activePreset === preset
                        ? "text-[rgb(var(--color-primary))] font-semibold bg-[rgb(var(--color-primary))]/8"
                        : "text-[rgb(var(--color-text-primary))]"
                    }`}
                  >
                    {t(getPresetLabelKey(preset))}
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body,
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
