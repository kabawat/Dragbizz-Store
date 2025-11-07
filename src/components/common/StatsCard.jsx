"use client"
import React from 'react';

const StatsCard = ({ value, label, icon: Icon, color = 'text-[rgb(var(--color-primary))]', delay = 0 }) => {
  return (
    <div
      className="bg-[rgb(var(--color-bg-primary))]/60 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-[rgb(var(--color-border-primary))] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}s` }}
    >
      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-2 sm:mb-3 ${color}`} />
      <div className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 ${color}`}>{value}</div>
      <div className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">{label}</div>
    </div>
  );
};

export default StatsCard;

