"use client";

import { CategoriesScreen } from "@dragorbit/features/categories";
import { BrandsScreen } from "@dragorbit/features/brands";
import { VariantsScreen } from "@dragorbit/features/variants";
import { CashbookScreen } from "@dragorbit/features/cashbook";
import { ProductListHeaderView, ProductsScreen } from "@dragorbit/features/products";
import { DashboardScreen } from "@dragorbit/features/dashboard";
import { TableSkeleton } from "@dragorbit/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

const noop = () => {};
const cannot = () => false;
const repository = {};

function ProductLoadingHeader() {
  const { t } = useTranslation();
  return <ProductListHeaderView model={{
    t, searchValue: "", setSearchValue: noop, showInCatalog: "", setShowInCatalog: noop,
    getCatalogOptions: () => [{value: "", label: t("products.allVisibility")}],
    category: "", setCategory: noop, categoryOptions: [], categoriesLoading: true,
    sortBy: "", setSortBy: noop,
    getSortOptions: () => [{value: "", label: t("products.defaultSort")}],
    handleViewModeChange: noop, viewMode: "table",
  }} />;
}

/** Presentation only: never mounts page adapters or starts protected requests. */
export default function DashboardContentLoading({ pathname, storeId }) {
  const { t } = useTranslation();
  const model = {
    t, loading: true, categories: [], brands: [], variants: [],
    canCreate: false, can: cannot, setShowDrawer: noop,
  };
  let content;
  switch (pathname) {
    case "/dashboard/categories":
      content = <CategoriesScreen model={model} />;
      break;
    case "/dashboard/brands":
      content = <BrandsScreen model={model} />;
      break;
    case "/dashboard/variants":
      content = <VariantsScreen model={model} />;
      break;
    case "/dashboard/products":
      content = <ProductsScreen model={{t, products: [], isLoading: true, ProductListHeader: ProductLoadingHeader}} />;
      break;
    case "/dashboard/cashbook":
      content = <CashbookScreen t={t} amount="" description="" setAmount={noop} setDescription={noop}
        handleCashIn={noop} handleCashOut={noop} onRefresh={noop} listLoading disabled />;
      break;
    case "/dashboard":
      content = <DashboardScreen t={t} repository={repository} ready={false} storeId={storeId} />;
      break;
    default:
      content = <div className="px-5 py-4"><TableSkeleton label={t("common.loading")} /></div>;
  }
  // These controls describe the layout only; they must not accept user actions.
  return <div inert aria-busy="true">{content}</div>;
}
