"use client"
import React, { useState } from 'react';
import { Card } from '../ui';
import { Input, Select, Button, Dropdown } from '../ui';
import { Search, Filter, Download, Upload, MoreHorizontal, X } from 'lucide-react';

const FilterBar = ({
  searchValue = '',
  onSearchChange,
  filters = [],
  onFilterChange,
  onClearFilters,
  onExport,
  onImport,
  bulkActions = [],
  onBulkAction,
  selectedItems = [],
  className = '',
  ...props
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const handleFilterChange = (filterKey, value) => {
    onFilterChange?.(filterKey, value);
  };
  
  const handleClearAllFilters = () => {
    onSearchChange?.('');
    onClearFilters?.();
  };
  
  const hasActiveFilters = searchValue || filters.some(filter => filter.value);
  
  return (
    <Card className={`p-6 ${className}`} {...props}>
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Search products by name, SKU, or barcode..."
            value={searchValue}
            onChange={onSearchChange}
            leftIcon={Search}
            className="w-full"
          />
        </div>
        
        {/* Filter Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          leftIcon={Filter}
          className="whitespace-nowrap"
        >
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-[rgb(var(--color-primary))] text-white text-xs rounded-full">
              {filters.filter(f => f.value).length + (searchValue ? 1 : 0)}
            </span>
          )}
        </Button>
        
        {/* Bulk Actions */}
        {selectedItems.length > 0 && bulkActions.length > 0 && (
          <Dropdown
            options={bulkActions}
            value=""
            onChange={(action) => onBulkAction?.(action)}
            trigger={
              <span className="px-4 py-2 text-sm font-medium text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg">
                Bulk Actions ({selectedItems.length})
              </span>
            }
          />
        )}
        
        {/* Export/Import */}
        <div className="flex gap-2">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              leftIcon={Download}
            >
              Export
            </Button>
          )}
          {onImport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onImport}
              leftIcon={Upload}
            >
              Import
            </Button>
          )}
        </div>
      </div>
      
      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-[rgb(var(--color-border-primary))] pt-4">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {filters.map((filter, index) => (
              <div key={index} className="flex-1">
                {filter.type === 'select' ? (
                  <Select
                    label={filter.label}
                    options={filter.options}
                    value={filter.value}
                    onChange={(value) => handleFilterChange(filter.key, value)}
                    placeholder={filter.placeholder}
                    clearable={filter.clearable}
                  />
                ) : filter.type === 'range' ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">
                      {filter.label}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filter.value?.min || ''}
                        onChange={(value) => handleFilterChange(filter.key, { ...filter.value, min: value })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filter.value?.max || ''}
                        onChange={(value) => handleFilterChange(filter.key, { ...filter.value, max: value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ) : (
                  <Input
                    label={filter.label}
                    placeholder={filter.placeholder}
                    value={filter.value || ''}
                    onChange={(value) => handleFilterChange(filter.key, value)}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Filter Actions */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              leftIcon={X}
              disabled={!hasActiveFilters}
            >
              Clear Filters
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(false)}
            >
              Hide Filters
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FilterBar;
