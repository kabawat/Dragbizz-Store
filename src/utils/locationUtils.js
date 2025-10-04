export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // "lat,lng"
        resolve(`${latitude},${longitude}`);
      },
      (error) => {
        // Geolocation error codes: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
        const errorMessages = {
          1: 'Permission denied - User denied the request for Geolocation',
          2: 'Position unavailable - Location information is unavailable',
          3: 'Request timeout - The request to get user location timed out'
        };
        
        const errorMessage = errorMessages[error.code] || `Unknown geolocation error: ${error.message}`;
        console.error('Geolocation error:', {
          code: error.code,
          message: error.message,
          description: errorMessage
        });
        
        // Reject with meaningful error instead of resolving with '0,0'
        reject(new Error(errorMessage));
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 300000
      }
    );
  });
};


// "latitude,longitude"
export const getUserLocation = async () => {
  try {
    const location = await getCurrentLocation();
    return location;
  } catch (error) {
    console.error('Failed to get user location:', error.message);
    // Return fallback location but preserve error information
    return '0,0';
  }
};

// Enhanced function that returns both location and error details
export const getUserLocationWithDetails = async () => {
  try {
    const location = await getCurrentLocation();
    return {
      location,
      success: true,
      error: null
    };
  } catch (error) {
    console.error('Failed to get user location:', error.message);
    return {
      location: '0,0',
      success: false,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN'
      }
    };
  }
};
