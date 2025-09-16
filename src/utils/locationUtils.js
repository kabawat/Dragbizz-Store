// current location using browser geolocation API
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Return coordinates in format "lat,lng"
        resolve(`${latitude},${longitude}`);
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Fallback to default location
        resolve('0,0');
      },
      {
        timeout: 10000, // 10 seconds timeout
        enableHighAccuracy: true,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  });
};


// Location string in format "latitude,longitude"
export const getUserLocation = async () => {
  try {
    const location = await getCurrentLocation();
    return location;
  } catch (error) {
    console.error('Failed to get user location:', error);
    return '0,0';
  }
};
