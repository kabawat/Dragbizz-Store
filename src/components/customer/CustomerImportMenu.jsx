"use client";
import { CustomerImportMenuPresentation } from "@dragorbit/features/customers";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";

import { useTranslation } from "@/hooks/ui/useTranslation";

const CustomerImportMenu = forwardRef(function CustomerImportMenu(
  { onBulkUpload, onOpeningBalance, className = "" },
  ref,
) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useImperativeHandle(ref, () => ({
    close: () => setIsOpen(false),
    isOpen: () => isOpen,
  }));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (action) => {
    setIsOpen(false);
    action?.();
  };

  return (
    <CustomerImportMenuPresentation
      model={{
        className,
        menuRef,
        setIsOpen,
        t,
        isOpen,
        handleSelect,
        onOpeningBalance,
        onBulkUpload,
      }}
    />
  );
});

export default CustomerImportMenu;
