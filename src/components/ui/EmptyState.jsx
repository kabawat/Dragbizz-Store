"use client";
import React from "react";
import { LucideIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";

const EmptyState = ({
  title,
  description,
  icon: Icon,
  type = "empty",
  actionButton,
  className = "",
  fullHeight = false,
}) => {
  const router = useRouter();

  // Color mapping based on type
  const typeStyles = {
    empty: {
      iconBg: "bg-[rgb(var(--color-primary))]/10",
      iconColor: "text-[rgb(var(--color-primary))]",
    },
    error: {
      iconBg: "bg-red-50 dark:bg-red-900/10",
      iconColor: "text-red-500",
    },
    info: {
      iconBg: "bg-blue-50 dark:bg-blue-900/10",
      iconColor: "text-blue-500",
    },
  };

  const activeStyle = typeStyles[type] || typeStyles.empty;

  // Base classes for the container
  const containerClasses = `flex flex-col items-center justify-center text-center p-8 w-full ${fullHeight ? "min-h-[60vh] flex-1" : ""} ${className}`;

  return (
    <div className={containerClasses.trim()}>
      {/* Icon Section */}
      {Icon && (
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-75 duration-300 ${activeStyle.iconBg}`}>
          <Icon className={`w-10 h-10 ${activeStyle.iconColor}`} />
        </div>
      )}

      {/* Content Section */}
      <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2 max-w-lg">
        {title}
      </h2>
      <p className="text-[rgb(var(--color-text-secondary))] text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
        {description}
      </p>

      {/* Action Button Section */}
      {actionButton && (
        <div className="animate-in slide-in-from-bottom-2 duration-400">
          <Button
            variant={actionButton.variant || "primary"}
            onClick={actionButton.onClick}
            leftIcon={actionButton.icon}
            className="px-6"
          >
            {actionButton.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
