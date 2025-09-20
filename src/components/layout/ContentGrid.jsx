"use client"
import React from 'react';
import { Card } from '../ui';
import { ViewToggle, Pagination, Select } from '../ui';
import { ArrowUpDown } from 'lucide-react';

const ContentGrid = ({
  children,
  viewMode = 'grid',
  onViewModeChange,
  sortOptions = [],
  currentSort,
  onSortChange,
  paginationOptions = [10, 20, 50, 100],
  currentPageSize,
  onPageSizeChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  selectedItems = 0,
  className = '',
  ...props
}) => {
  const startItem = (currentPage - 1) * currentPageSize + 1;
  const endItem = Math.min(currentPage * currentPageSize, totalItems);
  
  return (
    <div className={`space-y-6 ${className}`} {...props}>
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left Side - View Toggle and Sort */}
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          {onViewModeChange && (
            <ViewToggle
              value={viewMode}
              onChange={onViewModeChange}
            />
          )}
          
          {/* Sort Dropdown */}
          {sortOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
              <Select
                options={sortOptions}
                value={currentSort}
                onChange={onSortChange}
                placeholder="Sort by"
                className="min-w-[150px]"
              />
            </div>
          )}
        </div>
        
        {/* Right Side - Page Size and Info */}
        <div className="flex items-center gap-4">
          {/* Items per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[rgb(var(--color-text-secondary))]">Show:</span>
            <Select
              options={paginationOptions.map(size => ({ value: size, label: `${size} per page` }))}
              value={currentPageSize}
              onChange={onPageSizeChange}
              className="min-w-[120px]"
            />
          </div>
          
          {/* Results info */}
          <div className="text-sm text-[rgb(var(--color-text-secondary))]">
            {selectedItems > 0 ? (
              <span>
                {selectedItems} of {totalItems} selected
              </span>
            ) : (
              <span>
                Showing {startItem}-{endItem} of {totalItems} products
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
        }
      `}>
        {children}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            maxVisiblePages={5}
          />
        </div>
      )}
    </div>
  );
};

export default ContentGrid;
