export const CATALOG_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

export const CATALOG_TEMPLATES = [
  { value: "classic", label: "Classic" },
  { value: "sidebar", label: "Sidebar" },
  { value: "aurora", label: "Aurora" },
  { value: "studio", label: "Studio" },
];

export const CATALOG_TEMPLATE_DETAILS = {
  classic: {
    label: "Classic",
    badge: "Grid Layout",
    description:
      "Header navigation with categorized product grids and modern cards",
  },
  sidebar: {
    label: "Sidebar",
    badge: "Sidebar Navigation",
    description:
      "Storefront with sticky category sidebar for rapid vertical browsing",
  },
  aurora: {
    label: "Aurora",
    badge: "Visual Showcase",
    description:
      "Vibrant visual layout designed for brand showcases and hero imagery",
  },
  studio: {
    label: "Studio",
    badge: "Minimalist",
    description:
      "Minimalist boutique aesthetic focusing on typography and product imagery",
  },
};

const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "auth",
  "mail",
  "smtp",
  "ftp",
  "localhost",
  "support",
  "help",
  "status",
  "static",
  "assets",
  "cdn",
  "public",
  "catalog",
  "store",
  "dashboard",
  "billing",
  "dev",
  "test",
  "staging",
  "dragbizz",
]);

export function validateCatalogSubdomain(value) {
  const subdomain = value.trim().toLowerCase();
  if (!SUBDOMAIN_PATTERN.test(subdomain)) {
    return "Use 1–63 letters, numbers or hyphens. Start and end with a letter or number.";
  }
  if (RESERVED_SUBDOMAINS.has(subdomain))
    return "This subdomain is reserved. Choose another.";
  return null;
}

export function catalogFormValues(catalog) {
  return {
    name: catalog?.name ?? "",
    subdomain: catalog?.subdomain ?? "",
    stores: catalog?.stores ?? [],
    defaultStore: catalog?.defaultStore ?? "",
    templateId: catalog?.templateId ?? "classic",
    status: catalog?.status ?? "ACTIVE",
  };
}

export function buildCatalogPayload(form, availableStoreIds) {
  const fields = {};
  const payload = {
    name: form.name.trim(),
    subdomain: form.subdomain.trim().toLowerCase(),
    stores: [...new Set(form.stores)],
    defaultStore: form.defaultStore || null,
    templateId: form.templateId || "classic",
    status: form.status,
  };
  if (!payload.name || payload.name.length > 200)
    fields.name = "Enter a name between 1 and 200 characters.";
  const subdomainError = validateCatalogSubdomain(form.subdomain);
  if (subdomainError) fields.subdomain = subdomainError;
  if (payload.stores.some((id) => !availableStoreIds.includes(id)))
    fields.stores = "Remove unavailable Stores before saving.";
  if (payload.defaultStore && !payload.stores.includes(payload.defaultStore))
    fields.defaultStore = "Select a default Store from the linked Stores.";
  if (!CATALOG_STATUSES.some((option) => option.value === payload.status))
    fields.status = "Choose a valid status.";
  if (!CATALOG_TEMPLATES.some((option) => option.value === payload.templateId))
    fields.templateId = "Choose a valid catalog template.";
  return { payload, fields };
}

export function updateCatalogStores(form, stores) {
  return {
    ...form,
    stores,
    defaultStore: stores.includes(form.defaultStore) ? form.defaultStore : "",
  };
}

export function appendCatalogs(current, incoming) {
  return [
    ...new Map(
      [...current, ...incoming].map((catalog) => [catalog.id, catalog])
    ).values(),
  ];
}
