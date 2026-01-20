import axios from "axios";

const cancelTokens = new Map();

export const createCancelToken = (key) => {
  if (cancelTokens.has(key)) {
    const existingToken = cancelTokens.get(key);
    existingToken.cancel("Request cancelled: new request initiated");
  }

  const source = axios.CancelToken.source();
  cancelTokens.set(key, source);
  return source.token;
};

export const cancelRequest = (key) => {
  if (cancelTokens.has(key)) {
    const source = cancelTokens.get(key);
    source.cancel("Request cancelled");
    cancelTokens.delete(key);
  }
};

export const cancelAllRequests = () => {
  for (const [_key, source] of cancelTokens.entries()) {
    source.cancel("All requests cancelled");
  }
  cancelTokens.clear();
};

export const removeCancelToken = (key) => {
  cancelTokens.delete(key);
};

export const getRequestKey = (url, method = "GET", params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join("&");
  return `${method}:${url}${sortedParams ? `?${sortedParams}` : ""}`;
};
