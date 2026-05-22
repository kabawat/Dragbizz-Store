"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FileQuestion, Home } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

export default function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[rgb(var(--color-bg-secondary))] p-4">
      <div className="max-w-md w-full">
        <EmptyState
          icon={FileQuestion}
          title={t("errors.pageNotFound")}
          description={t("errors.pageNotFoundDescription")}
          actionButton={{
            label: t("errors.backToDashboard"),
            onClick: () => router.push("/dashboard"),
            icon: Home,
          }}
          type="empty"
          className="bg-[rgb(var(--color-bg-primary))] rounded-3xl border border-[rgb(var(--color-border-primary))] shadow-sm p-12"
        />
      </div>
    </div>
  );
}
