import ENV_CONFIG from "@/config/env.config";

// --- Internal Helpers (For SSR and Domain parsing) ---
const isBrowser = () => typeof window !== "undefined";
const isDevMode = () => ENV_CONFIG.ENV.IS_DEVELOPMENT;

// Extracts domain information (subdomain, mainDomain) from a URL or current location
const getDomainInfo = (urlStr) => {
  if (!urlStr && !isBrowser()) return null;
  
  const url = urlStr ? new URL(urlStr) : new URL(window.location.href);
  const parts = url.hostname.split(".");
  const hasSub = parts.length > 2;

  return {
    url,
    parts,
    hasSubdomain: hasSub,
    subdomain: hasSub ? parts[0] : null,
    mainDomain: hasSub ? parts.slice(-2).join(".") : url.hostname
  };
};

// --- Exported Functions ---

// Returns true if current environment is localhost
export function isLocalhost() {
  if (!isBrowser()) return false;
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

// Returns only the main domain (e.g., dragbizz.io)
export function getMainDomain() {
  if (!isBrowser()) return null;
  return getDomainInfo().mainDomain;
}

// Adds, removes, or updates a subdomain in a given URL
function updateSubdomain(url, subdomain = null) {
  if (!isBrowser() || isDevMode()) return { url, hasSubdomain: false };

  const info = getDomainInfo(url);
  const { url: u, parts, hasSubdomain } = info;

  if (parts.length === 1) return { url: u.toString(), hasSubdomain: false };

  const newParts = [...parts];
  if (subdomain === null) {
    if (hasSubdomain) newParts.shift();
  } else {
    if (hasSubdomain) newParts[0] = subdomain;
    else newParts.unshift(subdomain);
  }

  u.hostname = newParts.join(".");
  return { url: u.toString(), hasSubdomain };
}

// Returns the full Base/Main Domain URL for the current environment
export function getMainDomainUrl(path = "/") {
  if (!isBrowser()) return path;

  const { protocol, port: windowPort } = window.location;
  const { mainDomain } = getDomainInfo();
  
  const port = windowPort ? `:${windowPort}` : "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${protocol}//${mainDomain}${port}${cleanPath}`;
}

// Returns the subdomain name from the current URL
export function getCurrentSubdomain() {
  if (!isBrowser()) return null;
  return getDomainInfo().subdomain;
}

// Redirects the user directly to the Main Domain (without subdomain)
export function redirectToMainDomain(path = "/") {
  if (!isBrowser()) return;
  window.location.href = getMainDomainUrl(path);
}

// Redirects the user to a specific subdomain
export function redirectToSubdomain(subdomain, path = "/") {
  if (!isBrowser() || isDevMode()) return;
  
  const { url } = updateSubdomain(getMainDomainUrl(path), subdomain);
  window.location.replace(url);
}

// Ensures the user is always on the correct subdomain/tenant
export function ensureSubdomain(tenant, path = window.location.pathname) {
  if (!isBrowser()) return;

  // In development, remove subdomain if present
  if (isDevMode()) {
    if (getCurrentSubdomain()) {
      redirectToMainDomain(path);
    }
    return;
  }

  // In production, redirect if current subdomain doesn't match tenant
  if (getCurrentSubdomain() !== tenant) {
    redirectToSubdomain(tenant, path);
  }
}

// Ensures the user is on the main domain (no subdomain)
export function ensureMainDomain(path = window.location.pathname) {
  if (!isBrowser()) return;
  if (getCurrentSubdomain()) {
    redirectToMainDomain(path);
  }
}