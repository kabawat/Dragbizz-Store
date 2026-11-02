"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { customerAccountService } from "@/service";
import { mergeLedgerEntries } from "@/utils/khata/ledger.util";

function unwrapList(response) {
  const data = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(data) ? data : [];
}

export function useKhataLedger({ storeId, customerId, refreshKey = 0 }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);

  const reload = useCallback(async () => {
    if (!storeId || !customerId) {
      setTransactions([]);
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [txResponse, payResponse] = await Promise.all([
        customerAccountService.getTransactions({ store: storeId, customerId, limit: 50 }),
        customerAccountService.getPayments({ store: storeId, customerId, limit: 50 }),
      ]);
      setTransactions(unwrapList(txResponse));
      setPayments(unwrapList(payResponse));
    } catch (err) {
      setError(err?.message || t("khata.loadError"));
      setTransactions([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [storeId, customerId, t]);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  const entries = useMemo(
    () => mergeLedgerEntries(transactions, payments),
    [transactions, payments],
  );

  return { entries, loading, error, reload, transactions, payments };
}

export default useKhataLedger;
