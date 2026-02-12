"use client";
import styles from "./style.module.scss";

const InvoiceContainer = ({ children, className = "" }) => {
  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0 !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide default browser headers/footers just in case */
          header, footer {
            display: none !important; 
          }
        }
      `}</style>
      <div id="invoice-container" className={`${styles.invoicePage} ${className}`}>
        {children}
      </div>
    </>
  );
};

export default InvoiceContainer;
