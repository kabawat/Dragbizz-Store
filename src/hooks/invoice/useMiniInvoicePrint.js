import { useEffect, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";

export const useMiniInvoicePrint = (fetching, invoiceData, skipAutoPrint = false) => {
    const { showError } = useGlobalToast();
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        if (skipAutoPrint) return;

        const urlParams = new URLSearchParams(window.location.search);
        const shouldPrint = urlParams.get("print") === "true";

        if (shouldPrint && !fetching && invoiceData) {
            // Wait for rendering to complete
            setTimeout(() => {
                window.print();
            }, 800);
        }
    }, [fetching, invoiceData, skipAutoPrint]);

    const handlePrint = () => {
        try {
            window.print();
        } catch (_e) {
            showError("Printing failed.");
        }
    };

    const handleDownloadPDF = async (invoiceData, invoiceId) => {
        const sourceElement = document.getElementById("mini-invoice-container");
        if (!sourceElement) {
            showError("Invoice not found!");
            return;
        }

        try {
            setIsPrinting(true);
            const { default: html2canvas } = await import("html2canvas");
            const { default: jsPDF } = await import("jspdf");

            // Clone the element to ensure full height capture without scroll issues
            const clone = sourceElement.cloneNode(true);

            // Style the clone to ensure it renders fully
            Object.assign(clone.style, {
                position: 'fixed',
                top: '-9999px',
                left: '-9999px',
                width: sourceElement.offsetWidth + 'px',
                height: 'auto',
                zIndex: '-1',
                background: 'white',
                overflow: 'visible'
            });

            document.body.appendChild(clone);

            // Wait a moment for styles to apply (though usually immediate)
            await new Promise(resolve => setTimeout(resolve, 100));

            const elementWidth = clone.offsetWidth;
            const elementHeight = clone.scrollHeight;

            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: false,
                width: elementWidth,
                height: elementHeight,
                windowWidth: elementWidth,
                windowHeight: elementHeight,
            });

            // Clean up
            document.body.removeChild(clone);

            const imgData = canvas.toDataURL("image/png", 1.0);

            // Calculate PDF dimensions in mm
            // 1px = 0.264583 mm (approx 25.4 / 96)
            const mmPerPx = 25.4 / 96;
            const pdfWidthMm = elementWidth * mmPerPx;
            const pdfHeightMm = elementHeight * mmPerPx;

            // Create PDF with custom page size matching the content
            const pdf = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: [pdfWidthMm, pdfHeightMm]
            });

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidthMm, pdfHeightMm);
            pdf.save(`thermal-invoice-${invoiceData?.invoiceNumber || invoiceId}.pdf`);
        } catch (_error) {
            console.error(_error);
            showError("Failed to download PDF. Please try again.");
        } finally {
            setIsPrinting(false);
        }
    };

    return { handlePrint, handleDownloadPDF, isPrinting };
};
