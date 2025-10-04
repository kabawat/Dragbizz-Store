"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserLocationWithDetails } from '@/utils/locationUtils';

// Create Location Context
const LocationContext = createContext();

// Location Provider Component
export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState('0,0');
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const requestLocation = async () => {
      setLocationLoading(true);
      setLocationError(null);
      
      const result = await getUserLocationWithDetails();
      setUserLocation(result.location);
      
      if (!result.success && result.error) {
        console.error('App Layout - Failed to get location:', result.error.message);
        setLocationError(result.error.message);
      }
      
      setLocationLoading(false);
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
