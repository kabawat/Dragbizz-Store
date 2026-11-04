"use client";
import { VariantsScreen } from "@dragorbit/features/variants";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { StockInDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { variantService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { unwrapVariantList, variantDisplayLabel } from "@/utils/variantForm";

const VariantsPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("sidebar.variants"),
    t("sidebar.variantsDescription") || "Product variants and pricing"
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const { showSuccess } = useGlobalToast();
  const { can, loading: permissionsLoading } = useModulePermissions("product");
  const { execute, loading: requestLoading } = useApiResponse();
  const [resolvedStoreId, setResolvedStoreId] = useState(null);
  const [error, setError] = useState(null);
  const loading = requestLoading || resolvedStoreId !== storeId;
  const { execute: executeDelete, loading: isDeleting } = useApiResponse();
  const [variants, setVariants] = useState([]);
  const [variantToDelete, setVariantToDelete] = useState(null);

  const fetchVariants = useCallback(async () => {
    if (!storeId) return;
    setError(null);
    const result = await execute(
      variantService.getVariants({ store: storeId, isDefault: false, limit: 20 }),
      { showToast: false }
    );
    if (!result || result.success === false || result.status === false) {
      setError(result?.message || t("products.loadFailed"));
    } else {
      setVariants(unwrapVariantList(result?.data));
    }
    setResolvedStoreId(storeId);
  }, [storeId, execute, t]);

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const handleConfirmDelete = async (options = {}) => {
    if (!variantToDelete) return;
    const id = variantToDelete._id || variantToDelete.id;
    const result = await executeDelete(
      variantService.deleteVariant(id, storeId, options),
      {
        message:
          t("products.variantDeleteSuccess") || "Variant deleted successfully",
      }
    );
    if (result?.success) {
      setVariantToDelete(null);
      fetchVariants();
    }
    return result;
  };

  const handleStockInSuccess = useCallback(
    (message) => {
      showSuccess(message);
      fetchVariants();
    },
    [showSuccess, fetchVariants]
  );

  return (
    <VariantsScreen
      model={{
        t,
        variants: resolvedStoreId === storeId ? variants : [],
        can,
        variantDisplayLabel,
        setVariantToDelete,
        loading,
        error,
        variantToDelete,
        isDeleting,
        handleConfirmDelete,
        StockInDrawer,
        handleStockInSuccess,
        onCreate: () => router.push("/dashboard/variants/add"),
        onEdit: (id) => router.push(`/dashboard/variants/edit/${id}`),
        onView: (id) => router.push(`/dashboard/variants/view/${id}`),
      }}
    />
  );
};

export default VariantsPage;
