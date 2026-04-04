"use client";
import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Info } from "lucide-react";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/ui/useTranslation";

const SortableSection = ({
  id,
  title,
  subtitle,
  icon: Icon,
  children,
  onInfoClick,
}) => {
  const { themeConfig, currentVariant } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Theme-aware glass effect styles
  const getGlassStyles = () => {
    const isDark = currentVariant === "dark";

    if (isDark) {
      return {
        card: `backdrop-blur-[1px] bg-black/20 border border-white/20 shadow-xl`,
        header: `border-b border-white/15`,
        body: ``,
        icon: `bg-[${themeConfig.primary}]/20 backdrop-blur-sm  border-[${themeConfig.primary}]/10`,
        dragHandle: `backdrop-blur-sm bg-black/10 hover:bg-black/20`,
        title: `text-white`,
        description: `text-gray-300`,
      };
    } else {
      return {
        card: `backdrop-blur-[1px] bg-white/20 border border-gray-200/30`,
        header: `backdrop-blur-sm border-b border-gray-200/20`,
        body: `backdrop-blur-sm`,
        icon: `bg-[${themeConfig.primary}]/20 backdrop-blur-sm border border-gray-200/60`,
        dragHandle: `backdrop-blur-sm bg-white/10 hover:bg-white/20`,
        title: `text-gray-800`,
        description: `text-gray-600`,
      };
    }
  };

  const glassStyles = getGlassStyles();

  return (
    <div ref={setNodeRef} style={style} className="break-inside-avoid">
      <Card
        className={`relative ${glassStyles.card}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={`absolute top-2 right-2 p-2 cursor-grab active:cursor-grabbing text-gray-600 z-50 ${glassStyles.dragHandle} ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <CardHeader className={`${glassStyles.header} pr-20`}>
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 backdrop-blur-sm rounded-lg ${glassStyles.icon}`}
            >
              <Icon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <CardTitle className={`text-lg ${glassStyles.title}`}>
                  {title}
                </CardTitle>
                <button
                  onClick={() => onInfoClick(id)}
                  className="p-1 hover:bg-[rgb(var(--color-bg-secondary))] rounded-full transition-colors duration-200 group/info cursor-pointer"
                  title={t("products.sectionInformation")}
                >
                  <Info className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] group-hover/info:text-[rgb(var(--color-primary))]" />
                </button>
              </div>
              <CardDescription className={glassStyles.description}>
                {subtitle}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody className={glassStyles.body}>{children}</CardBody>
      </Card>
    </div>
  );
};

export default SortableSection;
