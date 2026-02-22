function updateSubdomain(url, subdomain = null) {
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

module.exports = updateSubdomain;