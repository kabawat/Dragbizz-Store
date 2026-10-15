"use client";
import { PaperDocument } from "@dragorbit/ui";
import styles from "./style.module.scss";

// Mini Invoice for Thermal Printers (80mm, 58mm)
const MiniInvoiceContainer = ({
  children,
  className = "",
  style = {},
  pageWidth = "80mm", // Default to 80mm
}) => {
  // Determine if it's 58mm or 80mm for page size rules
  // Standard thermal receipt is usually 80mm wide.
  const sizeRule = pageWidth === "58mm" ? "58mm auto" : "80mm auto";

  return (
    <>
      <style jsx global>{`
        /* Specific print rules for this mini template instance */
        @media print {
          @page {
            size: ${sizeRule};
            margin: 0 !important;
          }
          
          body {
            width: ${pageWidth} !important;
            min-width: ${pageWidth} !important;
          }

          /* Remove browser default margins */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* The main container wrapper */}
      <PaperDocument
        id="mini-invoice-container"
        className={`${styles.miniInvoicePage} ${className}`}
        style={{
          ...style,
          width: pageWidth,
          maxWidth: pageWidth, // Force max width in preview too
        }}
      >
        <div className={styles.miniContent}>{children}</div>
      </PaperDocument>
    </>
  );
};

export default MiniInvoiceContainer;
