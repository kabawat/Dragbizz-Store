"use client";

import { MessageSquare, ThumbsUp, Calendar, Tag, ChevronRight } from "lucide-react";
import React from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { Badge } from "@/components/ui/Badge";

const SuggestionCard = ({ item, onVote }) => {
    const { t } = useTranslation();
    const suggestionId = item.id || item._id;

    const getStatusBadge = (status) => {
        const statusConfig = {
            REQUESTED: { variant: "secondary", label: t("suggestions.status.REQUESTED") },
            UNDER_REVIEW: { variant: "purple", label: t("suggestions.status.UNDER_REVIEW") },
            PLANNED: { variant: "info", label: t("suggestions.status.PLANNED") },
            IN_PROGRESS: { variant: "warning", label: t("suggestions.status.IN_PROGRESS") },
            COMPLETED: { variant: "success", label: t("suggestions.status.COMPLETED") },
            DISCARDED: { variant: "danger", label: t("suggestions.status.DISCARDED") },
        };

        const config = statusConfig[status] || { variant: "default", label: status };
        return <Badge variant={config.variant} size="xs">{config.label}</Badge>;
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
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))]/40 transition-all duration-300 flex flex-col h-full group overflow-hidden">
            <Link href={`/dashboard/support/view/${suggestionId}`} className="flex-1 flex flex-col">
                {/* Header with Badges */}
                <div className="p-4 flex items-center justify-between border-b border-[rgb(var(--color-border-primary))]/50 bg-[rgb(var(--color-bg-secondary))]/30">
                    <div className="flex gap-2">
                        {getStatusBadge(item.status)}
                        {getCategoryBadge(item.category)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[rgb(var(--color-text-tertiary))] font-medium uppercase tracking-wider">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-primary))] transition-colors line-clamp-1 mb-2">
                        {item.title}
                    </h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] line-clamp-3 flex-1 leading-relaxed">
                        {item.description}
                    </p>
                </div>
            </Link>

            {/* Footer with Actions */}
            <div className="px-5 py-3 border-t border-[rgb(var(--color-border-primary))]/50 bg-[rgb(var(--color-bg-secondary))]/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onVote(suggestionId);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${item.isVoted
                            ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30 text-[rgb(var(--color-primary))]"
                            : "border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]"
                            }`}
                    >
                        <ThumbsUp className={`w-4 h-4 ${item.isVoted ? "fill-current" : ""}`} />
                        <span className="text-sm font-bold">{item.upvotes || 0}</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-[rgb(var(--color-text-tertiary))]">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.commentsCount || 0}</span>
                    </div>
                </div>

                <Link
                    href={`/dashboard/support/view/${suggestionId}`}
                    className="flex items-center gap-1 text-[10px] font-bold text-[rgb(var(--color-primary))] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"
                >
                    {t("common.viewDetails") || "View Details"}
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
};

export default SuggestionCard;
