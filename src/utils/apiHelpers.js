export const createApiHandler = (serviceMethod) => {
  return async (...args) => {
    try {
      const response = await serviceMethod(...args);
      return {
        success: true,
        data: response.data || response,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message || "An error occurred",
      };
    }
  };
};

export const handleApiResponse = (response, onSuccess, onError) => {
  if (response.success) {
    if (onSuccess) onSuccess(response.data);
    return response.data;
  } else {
    if (onError) onError(response.error);
    throw new Error(response.error);
  }
};

export const createListHandler = (serviceMethod) => {
  return async (params = {}) => {
    try {
      const response = await serviceMethod(params);
      return {
        success: true,
        data: response.data?.data || response.data || [],
        pagination: response.data?.pagination || null,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        error: error.response?.data || error.message || "Failed to fetch data",
      };
    }
  };
};

export const createCreateHandler = (serviceMethod) => {
  return async (data) => {
    try {
      const response = await serviceMethod(data);
      return {
        success: true,
        data: response.data || response,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message || "Failed to create",
      };
    }
  };
};

export const createUpdateHandler = (serviceMethod) => {
  return async (id, data) => {
    try {
      const response = await serviceMethod(id, data);
      return {
        success: true,
        data: response.data || response,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message || "Failed to update",
      };
    }
  };
};

export const createDeleteHandler = (serviceMethod) => {
  return async (id) => {
    try {
      await serviceMethod(id);
      return {
        success: true,
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message || "Failed to delete",
      };
    }
  };
};
