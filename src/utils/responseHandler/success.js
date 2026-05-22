// Handle successful API responses.
export const handleSuccess = (response) => {
    // Assuming backend sends { code, message, data, pagination }
    const responseBody = response?.data || {};

    const data = responseBody.data !== undefined ? responseBody.data : responseBody;
    const message = responseBody.message || 'Operation completed successfully.';
    const pagination = responseBody.pagination || null;

    return {
        success: true,
        data,
        message,
        pagination
    };
};
