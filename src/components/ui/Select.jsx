import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error = false,
  errorMessage,
  helperText,
  disabled = false,
  required = false,
  searchable = false,
  multiple = false,
  clearable = false,
  className = '',
  name,
  id,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef(null);
  const searchRef = useRef(null);
  
  // Filter options based on search term
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;
  
  // Get selected option(s)
  const selectedOption = multiple 
    ? options.filter(option => value?.includes(option.value))
    : options.find(option => option.value === value);
  
  // Handle option selection
  const handleSelect = (option) => {
    if (multiple) {
      const newValue = value || [];
      const isSelected = newValue.includes(option.value);
      const updatedValue = isSelected
        ? newValue.filter(v => v !== option.value)
        : [...newValue, option.value];
      onChange?.(updatedValue);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
      setSearchTerm('');
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        if (searchable) {
          setTimeout(() => searchRef.current?.focus(), 0);
        }
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };
  
  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : '');
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Reset highlighted index when options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);
  
  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Select Container */}
      <div
        ref={selectRef}
        className={`relative cursor-pointer border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : isOpen
            ? 'border-blue-500 focus:ring-blue-500'
            : 'border-gray-300 focus:ring-blue-500'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Selected Value Display */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex-1 min-w-0">
            {multiple ? (
              <div className="flex flex-wrap gap-1">
                {selectedOption?.length > 0 ? (
                  selectedOption.map(option => (
                    <span
                      key={option.value}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {option.label}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">{placeholder}</span>
                )}
              </div>
            ) : (
              <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                {selectedOption?.label || placeholder}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-2">
            {/* Clear Button */}
            {clearable && (multiple ? value?.length > 0 : value) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                tabIndex={-1}
              >
                ×
              </button>
            )}
            
            {/* Dropdown Arrow */}
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </div>
        
        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
            
            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const isSelected = multiple 
                    ? value?.includes(option.value)
                    : value === option.value;
                  const isHighlighted = index === highlightedIndex;
                  
                  return (
                    <div
                      key={option.value}
                      className={`px-4 py-2 cursor-pointer transition-colors duration-150 flex items-center justify-between ${
                        isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50'
                      } ${isSelected ? 'bg-blue-50' : ''}`}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <span className={isSelected ? 'font-medium text-blue-900' : 'text-gray-900'}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
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
            <p className="text-sm text-red-600 animate-fade-in">{errorMessage}</p>
          )}
          {!error && helperText && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
