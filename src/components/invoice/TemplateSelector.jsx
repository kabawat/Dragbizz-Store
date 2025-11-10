"use client";
import React, { useState } from "react";
import { Button } from "../ui";
import {
  Printer,
  Download,
  ChevronDown,
  BookOpen,
  Receipt,
} from "lucide-react";
import { TEMPLATE_OPTIONS } from "./templates";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ✅ PDF Download Function
const handleDownloadPDF = async () => {
  const invoice = document.getElementById("invoice-area");
  if (!invoice) return alert("Invoice not found!");

  const canvas = await html2canvas(invoice, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.7);
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("invoice.pdf");
};

// ✅ Print Handler (Mini + Standard)
const handlePrint = (mode) => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = mode === "mini" ? "/print-mini.css" : "/print-a4.css";
  document.head.appendChild(link);

  window.print();

  setTimeout(() => link.remove(), 500);
};

const TemplateSelector = ({
  selectedTemplate,
  onTemplateChange,
  className = "",
  onPrint,
}) => {
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);

  const selectedTemplateInfo = TEMPLATE_OPTIONS.find(
    (t) => t.value === selectedTemplate
  );

  return (
    <div
      className={`bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-4 ${className}`}
    >
      {/* ✅ CSS FOR PRINT MENU */}
      <style jsx>{`
        .print-menu {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 8px;
          width: 220px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          padding: 6px 0;
          animation: fadeSlide 0.25s ease-out;
          z-index: 1000;
        }

        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .print-menu button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          font-size: 13px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #333;
          transition: 0.15s ease;
        }

        .print-menu button:hover {
          background: rgba(0, 0, 0, 0.06);
          transform: translateX(3px);
        }
      `}</style>

      {/* ✅ PDF + PRINT BUTTONS */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          onClick={handleDownloadPDF}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download PDF
        </Button>

        <div className="relative">
          <Button
            variant="primary"
            onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Options
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isPrintMenuOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </Button>

          {/* ✅ DROPDOWN MENU */}
          {isPrintMenuOpen && (
            <div className="print-menu">
              <button
                onClick={() => {
                  onPrint?.("standard");
                  setIsPrintMenuOpen(false);
                }}
              >
                <BookOpen className="w-4 h-4" />
                Standard (A4 / Letter)
              </button>

              <button
                onClick={() => {
                  onPrint?.("mini");
                  setIsPrintMenuOpen(false);
                }}
              >
                <Receipt className="w-4 h-4" />
                Mini / Thermal Printer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ SHOW SELECTED TEMPLATE INFO */}
      {selectedTemplateInfo && (
        <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full"></div>
            <span className="text-sm font-medium">
              {selectedTemplateInfo.label}
            </span>
          </div>
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
            {selectedTemplateInfo.description}
          </p>
        </div>
      )}

      {/* ✅ TEMPLATE GRID */}
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATE_OPTIONS.map((template) => (
          <button
            key={template.value}
            onClick={() => onTemplateChange(template.value)}
            className={`relative p-1 rounded-lg border overflow-hidden transition-all ${
              selectedTemplate === template.value
                ? "border-[rgb(var(--color-primary))] ring-2 ring-[rgb(var(--color-primary))]/40"
                : "border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))]/50"
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
