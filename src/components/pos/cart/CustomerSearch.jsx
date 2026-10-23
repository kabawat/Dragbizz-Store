"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, User, X } from "lucide-react";
import { customerService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/hooks/ui/useTranslation";

const getCustomerList = (response) => {
  const body = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.customers)) return body.customers;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

const CustomerSearch = ({ customer, onSelect }) => {
  const { t } = useTranslation();
  const selectedStore = useAppSelector((state) => state.profile.selectedStore);
  const storeId = selectedStore?.storeId || selectedStore?._id;
  const [query, setQuery] = useState(customer?.name || "");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const loadedStoreId = useRef(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (customer) setQuery(customer.name || "");
  }, [customer]);

  useEffect(() => {
    if (loadedStoreId.current !== storeId) {
      loadedStoreId.current = null;
      setCustomers([]);
    }
  }, [storeId]);

  const filteredCustomers = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return customers;
    return customers.filter((item) =>
      [item.name, item.phone, item.email]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase().includes(term)),
    );
  }, [customers, query]);

  const loadCustomers = async () => {
    if (!storeId || loadedStoreId.current === storeId || loading) return;
    const currentRequest = ++requestId.current;
    setLoading(true);
    try {
      const response = await customerService.getCustomers({
        limit: 100,
        lightweight: true,
        store: storeId,
      });
      if (currentRequest !== requestId.current) return;
      setCustomers(getCustomerList(response));
      loadedStoreId.current = storeId;
    } catch {
      if (currentRequest === requestId.current) setCustomers([]);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  };

  const showCustomers = () => {
    setOpen(true);
    loadCustomers();
  };

  const selectCustomer = (item) => {
    const normalized = { ...item, id: item.id || item._id };
    onSelect(normalized);
    setQuery(normalized.name || "");
    setOpen(false);
  };

  const clearSelection = () => {
    onSelect(null);
    setQuery("");
    setOpen(true);
    loadCustomers();
  };

  return (
    <div className="px-4 py-2 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgb(var(--color-text-secondary))]" />
        <input
          type="text"
          placeholder={t("invoice.searchCustomers")}
          value={query}
          onFocus={showCustomers}
          onChange={(event) => {
            onSelect(null);
            setQuery(event.target.value);
            setOpen(true);
            loadCustomers();
          }}
          className="w-full pl-8 pr-8 py-2 text-xs bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-secondary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary))] transition-all"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            onClick={clearSelection}
            aria-label={t("common.clear")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[rgb(var(--color-text-secondary))]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {open && (
          <div className="absolute z-40 top-full left-0 right-0 mt-1 max-h-56 overflow-auto rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] shadow-lg">
            {loading ? (
              <div className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))]">
                {t("invoice.loadingCustomers")}
              </div>
            ) : filteredCustomers.length ? (
              <>
                <button
                  type="button"
                  role="option"
                  onClick={clearSelection}
                  className="w-full border-b border-[rgb(var(--color-border-primary))] px-3 py-2 text-left text-xs text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))]"
                >
                  {t("invoice.walkInCustomer")}
                </button>
                {filteredCustomers.map((item) => (
                  <button
                    key={item.id || item._id}
                    type="button"
                    role="option"
                    onClick={() => selectCustomer(item)}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-[rgb(var(--color-bg-secondary))]"
                  >
                    <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[rgb(var(--color-text-secondary))]" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-[rgb(var(--color-text-primary))]">
                        {item.name || t("errors.unknown")}
                      </span>
                      <span className="block truncate text-[11px] text-[rgb(var(--color-text-secondary))]">
                        {[item.phone, item.email].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </button>
                ))}
              </>
            ) : (
              <div className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))]">
                {query.trim() ? t("pos.noCustomersFound") : t("customers.noCustomers")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSearch;
