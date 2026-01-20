const cache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000;

export const generateCacheKey = (url, method = 'GET', params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  return `${method}:${url}${sortedParams ? `?${sortedParams}` : ''}`;
};

export const getCachedResponse = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now > cached.expiresAt) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

export const setCachedResponse = (key, data, ttl = DEFAULT_TTL) => {
  const expiresAt = Date.now() + ttl;
  cache.set(key, { data, expiresAt });
};

export const clearCache = (pattern = null) => {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

export const invalidateCache = (pattern) => {
  clearCache(pattern);
};

export const getCacheSize = () => cache.size;

export const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now > value.expiresAt) {
      cache.delete(key);
    }
  }
};

setInterval(clearExpiredCache, 60000);

