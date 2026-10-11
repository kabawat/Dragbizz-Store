"use client";
import { SuggestionDetailScreen } from "@dragorbit/features/support";

import { Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getSuggestionById,
  upvoteSuggestion,
  deleteSuggestion,
} from "@/store/slices/suggestionsSlice";
import { Badge } from "@/components/ui";

const ViewSuggestionPage = ({ suggestionId }) => {
  const backLinkProps = { href: "/dashboard/support" };
  const { t } = useTranslation();

  useDashboardHeader(t("suggestions.title"), t("suggestions.description"));
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { selectedSuggestion: suggestion, isLoading } = useAppSelector(
    (state) => state.suggestions,
  );
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (suggestionId && storeId) {
      dispatch(getSuggestionById({ id: suggestionId, storeId }));
    }
  }, [suggestionId, storeId, dispatch]);

  const handleVote = async () => {
    if (!suggestion) return;
    dispatch(upvoteSuggestion(suggestion.id || suggestion._id));
  };

  const handleDeleteSuggestion = async () => {
    if (!suggestionId || !storeId) return;

    setIsDeleting(true);
    try {
      const result = await dispatch(
        deleteSuggestion({ id: suggestionId, storeId }),
      );
      if (deleteSuggestion.fulfilled.match(result)) {
        router.push("/dashboard/support");
      }
    } catch (_error) {
      // Error handled by slice/toast
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      REQUESTED: {
        variant: "secondary",
        label: t("suggestions.status.REQUESTED"),
      },
      UNDER_REVIEW: {
        variant: "purple",
        label: t("suggestions.status.UNDER_REVIEW"),
      },
      PLANNED: { variant: "info", label: t("suggestions.status.PLANNED") },
      IN_PROGRESS: {
        variant: "warning",
        label: t("suggestions.status.IN_PROGRESS"),
      },
      COMPLETED: {
        variant: "success",
        label: t("suggestions.status.COMPLETED"),
      },
      DISCARDED: {
        variant: "danger",
        label: t("suggestions.status.DISCARDED"),
      },
    };

    const config = statusConfig[status] || {
      variant: "default",
      label: status,
    };
    return (
      <Badge variant={config.variant} size="md">
        {config.label}
      </Badge>
    );
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      FEATURE: { variant: "primary" },
      UI_UX: { variant: "purple" },
      REPORT: { variant: "danger" },
      THEME: { variant: "pink" },
      INTEGRATION: { variant: "indigo" },
      OTHER: { variant: "outline" },
    };

    const config = categoryConfig[category] || { variant: "outline" };
    return (
      <Badge variant={config.variant} size="md" className="gap-2">
        <Tag className="w-4 h-4" />
        {t(`suggestions.categories.${category}`) || category}
      </Badge>
    );
  };

  if (isLoading && !suggestion) {
    return (
      <div className="flex h-screen relative w-full overflow-hidden">
        <div className="min-h-screen w-full flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SuggestionDetailScreen
      model={{
        Link,
        backLinkProps,
        t,
        suggestion,
        isLoading,
        getStatusBadge,
        getCategoryBadge,
        setShowDeleteModal,
        showDeleteModal,
        isDeleting,
        handleDeleteSuggestion,
      }}
    />
  );
};

export default ViewSuggestionPage;
