export const DATE_RANGE_PRESETS = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  LAST_7_DAYS: "last7days",
  LAST_30_DAYS: "last30days",
  LAST_3_MONTHS: "last3months",
  LAST_6_MONTHS: "last6months",
  CUSTOM: "custom",
};

export const DATE_RANGE_PRESET_ORDER = [
  DATE_RANGE_PRESETS.TODAY,
  DATE_RANGE_PRESETS.YESTERDAY,
  DATE_RANGE_PRESETS.LAST_7_DAYS,
  DATE_RANGE_PRESETS.LAST_30_DAYS,
  DATE_RANGE_PRESETS.LAST_3_MONTHS,
  DATE_RANGE_PRESETS.LAST_6_MONTHS,
  DATE_RANGE_PRESETS.CUSTOM,
];

export function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfDay(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function getPresetDateRange(preset) {
  const today = startOfDay();
  const start = new Date(today);
  const end = new Date(today);

  switch (preset) {
    case DATE_RANGE_PRESETS.TODAY:
      break;
    case DATE_RANGE_PRESETS.YESTERDAY:
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
    case DATE_RANGE_PRESETS.LAST_7_DAYS:
      start.setDate(start.getDate() - 6);
      break;
    case DATE_RANGE_PRESETS.LAST_30_DAYS:
      start.setDate(start.getDate() - 29);
      break;
    case DATE_RANGE_PRESETS.LAST_3_MONTHS:
      start.setMonth(start.getMonth() - 3);
      break;
    case DATE_RANGE_PRESETS.LAST_6_MONTHS:
      start.setMonth(start.getMonth() - 6);
      break;
    default:
      return null;
  }

  return {
    startDate: formatDateISO(start),
    endDate: formatDateISO(end),
    preset,
  };
}

export function inferPresetFromDates(startDate, endDate) {
  if (!startDate && !endDate) return "";
  if (!startDate || !endDate) return DATE_RANGE_PRESETS.CUSTOM;

  for (const preset of DATE_RANGE_PRESET_ORDER) {
    if (preset === DATE_RANGE_PRESETS.CUSTOM) continue;
    const range = getPresetDateRange(preset);
    if (range?.startDate === startDate && range?.endDate === endDate) {
      return preset;
    }
  }

  return DATE_RANGE_PRESETS.CUSTOM;
}

export function getPresetLabelKey(preset) {
  switch (preset) {
    case DATE_RANGE_PRESETS.TODAY:
      return "common.dateRange.today";
    case DATE_RANGE_PRESETS.YESTERDAY:
      return "common.dateRange.yesterday";
    case DATE_RANGE_PRESETS.LAST_7_DAYS:
      return "common.dateRange.last7Days";
    case DATE_RANGE_PRESETS.LAST_30_DAYS:
      return "common.dateRange.last30Days";
    case DATE_RANGE_PRESETS.LAST_3_MONTHS:
      return "common.dateRange.last3Months";
    case DATE_RANGE_PRESETS.LAST_6_MONTHS:
      return "common.dateRange.last6Months";
    case DATE_RANGE_PRESETS.CUSTOM:
      return "common.dateRange.custom";
    default:
      return "common.dateRange.placeholder";
  }
}
