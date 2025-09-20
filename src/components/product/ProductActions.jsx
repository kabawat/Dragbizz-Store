"use client"
import React from 'react';
import { Button, Dropdown } from '../ui';
import { Download, Upload, Edit, Trash2, Copy, Eye } from 'lucide-react';

const ProductActions = ({
  selectedProducts = [],
  onExport,
  onImport,
  onBulkEdit,
  onBulkDelete,
  onBulkDuplicate,
  onBulkView,
  className = '',
  ...props
}) => {
  const bulkActions = [
    {
      value: 'view',
      label: 'View Selected',
      icon: Eye,
      onClick: () => onBulkView?.(selectedProducts)
    },
    {
      value: 'edit',
      label: 'Edit Selected',
      icon: Edit,
      onClick: () => onBulkEdit?.(selectedProducts)
    },
    {
      value: 'duplicate',
      label: 'Duplicate Selected',
      icon: Copy,
      onClick: () => onBulkDuplicate?.(selectedProducts)
    },
    {
      value: 'export',
      label: 'Export Selected',
      icon: Download,
      onClick: () => onExport?.(selectedProducts)
    },
    {
      value: 'delete',
      label: 'Delete Selected',
      icon: Trash2,
      onClick: () => onBulkDelete?.(selectedProducts)
    }
  ];
  
  if (selectedProducts.length === 0) {
    return (
      <div className={`flex gap-2 ${className}`} {...props}>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          leftIcon={Download}
        >
          Export All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onImport}
          leftIcon={Upload}
        >
          Import
        </Button>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <span className="text-sm text-[rgb(var(--color-text-secondary))] mr-2">
        {selectedProducts.length} selected
      </span>
      
      <Dropdown
        options={bulkActions}
        value=""
        onChange={(action) => {
          const item = bulkActions.find(item => item.value === action);
          item?.onClick();
        }}
        trigger={
          <Button variant="outline" size="sm">
            Bulk Actions
          </Button>
        }
      />
      
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        leftIcon={Download}
      >
        Export
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onImport}
        leftIcon={Upload}
      >
        Import
      </Button>
    </div>
  );
};

export default ProductActions;
