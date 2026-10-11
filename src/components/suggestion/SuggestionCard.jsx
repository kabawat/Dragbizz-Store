"use client";
import { SuggestionCardView } from "@dragorbit/features/support";

import { Tag } from "lucide-react";

import Link from "next/link";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { Badge } from "@/components/ui/Badge";

const SuggestionCard = ({ item, onVote }) => {
  const { t } = useTranslation();
  const suggestionId = item.id || item._id;
  const suggestionLinkProps = {
    href: `/dashboard/support/view/${suggestionId}`,
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
      <Badge variant={config.variant} size="xs">
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
      <Badge variant={config.variant} size="xs" className="gap-1">
        <Tag className="w-2.5 h-2.5" />
        {t(`suggestions.categories.${category}`) || category}
      </Badge>
    );
  };

  return (
    <SuggestionCardView
      model={{
        Link,
        suggestionLinkProps,
        getStatusBadge,
        item,
        getCategoryBadge,
        onVote,
        suggestionId,
        t,
      }}
    />
  );
};

export default SuggestionCard;
