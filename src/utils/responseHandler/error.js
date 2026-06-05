//  Handle API error responses 
export const handleError = (error) => {
    // Check if it's a response error from the server
    if (error.response && error.response.data) {
        const responseData = error.response.data;
        const message = responseData.message || responseData.error || 'An unexpected error occurred.';
        const code = responseData.code || 'UNKNOWN_ERROR';
        const fields = responseData.fields || null;

        return {
            success: false,
            message,
            code,
            fields,
            status: error.response.status
        };
    }

    // Network or other client-side error
    return {
        success: false,
        message: error.message || 'Network error occurred. Please try again later.',
        code: 'NETWORK_ERROR',
        fields: null,
        status: null
    };
};
