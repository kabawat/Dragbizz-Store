import { authAxios } from "@/service/config/axiosConfig";
import {
  generateCacheKey,
  getCachedResponse,
  setCachedResponse,
} from "./requestCache";
import {
  createCancelToken,
  getRequestKey as getCancelKey,
  removeCancelToken,
} from "./requestCancellation";
import {
  getRequestKey as getDedupKey,
  getPendingRequest,
  setPendingRequest,
} from "./requestDeduplication";
import { defaultQueue } from "./requestQueue";

export const optimizedGet = async (url, config = {}) => {
  const {
    params = {},
    useCache = true,
    useDeduplication = true,
    useCancellation = true,
    useQueue = false,
    cacheTTL = 5 * 60 * 1000,
    priority = 0,
    ...restConfig
  } = config;

  const method = "GET";
  const cacheKey = generateCacheKey(url, method, params);
  const dedupKey = getDedupKey(url, method, params);
  const cancelKey = getCancelKey(url, method, params);

  if (useCache) {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return Promise.resolve({
        data: cached,
        fromCache: true,
      });
    }
  }

  if (useDeduplication) {
    const pending = getPendingRequest(dedupKey);
    if (pending) {
      return pending.then((response) => ({
        ...response,
        fromDeduplication: true,
      }));
    }
  }

  const requestFn = async () => {
    const requestConfig = {
      ...restConfig,
      params,
      useCache,
      useDeduplication,
      useCancellation,
    };

    if (useCancellation) {
      requestConfig.cancelToken = createCancelToken(cancelKey);
    }

    try {
      const response = await authAxios.get(url, requestConfig);

      if (useCache) {
        setCachedResponse(cacheKey, response.data, cacheTTL);
      }

      if (useCancellation) {
        removeCancelToken(cancelKey);
      }

      return response;
    } catch (error) {
      if (useCancellation) {
        removeCancelToken(cancelKey);
      }
      throw error;
    }
  };

  if (useDeduplication) {
    const requestPromise = requestFn();
    setPendingRequest(dedupKey, requestPromise);
    return requestPromise;
  }

  if (useQueue) {
    return defaultQueue.add(requestFn, priority);
  }

  return requestFn();
};

export const optimizedPost = async (url, data, config = {}) => {
  const {
    useCancellation = true,
    useQueue = false,
    priority = 0,
    ...restConfig
  } = config;

  const method = "POST";
  const cancelKey = getCancelKey(url, method, {});

  const requestFn = async () => {
    const requestConfig = {
      ...restConfig,
      useCancellation,
    };

    if (useCancellation) {
      requestConfig.cancelToken = createCancelToken(cancelKey);
    }

    try {
      const response = await authAxios.post(url, data, requestConfig);

      if (useCancellation) {
        removeCancelToken(cancelKey);
      }

      return response;
    } catch (error) {
      if (useCancellation) {
        removeCancelToken(cancelKey);
      }
      throw error;
    }
  };

  if (useQueue) {
    return defaultQueue.add(requestFn, priority);
  }

  return requestFn();
};

export const optimizedPut = async (url, data, config = {}) => {
  const {
    useCancellation = true,
    useQueue = false,
    priority = 0,
    ...restConfig
  } = config;

  const method = "PUT";
  const cancelKey = getCancelKey(url, method, {});

  const requestFn = async () => {
    const requestConfig = {
      ...restConfig,
      useCancellation,
    };

    if (useCancellation) {
      requestConfig.cancelToken = createCancelToken(cancelKey);
    }

    try {
      const response = await authAxios.put(url, data, requestConfig);

      if (useCancellation) {
        removeCancelToken(cancelKey);
      }

      return response;
    } catch (error) {
      if (useCancellation) {
        removeCancelToken(cancelKey);
      }
      throw error;
    }
  };

  if (useQueue) {
    return defaultQueue.add(requestFn, priority);
  }

  return requestFn();
};

export const optimizedDelete = async (url, config = {}) => {
  const {
    useCancellation = true,
    useQueue = false,
    priority = 0,
    ...restConfig
  } = config;

  const method = "DELETE";
  const cancelKey = getCancelKey(url, method, {});

  const requestFn = async () => {
    const requestConfig = {
      ...restConfig,
      useCancellation,
    };

    if (useCancellation) {
      requestConfig.cancelToken = createCancelToken(cancelKey);
    }

    try {
      const response = await authAxios.delete(url, requestConfig);

      if (useCancellation) {
        removeCancelToken(cancelKey);
      }

      return response;
    } catch (error) {
      if (useCancellation) {
        removeCancelToken(cancelKey);
      }
      throw error;
    }
  };

  if (useQueue) {
    return defaultQueue.add(requestFn, priority);
  }

  return requestFn();
};
