"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Input from "./Input";
import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  DATE_RANGE_PRESETS,
  DATE_RANGE_PRESET_ORDER,
  getPresetDateRange,
  getPresetLabelKey,
  inferPresetFromDates,
} from "@/utils/dateRange.util";

const DateRangeFilter = ({
  startDate = "",
  endDate = "",
  onChange,
  className = "",
  disabled = false,
  showCustomInputs = true,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
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

  const handlePresetSelect = (preset) => {
    if (preset === DATE_RANGE_PRESETS.CUSTOM) {
      emitChange(startDate, endDate, DATE_RANGE_PRESETS.CUSTOM);
      return;
    }

    const range = getPresetDateRange(preset);
    if (range) {
      emitChange(range.startDate, range.endDate, preset);
    }
    setIsOpen(false);
  };

  const handleStartDateChange = (value) => {
    emitChange(value, endDate, DATE_RANGE_PRESETS.CUSTOM);
  };

  const handleEndDateChange = (value) => {
    emitChange(startDate, value, DATE_RANGE_PRESETS.CUSTOM);
  };

  const triggerLabel = activePreset
    ? t(getPresetLabelKey(activePreset))
    : t("common.dateRange.placeholder", "Date range");

  const dropdownPosition = isOpen && triggerRef.current
    ? (() => {
        const rect = triggerRef.current.getBoundingClientRect();
        return {
          top: rect.bottom + 4,
          left: rect.left,
          width: Math.max(rect.width, 208),
        };
      })()
    : null;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <div className="relative min-w-[160px]" ref={triggerRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((open) => !open)}
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
            className="date-range-dropdown-portal fixed z-[999999] bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 max-h-72 overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {DATE_RANGE_PRESET_ORDER.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer ${
                  activePreset === preset
                    ? "text-[rgb(var(--color-primary))] font-medium"
                    : "text-[rgb(var(--color-text-primary))]"
                }`}
              >
                {t(getPresetLabelKey(preset))}
              </button>
            ))}
          </div>,
          document.body,
        )}
      </div>

      {showCustomInputs && (
        <>
          <div className="w-[140px]">
            <Input
              type={startDate ? "date" : "text"}
              onFocus={(e) => {
                e.target.type = "date";
              }}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              value={startDate}
              onChange={handleStartDateChange}
              max={endDate || undefined}
              placeholder={t("common.startDate")}
              disabled={disabled}
            />
          </div>
          <div className="w-[140px]">
            <Input
              type={endDate ? "date" : "text"}
              onFocus={(e) => {
                e.target.type = "date";
              }}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate || undefined}
              placeholder={t("common.endDate")}
              disabled={disabled}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DateRangeFilter;
