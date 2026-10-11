"use client";
import { StoreHeaderView } from "@dragorbit/features/settings";

const StoreHeader = ({ storesCount = 0, isLoading = false, onAddStore }) => {
  return <StoreHeaderView model={{ isLoading, storesCount }} />;
};

export default StoreHeader;
