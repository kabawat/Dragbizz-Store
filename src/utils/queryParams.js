export const attachQueryParams = (baseUrl, params = {}) => {
  if (!baseUrl) {
    return '';
  }
  
  if (!params || typeof params !== 'object' || Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    // Skip null, undefined, and empty values
    if (value === null || value === undefined || value === '') {
      return;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length > 0) {
        value.forEach(item => {
          queryParams.append(key, item);
        });
      }
    } else {
      // Handle primitive values
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  
  if (!queryString) {
    return baseUrl;
  }
  
  // Check if URL already has query parameters
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
};

export default attachQueryParams;
