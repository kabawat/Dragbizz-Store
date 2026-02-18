"use client";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CreateCustomer } from "@/components/customer";
import CustomerEmptyState from "@/components/customer/list/CustomerEmptyState";
import CustomerListContent from "@/components/customer/list/CustomerListContent";
import CustomerListHeader from "@/components/customer/list/CustomerListHeader";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { SideDrawer } from "@/components/ui";
import { useCommonHotkeys } from "@/hooks/useCommonHotkeys";
import { useTranslation } from "@/hooks/useTranslation";
import { customerService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/customersSlice";

const CustomersPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { viewMode } = useAppSelector((state) => state.customers);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ hasNextPage: false, nextCursor: null });
  const [searchValue, setSearchValue] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);

  const scrollRef = useRef(null);
  const lastFetchRef = useRef(null);

  // Global page Hotkeys
  useCommonHotkeys({
    onNew: () => setShowCustomerDrawer(true),
    onClose: () => {
      if (showCustomerDrawer) setShowCustomerDrawer(false);
    },
    onBack: () => router.push("/dashboard"),
  });

  const fetchCustomers = useCallback(
    async (isLoadMore = false, cursor = null) => {
      if (!storeId && !isLoadMore) return;

      const params = {
        search: searchValue,
        limit: 10,
        nextCursor: isLoadMore ? cursor : null,
        ...(storeId && { store: storeId })
      };

      const fetchKey = `${storeId}-${searchValue}-${isLoadMore}-${cursor}`;
      if (lastFetchRef.current === fetchKey) return;



      lastFetchRef.current = fetchKey;

      try {
        if (isLoadMore) setIsLoadingMore(true); else setIsLoading(!isLoadMore && customers.length === 0);
        setError(null);

        const result = await customerService.getCustomers(params);
        if (result.success) {
          const customersData = result.data?.data || result.data || [];
          if (isLoadMore) setCustomers((prev) => [...prev, ...customersData]);
          else {
            setCustomers(customersData);

          }
          const p = result.pagination || result.data?.pagination;
          setPagination({
            hasNextPage: p?.hasNextPage ?? p?.hasNext ?? false,
            nextCursor: p?.nextCursor ?? result.nextCursor ?? null,
          });
        } else setError(result.message || "Error");
      } catch (err) { setError(err.message || "Error"); }
      finally { if (isLoadMore) setIsLoadingMore(false); else setIsLoading(false); }
    },
    [storeId, searchValue]
  );

  useEffect(() => {
    lastFetchRef.current = null;

    setPagination({ hasNextPage: false, nextCursor: null });
  }, [storeId, searchValue]);

  useEffect(() => {
    if (!storeId) return;
    const timer = setTimeout(() => fetchCustomers(false), 350);
    return () => clearTimeout(timer);
  }, [storeId, searchValue, fetchCustomers]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !pagination.hasNextPage || !pagination.nextCursor) return;
    await fetchCustomers(true, pagination.nextCursor);
  }, [isLoadingMore, pagination, fetchCustomers]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isLoadingMore || !pagination.hasNextPage || !pagination.nextCursor) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) handleLoadMore();
    };
    const el = scrollRef.current;
    if (el) { el.addEventListener("scroll", handleScroll); return () => el.removeEventListener("scroll", handleScroll); }
  }, [isLoadingMore, pagination, handleLoadMore]);

  const handleCustomerSuccess = async () => {
    lastFetchRef.current = null;

    await fetchCustomers(false);
    setShowCustomerDrawer(false);
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        <Header title={t("customers.title")} description={t("customers.description")} />
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            <CustomerListHeader
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              viewMode={viewMode}
              onViewModeChange={(m) => { dispatch(setViewMode(m)); localStorage.setItem("customers-view-mode", m); }}
              onAddCustomer={() => setShowCustomerDrawer(true)}
              onSuccess={handleCustomerSuccess}
              hasCustomers={customers.length > 0}
              selectedStore={selectedStore}
              t={t}
            />

            {isLoading && customers.length === 0 && !error && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
                </div>
              </div>
            )}

            <CustomerEmptyState
              isLoading={isLoading}
              customersCount={customers.length}
              error={error}
              searchValue={searchValue}
              onClearSearch={() => setSearchValue("")}
              onAddCustomer={() => setShowCustomerDrawer(true)}
              t={t}
            />

            <CustomerListContent
              customers={customers}
              setCustomers={setCustomers}
              viewMode={viewMode}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              pagination={pagination}
              onLoadMore={handleLoadMore}
              onEdit={(id) => router.push(`/dashboard/customers/edit/${id}`)}
              onViewDetails={(id) => router.push(`/dashboard/customers/view/${id}`)}
              scrollRef={scrollRef}
              selectedStore={selectedStore}
              t={t}
            />
          </div>
        </div>
      </div>

      <SideDrawer
        isOpen={showCustomerDrawer}
        onClose={() => setShowCustomerDrawer(false)}
        title={t("customers.addNewCustomer")}
        icon={Users}
        width="w-full md:w-2/3 lg:w-1/2"
      >
        <div className="p-6 h-full">
          <CreateCustomer
            storeId={storeId || ""}
            onSuccess={handleCustomerSuccess}
            onCancel={() => setShowCustomerDrawer(false)}
            showCancelButton={true}
            autoRedirect={false}
            mode="drawer"
          />
        </div>
      </SideDrawer>
    </div>
  );
};

export default CustomersPage;
