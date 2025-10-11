"use client"
import React, { useState } from 'react';
import { Select, Button } from '../ui';
import { FileText, Eye, Printer } from 'lucide-react';
import { TEMPLATE_OPTIONS } from './templates';

const TemplateSelector = ({ 
  selectedTemplate, 
  onTemplateChange, 
  onPreview, 
  onPrint,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTemplateChange = (template) => {
    onTemplateChange(template);
    setIsOpen(false);
  };

  const getTemplateInfo = (templateValue) => {
    return TEMPLATE_OPTIONS.find(option => option.value === templateValue);
  };

  const selectedTemplateInfo = getTemplateInfo(selectedTemplate);

  return (
    <div className={`bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
          <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
            Invoice Template
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onPrint}
            className="flex items-center gap-1"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-2">
            Select Template
          </label>
          <Select
            value={selectedTemplate}
            onChange={handleTemplateChange}
            options={TEMPLATE_OPTIONS.map(option => ({
              value: option.value,
              label: option.label
            }))}
            placeholder="Choose a template"
            size="sm"
          />
        </div>

        {selectedTemplateInfo && (
          <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full"></div>
              <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                {selectedTemplateInfo.label}
              </span>
            </div>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">
              {selectedTemplateInfo.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {TEMPLATE_OPTIONS.map((template) => (
            <button
              key={template.value}
              onClick={() => handleTemplateChange(template.value)}
              className={`p-2 rounded-lg border text-left transition-colors ${
                selectedTemplate === template.value
                  ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10'
                  : 'border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))]/50'
              }`}
            >
              <div className="text-xs font-medium text-[rgb(var(--color-text-primary))]">
                {template.label}
              </div>
              <div className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                {template.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
