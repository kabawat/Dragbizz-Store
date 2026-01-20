import { authAxios } from '@/service/config/axiosConfig';
import {
  generateCacheKey,
  getCachedResponse,
  setCachedResponse,
} from './requestCache';
import {
  getPendingRequest,
  setPendingRequest,
  getRequestKey as getDedupKey,
} from './requestDeduplication';
import {
  createCancelToken,
  removeCancelToken,
  getRequestKey as getCancelKey,
} from './requestCancellation';
import { defaultQueue } from './requestQueue';

const createOptimizedRequest = (method) => {
  return async (url, dataOrConfig = {}, config = {}) => {
    const isGet = method === 'GET';
    const params = isGet ? (dataOrConfig.params || {}) : {};
    const requestData = isGet ? undefined : dataOrConfig;
    const requestConfig = isGet ? dataOrConfig : config;

    const {
      useCache = isGet,
      useDeduplication = true,
      useCancellation = true,
      useQueue = false,
      cacheTTL = 5 * 60 * 1000,
      priority = 0,
      ...restConfig
    } = requestConfig;

    const cacheKey = generateCacheKey(url, method, params);
    const dedupKey = getDedupKey(url, method, params);
    const cancelKey = getCancelKey(url, method, params);

    if (useCache && isGet) {
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return Promise.resolve({
          data: cached,
          fromCache: true,
          config: restConfig,
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
      const axiosConfig = {
        ...restConfig,
        useCache,
        useDeduplication,
        useCancellation,
      };

      if (isGet) {
        axiosConfig.params = params;
      }

      if (useCancellation) {
        axiosConfig.cancelToken = createCancelToken(cancelKey);
      }

      try {
        let response;
        if (isGet) {
          response = await authAxios.get(url, axiosConfig);
        } else if (method === 'POST') {
          response = await authAxios.post(url, requestData, axiosConfig);
        } else if (method === 'PUT') {
          response = await authAxios.put(url, requestData, axiosConfig);
        } else if (method === 'DELETE') {
          response = await authAxios.delete(url, axiosConfig);
        } else {
          response = await authAxios.request({
            url,
            method,
            data: requestData,
            ...axiosConfig,
          });
        }

        if (useCache && isGet) {
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
};

export const optimizedGet = createOptimizedRequest('GET');
export const optimizedPost = createOptimizedRequest('POST');
export const optimizedPut = createOptimizedRequest('PUT');
export const optimizedDelete = createOptimizedRequest('DELETE');

export default {
  get: optimizedGet,
  post: optimizedPost,
  put: optimizedPut,
  delete: optimizedDelete,
};

