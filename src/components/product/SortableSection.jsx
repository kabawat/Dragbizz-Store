"use client";
import { SortableSectionPresentation } from "@dragorbit/features/products";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
    <SortableSectionPresentation
      model={{
        setNodeRef,
        style,
        glassStyles,
        setIsHovered,
        attributes,
        listeners,
        isHovered,
        Icon,
        title,
        onInfoClick,
        id,
        t,
        subtitle,
        children,
      }}
    />
  );
};

export default SortableSection;
