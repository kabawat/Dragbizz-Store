export function updateSubdomain(url, subdomain = null) {
    const u = new URL(url);
    const parts = u.hostname.split(".");
    const hasSubdomain = parts.length > 2;
    if (subdomain === null) {
        if (hasSubdomain) parts.shift();
    } else {
        if (hasSubdomain) parts[0] = subdomain;
        else parts.unshift(subdomain);
    }

    u.hostname = parts.join(".");
    return {
        url: u.toString(),
        hasSubdomain,
    };
}

// Redirect to main domain (e.g. kabawat.dragbizz.com → dragbizz.com/path)
export function redirectToMainDomain(path = "/") {
    window.location.href = getMainDomainUrl(path);
}

// Get main domain URL (e.g. kabawat.dragbizz.com → http://dragbizz.com/path)
export function getMainDomainUrl(path = "/") {
    if (typeof window === "undefined") return path;
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    const mainDomain = parts.length > 2 ? parts.slice(1).join(".") : hostname;
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";

    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${protocol}//${mainDomain}${port}${cleanPath}`;
}