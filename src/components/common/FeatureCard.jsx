"use client";
import { Card } from "@/components/ui";

const FeatureCard = ({ icon: Icon, title, description, color, gradient }) => {
  return (
    <Card
      className={`group border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] overflow-hidden ${gradient}`}
    >
      <div className="p-4 sm:p-5 md:p-6">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 sm:mb-5 md:mb-6 transition-all duration-300 shadow-lg`}
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
          {title}
        </h3>
        <p className="text-xs sm:text-sm md:text-base text-[rgb(var(--color-text-secondary))] leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
};

export default FeatureCard;
