import moment from "moment";

export const formatDate = (date, format = "MMM DD, YYYY") => {
  if (!date) return "--";

  try {
    const parsed = moment(date);
    if (!parsed.isValid()) return "--";
    return parsed.format(format);
  } catch (_error) {
    return "--";
  }
};

export const formatDateTime = (date, format = "MMM DD, YYYY h:mm A") => {
  if (!date) return "--";

  try {
    const parsed = moment(date);
    if (!parsed.isValid()) return "--";
    return parsed.format(format);
  } catch (_error) {
    return "--";
  }
};

export const formatDateShort = (date) => {
  if (!date) return "--";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (_error) {
    return "--";
  }
};

export const formatDateLong = (date) => {
  if (!date) return "--";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (_error) {
    return "--";
  }
};

export const formatDateOnly = (date) => {
  if (!date) return "--";

  try {
    return moment(date).format("DD MMM YYYY");
  } catch (_error) {
    return "--";
  }
};

export const formatTime = (date) => {
  if (!date) return "--";

  try {
    return moment(date).format("h:mm A");
  } catch (_error) {
    return "--";
  }
};

export const getDaysDifference = (date1, date2) => {
  if (!date1 || !date2) return 0;

  try {
    const d1 = moment(date1);
    const d2 = moment(date2);
    return d2.diff(d1, "days");
  } catch (_error) {
    return 0;
  }
};

export const isDateValid = (date) => {
  if (!date) return false;
  return moment(date).isValid();
};

export const isDatePast = (date) => {
  if (!date) return false;
  return moment(date).isBefore(moment());
};

export const isDateFuture = (date) => {
  if (!date) return false;
  return moment(date).isAfter(moment());
};
