"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CustomerListContent from "@/components/customer/list/CustomerListContent";
import CustomerListHeader from "@/components/customer/list/CustomerListHeader";
import { EmptyState, PageLoader } from "@/components/ui";
import { Users, Search } from "lucide-react";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/customers/customerSlice";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";

const CustomersPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useDashboardHeader(t("customers.title"), t("customers.description"));

  const [searchValue, setSearchValue] = useState("");
  const [isActive, setIsActive] = useState("");
  const [source, setSource] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasDueOnly, setHasDueOnly] = useState(false);

  const { customers, isLoading, error } = useAppSelector((state) => state.customers);

  useEffect(() => {
    const savedViewMode = localStorage.getItem("customers-view-mode");
    if (savedViewMode === "table" || savedViewMode === "card") {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
  });

  const handleBulkSuccess = useCallback(() => {}, []);

  const isFiltered = Boolean(searchValue || isActive || source || startDate || endDate || hasDueOnly);

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto">
        <CustomerListHeader
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          isActive={isActive}
          setIsActive={setIsActive}
          source={source}
          setSource={setSource}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          hasDueOnly={hasDueOnly}
          setHasDueOnly={setHasDueOnly}
          onSuccess={handleBulkSuccess}
        />

        <div className="px-5">
          {isLoading && customers.length === 0 && !error && <PageLoader />}

          {!isLoading && customers.length === 0 && (
            <EmptyState
              className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
              title={isFiltered ? t("common.noResults") : t("customers.noCustomers")}
              description={
                error
                  ? `${t("common.error")}: ${error}`
                  : isFiltered
                    ? `${t("common.noResultsFoundFor")} "${searchValue || t("common.filters")}"`
                    : t("customers.emptyDescription")
              }
              icon={isFiltered ? Search : Users}
              type={error ? "error" : "empty"}
            />
          )}

          {customers.length > 0 && (
            <CustomerListContent
              searchValue={searchValue}
              isActive={isActive}
              source={source}
              startDate={startDate}
              endDate={endDate}
              hasDueOnly={hasDueOnly}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
