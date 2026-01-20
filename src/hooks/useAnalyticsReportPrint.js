import { useState, useEffect } from 'react';
import { useGlobalToast } from '@/contexts/ToastContext';

export const useAnalyticsReportPrint = (fetching, analyticsData, reportId, reportName) => {
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

        if (shouldPrint && !fetching && analyticsData) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [fetching, analyticsData]);

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

    const handleDownloadPDF = async (analyticsData) => {
        const report = document.getElementById(reportId);
        if (!report) {
            showError("Report not found!");
            return;
        }

        // Save current theme variant (outside try block for error handling)
        const root = document.documentElement;
        const originalVariant = root.getAttribute('data-variant') || 'light';
        const originalTheme = root.getAttribute('data-theme') || 'default';

        try {

            // Temporarily force light mode for PDF generation
            root.setAttribute('data-variant', 'light');
            root.setAttribute('data-theme', 'default');

            // Add temporary style to ensure white background
            const tempStyle = document.createElement('style');
            tempStyle.id = 'pdf-generation-style';
            tempStyle.textContent = `
                #${reportId} {
                    background: #ffffff !important;
                    color: #333333 !important;
                }
                #${reportId} * {
                    background-color: transparent !important;
                }
            `;
            document.head.appendChild(tempStyle);

            // Wait for styles to apply
            await new Promise(resolve => setTimeout(resolve, 100));

            const { default: html2canvas } = await import('html2canvas');
            const { default: jsPDF } = await import('jspdf');

            const canvas = await html2canvas(report, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
            });

            // Remove temporary style
            const tempStyleEl = document.getElementById('pdf-generation-style');
            if (tempStyleEl) {
                tempStyleEl.remove();
            }

            // Restore original theme variant
            root.setAttribute('data-variant', originalVariant);
            root.setAttribute('data-theme', originalTheme);

            const imgData = canvas.toDataURL("image/jpeg", 0.7);
            const pdf = new jsPDF("p", "mm", "a4");

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${reportName}-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            // Restore original theme variant in case of error
            const tempStyleEl = document.getElementById('pdf-generation-style');
            if (tempStyleEl) {
                tempStyleEl.remove();
            }
            root.setAttribute('data-variant', originalVariant);
            root.setAttribute('data-theme', originalTheme);
            
            showError('Failed to download PDF. Please try again.');
        }
    };

    return { showPrintMenu, setShowPrintMenu, handlePrint, handleDownloadPDF };
};

