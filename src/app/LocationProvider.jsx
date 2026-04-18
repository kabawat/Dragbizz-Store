"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getUserLocationWithDetails } from "@/utils/locationUtils";

const LocationContext = createContext();

// Provides user geolocation for store creation
export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState("0,0");

  useEffect(() => {
    const fetchLocation = async () => {
      const result = await getUserLocationWithDetails();
      if (result?.location) setUserLocation(result.location);
    };
    fetchLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ userLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

// Hook for location context
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within LocationProvider");
  return context;
};

