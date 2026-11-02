export const GST_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export function panFromGst(gst) {
  const normalized = gst.trim().toUpperCase();
  return GST_PATTERN.test(normalized) ? normalized.slice(2, 12) : "";
}

export function taxFieldError(field, value) {
  if (!value.trim()) return "";
  const pattern = field === "gst" ? GST_PATTERN : PAN_PATTERN;
  return pattern.test(value.trim().toUpperCase())
    ? ""
    : `Please enter a valid ${field === "gst" ? "15-character GST" : "10-character PAN"} number`;
}

export function validateStoreForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Store name is required";
  if (!form.category.trim()) errors.category = "Store category is required";
  for (const field of ["gst", "pan"]) {
    const message = taxFieldError(field, form[field]);
    if (message) errors[field] = message;
  }
  if (
    form.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
  )
    errors.email = "Please enter a valid email address";
  const phone = form.phone.replace(/[\s()-]/g, "");
  if (phone && !/^\+?[1-9]\d{9,14}$/.test(phone))
    errors.phone = "Please enter a valid phone number";
  return errors;
}

export function storePayload(form, location) {
  const { phone, email, agency, ...rest } = form;
  return {
    ...rest,
    ...(agency ? { agency } : {}),
    name: form.name.trim(),
    ...(phone.trim() ? { phone: phone.replace(/[\s()-]/g, "") } : {}),
    ...(email.trim() ? { email: email.trim().toLowerCase() } : {}),
    location,
  };
}
