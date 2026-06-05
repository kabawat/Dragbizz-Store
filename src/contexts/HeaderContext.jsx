"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
  const [headerContent, setHeaderContent] = useState({ title: "", description: "" });

  const setHeader = useCallback((content) => {
    setHeaderContent(content);
  }, []);

  return (
    <HeaderContext.Provider value={{ headerContent, setHeader }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
};
