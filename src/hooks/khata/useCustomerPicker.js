"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { customerService } from "@/service";

function normalizeCustomer(row) {
  if (!row) return null;
  return {
    ...row,
    id: row.id ?? row._id,
    account: row.account ?? null,
    totalDue: row.account?.totalDue ?? row.totalDue ?? 0,
  };
}

export function useCustomerPicker({ storeId, search = "", limit = 20 }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCustomers = useCallback(async () => {
    if (!storeId) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getCustomers({
        store: storeId,
        includeAccount: true,
        search: search.trim() || undefined,
        limit,
      });
      const rows = unwrapList(response).map(normalizeCustomer).filter(Boolean);
      setCustomers(rows);
    } catch (err) {
      setError(err?.message || "Failed to load customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [storeId, search, limit]);

  useEffect(() => {
    const timer = setTimeout(() => loadCustomers(), 300);
    return () => clearTimeout(timer);
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => customers, [customers]);

  return {
    customers: filteredCustomers,
    loading,
    error,
    reload: loadCustomers,
  };
}

function unwrapList(response) {
  const data = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(data) ? data : [];
}

export default useCustomerPicker;
