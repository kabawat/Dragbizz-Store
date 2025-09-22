"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserLocation } from '@/utils/locationUtils';

// Create Location Context
const LocationContext = createContext();

// Location Provider Component
export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState('0,0');
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const requestLocation = async () => {
      try {
        setLocationLoading(true);
        setLocationError(null);
        
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (error) {
        console.error('App Layout - Failed to get location:', error);
        setLocationError(error.message);
        setUserLocation('0,0');
      } finally {
        setLocationLoading(false);
      }
    };

    requestLocation();
  }, []);

  const value = {
    userLocation,
    locationLoading,
    locationError,
    setUserLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

// Hook to use location context
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
