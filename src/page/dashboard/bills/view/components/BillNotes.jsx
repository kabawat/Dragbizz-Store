"use client";
import React from 'react';
import { FileText } from 'lucide-react';

const BillNotes = ({ notes }) => {
  if (!notes) return null;

  return (
    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-500/20 to-gray-500/10 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6 text-gray-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Notes</h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Additional information</p>
        </div>
      </div>

      <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
        <p className="text-[rgb(var(--color-text-primary))] leading-relaxed">
          {notes}
        </p>
      </div>
    </div>
  );
};

export default BillNotes;

