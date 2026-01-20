"use client";
import React from 'react';
import { Package, Hash, IndianRupee } from 'lucide-react';

const BillBatches = ({ batches, formatCurrency }) => {
  if (!batches || batches.length === 0) return null;

  return (
    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-full flex items-center justify-center">
          <Package className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Product Batches</h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Stock batches for this bill</p>
        </div>
      </div>

      <div className="space-y-4">
        {batches.map((batch, index) => (
          <div key={batch._id || index} className="border border-[rgb(var(--color-border-primary))]/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Batch Number</label>
                <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                  <Hash className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    {batch.batchNo || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Quantity</label>
                <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                  <Package className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    {batch.quantity || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Purchase Price</label>
                <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                  <IndianRupee className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    {formatCurrency(batch.purchasePrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillBatches;

