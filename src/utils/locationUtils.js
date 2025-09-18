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
        console.error('Geolocation error:', error);
        resolve('0,0');
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
    console.error('Failed to get user location:', error);
    return '0,0';
  }
};
