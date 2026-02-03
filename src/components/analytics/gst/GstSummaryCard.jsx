"use client";
import { Card } from "@/components/ui";

// Same gradient map as SortableMetricCard (Bills/Stock analytics)
const getGradientStyle = (iconColor) => {
  const gradientMap = {
    "from-green-100 to-green-200": "var(--gradient-green)",
    "from-blue-100 to-blue-200": "var(--gradient-blue)",
    "from-purple-100 to-purple-200": "var(--gradient-purple)",
    "from-orange-100 to-orange-200": "var(--gradient-orange)",
    "from-amber-100 to-amber-200": "var(--gradient-orange)",
    "from-teal-100 to-teal-200": "var(--gradient-teal)",
    "from-red-100 to-red-200": "var(--gradient-red)",
    "from-yellow-100 to-yellow-200": "var(--gradient-yellow)",
    "from-gray-100 to-gray-200": "var(--gradient-gray)",
    "from-indigo-100 to-indigo-200": "var(--gradient-indigo)",
  };
  return gradientMap[iconColor] || "var(--gradient-gray)";
};

const GstSummaryCard = ({ title, value, subtext, icon: Icon, iconColor = "from-blue-100 to-blue-200" }) => (
  <Card
    className="backdrop-blur-md border-[var(--color-border-primary-light)] transition-all duration-300 relative overflow-hidden"
    style={{ background: getGradientStyle(iconColor) }}
  >
    {/* Background Icon - same pattern as SortableMetricCard */}
    {Icon && (
      <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-3 opacity-10">
        <Icon className="w-13 h-13 text-[rgb(var(--color-text-primary))]" />
      </div>
    )}
    <div className="relative z-10 p-4">
      <p className="text-[rgb(var(--color-text-secondary))] text-xs font-medium truncate uppercase tracking-wide">
        {title}
      </p>
      <p className="text-[rgb(var(--color-text-primary))] text-xl font-bold mt-1">
        {value}
      </p>
      {subtext && (
        <p className="text-[rgb(var(--color-text-secondary))] text-xs mt-1 truncate">
          {subtext}
        </p>
      )}
    </div>
  </Card>
);

export default GstSummaryCard;
