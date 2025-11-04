"use client";
import React, { useState } from 'react';
import { Button } from '../ui';
import { Printer, Download } from 'lucide-react';
import { TEMPLATE_OPTIONS } from './templates';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const handleDownloadPDF = async () => {
  const invoice = document.getElementById("invoice-area");
  if (!invoice) return alert("Invoice not found!");

  // Step 1: Render to high-quality canvas
  const canvas = await html2canvas(invoice, {                                                                                                                                                 
    scale: 3, // higher = sharper       
    useCORS: true,
    allowTaint: true,
  });

  // Step 2: Convert to compressed JPEG
  const imgData = canvas.toDataURL("image/jpeg", 0.7); 

  // Step 3: Generate PDF
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

  // Step 4: Save PDF
  pdf.save("invoice.pdf");
};


const TemplateSelector = ({ selectedTemplate, onTemplateChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTemplateChange = (template) => {
    onTemplateChange(template);
    setIsOpen(false);
  };

  const handlePrint = () => window.print();

  const selectedTemplateInfo = TEMPLATE_OPTIONS.find(t => t.value === selectedTemplate);

  return (
    <div className={`bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" onClick={handleDownloadPDF} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Download PDF
        </Button>
        <Button variant="primary" onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="w-4 h-4" /> Print Invoice
        </Button>
      </div>

      {selectedTemplateInfo && (
        <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full"></div>
            <span className="text-sm font-medium">{selectedTemplateInfo.label}</span>
          </div>
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
            {selectedTemplateInfo.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {TEMPLATE_OPTIONS.map((template) => (
          <button
            key={template.value}
            onClick={() => handleTemplateChange(template.value)}
            className={`relative p-1 rounded-lg border overflow-hidden transition-all ${
              selectedTemplate === template.value
                ? 'border-[rgb(var(--color-primary))] ring-2 ring-[rgb(var(--color-primary))]/40'
                : 'border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))]/50'
            }`}
          >
            <img
              src={template.preview}
              alt={template.label}
              className="w-full h-40 object-cover rounded-md"
            />
            <div className="text-center mt-1 text-xs font-medium text-[rgb(var(--color-text-primary))]">
              {template.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
