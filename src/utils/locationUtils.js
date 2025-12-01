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
        const errorMessages = {
          1: 'Permission denied - User denied the request for Geolocation',
          2: 'Position unavailable - Location information is unavailable',
          3: 'Request timeout - The request to get user location timed out'
        };
        
        const errorMessage = errorMessages[error.code] || `Unknown geolocation error: ${error.message}`;
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
