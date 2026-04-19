"use client";
import { useEffect } from "react";
import { useHeader } from "@/contexts/HeaderContext";

export const useDashboardHeader = (title, description) => {
  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader({ title, description });

    // Optional: Reset header on unmount? 
    // Usually not needed because the next page will set its own.
  }, [title, description, setHeader]);
};
