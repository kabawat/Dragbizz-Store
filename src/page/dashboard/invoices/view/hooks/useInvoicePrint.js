import { useState, useEffect } from 'react';
import { useGlobalToast } from '@/contexts/ToastContext';

export const useInvoicePrint = (fetching, invoiceData) => {
    const { showError } = useGlobalToast();
    const [showPrintMenu, setShowPrintMenu] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showPrintMenu && !event.target.closest('.print-menu-container')) {
                setShowPrintMenu(false);
            }
        };

        if (showPrintMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showPrintMenu]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const shouldPrint = urlParams.get('print') === 'true';

        if (shouldPrint && !fetching && invoiceData) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [fetching, invoiceData]);

    const handlePrint = (mode = 'standard') => {
        try {
            const old = document.getElementById("app-print-stylesheet");
            if (old) old.remove();

            document.body.classList.remove("print-mode-mini", "print-mode-standard");

            const cls = mode === "mini" ? "print-mode-mini" : "print-mode-standard";
            document.body.classList.add(cls);

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.id = "app-print-stylesheet";
            link.href = mode === "mini" ? "/print-mini.css" : "/print-a4.css";
            document.head.appendChild(link);

            const cleanup = () => {
                setTimeout(() => {
                    const l = document.getElementById("app-print-stylesheet");
                    if (l) l.remove();
                    document.body.classList.remove("print-mode-mini", "print-mode-standard");
                    window.onafterprint = null;
                }, 200);
            };

            window.onafterprint = cleanup;
            window.print();
            setTimeout(cleanup, 8000);
            setShowPrintMenu(false);
        } catch (e) {
            showError("Printing failed.");
        }
    };

    const handleDownloadPDF = async (invoiceData, invoiceId) => {
        const invoice = document.getElementById("invoice-area");
        if (!invoice) {
            showError("Invoice not found!");
            return;
        }

        try {
            const { default: html2canvas } = await import('html2canvas');
            const { default: jsPDF } = await import('jspdf');

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
            pdf.save(`invoice-${invoiceData?.invoiceNumber || invoiceId}.pdf`);
        } catch (error) {
            showError('Failed to download PDF. Please try again.');
        }
    };

    return { showPrintMenu, setShowPrintMenu, handlePrint, handleDownloadPDF };
};

