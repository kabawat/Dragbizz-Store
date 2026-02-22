"use client";
import { Badge } from "@/components/ui";

const SectionHeader = ({ badge, title, description, className = "" }) => {
  return (
    <div className={`text-center mb-10 sm:mb-12 md:mb-16 px-4 ${className}`}>
      {badge && (
        <Badge
          variant="secondary"
          className="mb-3 sm:mb-4 text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1.5 sm:py-2"
        >
          {badge}
        </Badge>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[rgb(var(--color-text-secondary))] max-w-3xl mx-auto leading-relaxed px-2">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
