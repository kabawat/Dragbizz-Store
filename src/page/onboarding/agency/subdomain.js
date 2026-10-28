import { isReservedSubdomain } from "@dragorbit/core/domain";

/** DNS-safe suggestion from a business name; server still checks uniqueness and reserved names. */
export function agencySubdomainFromName(name) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/g, "");

  if (isReservedSubdomain(slug)) {
    return `${slug}-shop`.slice(0, 63);
  }
  return slug;
}
