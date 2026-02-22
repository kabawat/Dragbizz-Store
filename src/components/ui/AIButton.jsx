"use client";
import { Sparkles } from "lucide-react";

const AIButton = ({
  children,
  onClick,
  disabled = false,
  size = "sm",
  className = "",
  ...props
}) => {
  const sizeClasses = {
    xs: "px-2 py-1.5 text-xs gap-1.5",
    sm: "px-4 py-2 text-sm gap-2",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      aria-label={typeof children === "string" ? children : "AI action button"}
      className={`relative inline-flex items-center justify-center ${sizeClasses[size]} font-medium text-white rounded-lg transition-all duration-300 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[rgb(var(--color-primary))] via-[rgb(var(--color-primary))] to-[rgb(var(--color-primary))]/90 ${className}`}
      {...props}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

      {/* Sparkles icon with animation */}
      <Sparkles className={`${iconSizes[size]} relative z-10 animate-pulse`} />

      {/* Button text */}
      <span className="relative z-10 font-semibold">{children}</span>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[rgb(var(--color-primary))] via-[rgb(var(--color-primary))] to-[rgb(var(--color-primary))]/90"></div>
    </button>
  );
};

export default AIButton;
