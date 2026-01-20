"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X, AlertCircle } from "lucide-react";

const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
  label,
  error = false,
  errorMessage,
  helperText,
  disabled = false,
  required = false,
  searchable = true,
  clearable = true,
  maxSelections,
  className = "",
  name,
  id,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef(null);
  const searchRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : options;

  // Get selected options
  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

  // Handle option selection
  const handleSelect = (option) => {
    const isSelected = value.includes(option.value);
    let newValue;

    if (isSelected) {
      // Remove option
      newValue = value.filter((v) => v !== option.value);
    } else {
      // Add option (check max selections)
      if (maxSelections && value.length >= maxSelections) {
        return;
      }
      newValue = [...value, option.value];
    }

    onChange?.(newValue);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
        if (searchable) {
          setTimeout(() => searchRef.current?.focus(), 0);
        }
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle clear all
  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange?.([]);
  };

  // Handle remove single option
  const handleRemoveOption = (optionValue, e) => {
    e.stopPropagation();
    const newValue = value.filter((v) => v !== optionValue);
    onChange?.(newValue);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
          <span className="flex items-center gap-2">
            <span>{label}</span>
            {required && <span className="text-red-500">*</span>}
          </span>
        </label>
      )}

      {/* Select Container */}
      <div
        ref={selectRef}
        className={`
          relative cursor-pointer border-2 border-[rgb(var(--color-border-primary))] rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent
          ${
            error
              ? "border-red-500 focus:ring-red-500"
              : isOpen
                ? "border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]"
                : "border-[rgb(var(--color-border-primary))] focus:ring-[rgb(var(--color-primary))]"
          } 
          ${disabled ? "bg-[rgb(var(--color-bg-tertiary))] cursor-not-allowed" : "bg-[rgb(var(--color-bg-primary))]"}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Selected Values Display */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex-1 min-w-0">
            {selectedOptions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[rgb(var(--color-primary))] bg-opacity-10 text-[rgb(var(--color-primary))] border border-[rgb(var(--color-primary))] border-opacity-20"
                  >
                    {option.label}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveOption(option.value, e)}
                        className="ml-1 hover:text-red-500 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
                {maxSelections && value.length >= maxSelections && (
                  <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                    ({value.length}/{maxSelections} selected)
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[rgb(var(--color-text-tertiary))]">
                {placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-2">
            {/* Clear All Button */}
            {clearable && value.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors duration-200"
                tabIndex={-1}
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown Arrow */}
            <ChevronDown
              className={`w-5 h-5 text-[rgb(var(--color-text-tertiary))] transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-xl shadow-lg max-h-60 overflow-hidden">
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-[rgb(var(--color-border-primary))]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))]"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const isSelected = value.includes(option.value);
                  const isHighlighted = index === highlightedIndex;
                  const isDisabled =
                    maxSelections &&
                    value.length >= maxSelections &&
                    !isSelected;

                  return (
                    <div
                      key={option.value}
                      className={`
                        px-4 py-2 cursor-pointer transition-colors duration-150 flex items-center justify-between
                        ${isHighlighted ? "bg-[rgb(var(--color-primary))] bg-opacity-10" : "hover:bg-[rgb(var(--color-bg-secondary))]"}
                        ${isSelected ? "bg-[rgb(var(--color-primary))] bg-opacity-10" : ""}
                        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                      onClick={() => !isDisabled && handleSelect(option)}
                      onMouseEnter={() =>
                        !isDisabled && setHighlightedIndex(index)
                      }
                    >
                      <span
                        className={`
                        ${isSelected ? "font-medium text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-primary))]"}
                        ${isDisabled ? "text-[rgb(var(--color-text-tertiary))]" : ""}
                      `}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-[rgb(var(--color-text-secondary))] text-center">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text / Error Message */}
      {(helperText || errorMessage) && (
        <div className="mt-2">
          {error && errorMessage && (
            <p className="text-sm text-red-600 animate-fade-in">
              {errorMessage}
            </p>
          )}
          {!error && helperText && (
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
