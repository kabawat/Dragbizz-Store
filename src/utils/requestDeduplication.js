const pendingRequests = new Map();

export const getRequestKey = (url, method = 'GET', params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  return `${method}:${url}${sortedParams ? `?${sortedParams}` : ''}`;
};

export const getPendingRequest = (key) => {
  return pendingRequests.get(key);
};

export const setPendingRequest = (key, requestPromise) => {
  pendingRequests.set(key, requestPromise);
  
  requestPromise.finally(() => {
    pendingRequests.delete(key);
  });
};

export const clearPendingRequest = (key) => {
  pendingRequests.delete(key);
};

export const clearAllPendingRequests = () => {
  pendingRequests.clear();
};

export const getPendingRequestsCount = () => pendingRequests.size;

