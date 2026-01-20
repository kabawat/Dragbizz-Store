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

    const handleDownloadXLSX = async (analyticsData, selectedStore, reportName, dataConfig) => {
        try {
            if (!analyticsData) {
                showError("No analytics data available!");
                return;
            }

            // Use exceljs for professional styling support
            const ExcelJS = (await import('exceljs')).default;
            
            const formatCurrency = (amount) => {
                if (amount === null || amount === undefined) return '₹0.00';
                return `₹${Number(amount).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`;
            };

            const formatNumber = (num) => (num || 0).toLocaleString('en-IN');
            const formatPercent = (num) => `${(num || 0).toFixed(2)}%`;

            // Create workbook
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(reportName);

            // Define styles using website color scheme
            const titleStyle = {
                font: { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: {
                    top: { style: 'thin', color: { argb: 'FF3B82F6' } },
                    bottom: { style: 'thin', color: { argb: 'FF3B82F6' } },
                    left: { style: 'thin', color: { argb: 'FF3B82F6' } },
                    right: { style: 'thin', color: { argb: 'FF3B82F6' } }
                }
            };

            const sectionHeaderStyle = {
                font: { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } },
                alignment: { horizontal: 'left', vertical: 'middle' },
                border: {
                    top: { style: 'thin', color: { argb: 'FF3B82F6' } },
                    bottom: { style: 'thin', color: { argb: 'FF3B82F6' } },
                    left: { style: 'thin', color: { argb: 'FF3B82F6' } },
                    right: { style: 'thin', color: { argb: 'FF3B82F6' } }
                }
            };

            const tableHeaderStyle = {
                font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B7280' } },
                alignment: { horizontal: 'left', vertical: 'middle' },
                border: {
                    top: { style: 'thin', color: { argb: 'FF6B7280' } },
                    bottom: { style: 'thin', color: { argb: 'FF6B7280' } },
                    left: { style: 'thin', color: { argb: 'FF6B7280' } },
                    right: { style: 'thin', color: { argb: 'FF6B7280' } }
                }
            };

            const dataCellStyle = {
                font: { name: 'Arial', size: 10, color: { argb: 'FF111827' } },
                alignment: { horizontal: 'left', vertical: 'middle' },
                border: {
                    top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
                }
            };

            const amountCellStyle = {
                font: { name: 'Arial', size: 10, color: { argb: 'FF111827' } },
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: {
                    top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
                }
            };

            const infoCellStyle = {
                font: { name: 'Arial', size: 10, italic: true, color: { argb: 'FF4B5563' } },
                alignment: { horizontal: 'left', vertical: 'middle' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCFCFD' } }
            };

            let currentRow = 1;

            // Title row
            const titleRow = worksheet.getRow(currentRow);
            titleRow.getCell(1).value = dataConfig.title || `${reportName.toUpperCase()} REPORT`;
            titleRow.getCell(1).style = titleStyle;
            worksheet.mergeCells(currentRow, 1, currentRow, dataConfig.columns || 3);
            titleRow.height = 25;
            currentRow += 2;

            // Store info
            worksheet.getRow(currentRow).getCell(1).value = 'Store Name';
            worksheet.getRow(currentRow).getCell(2).value = selectedStore?.storeName || selectedStore?.name || 'N/A';
            worksheet.getRow(currentRow).getCell(1).style = infoCellStyle;
            worksheet.getRow(currentRow).getCell(2).style = infoCellStyle;
            currentRow++;

            worksheet.getRow(currentRow).getCell(1).value = 'Generated On';
            worksheet.getRow(currentRow).getCell(2).value = new Date().toLocaleString('en-IN');
            worksheet.getRow(currentRow).getCell(1).style = infoCellStyle;
            worksheet.getRow(currentRow).getCell(2).style = infoCellStyle;
            currentRow++;

            if (analyticsData?.lastSyncedAt) {
                worksheet.getRow(currentRow).getCell(1).value = 'Last Synced';
                worksheet.getRow(currentRow).getCell(2).value = new Date(analyticsData.lastSyncedAt).toLocaleString('en-IN');
                worksheet.getRow(currentRow).getCell(1).style = infoCellStyle;
                worksheet.getRow(currentRow).getCell(2).style = infoCellStyle;
                currentRow++;
            }

            currentRow += 1;

            // Process sections from dataConfig
            if (dataConfig.sections && dataConfig.sections.length > 0) {
                dataConfig.sections.forEach((section) => {
                    // Section header
                    const sectionHeaderRow = worksheet.getRow(currentRow);
                    sectionHeaderRow.getCell(1).value = section.title || 'SECTION';
                    sectionHeaderRow.getCell(1).style = sectionHeaderStyle;
                    worksheet.mergeCells(currentRow, 1, currentRow, section.columns || 3);
                    sectionHeaderRow.height = 20;
                    currentRow++;

                    // Table headers
                    if (section.headers && section.headers.length > 0) {
                        const headerRow = worksheet.getRow(currentRow);
                        section.headers.forEach((header, index) => {
                            headerRow.getCell(index + 1).value = header;
                            headerRow.getCell(index + 1).style = tableHeaderStyle;
                        });
                        headerRow.height = 18;
                        currentRow++;
                    }

                    // Table data
                    if (section.data && section.data.length > 0) {
                        section.data.forEach((rowData, index) => {
                            const row = worksheet.getRow(currentRow);
                            const altFill = index % 2 === 0 ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCFCFD' } } : {};
                            
                            if (Array.isArray(rowData)) {
                                rowData.forEach((cellValue, colIndex) => {
                                    const isAmount = section.amountColumns && section.amountColumns.includes(colIndex);
                                    const cell = row.getCell(colIndex + 1);
                                    cell.value = cellValue;
                                    cell.style = isAmount ? { ...amountCellStyle, fill: altFill } : { ...dataCellStyle, fill: altFill };
                                });
                            } else if (typeof rowData === 'object') {
                                // Handle object format {label: '...', amount: '...'}
                                Object.values(rowData).forEach((cellValue, colIndex) => {
                                    const isAmount = section.amountColumns && section.amountColumns.includes(colIndex);
                                    const cell = row.getCell(colIndex + 1);
                                    cell.value = cellValue;
                                    cell.style = isAmount ? { ...amountCellStyle, fill: altFill } : { ...dataCellStyle, fill: altFill };
                                });
                            }
                            
                            row.height = 18;
                            currentRow++;
                        });
                    }

                    currentRow += 1;
                });
            }

            // Set column widths
            const numColumns = dataConfig.columns || 3;
            for (let i = 1; i <= numColumns; i++) {
                worksheet.getColumn(i).width = i === 1 ? 28 : i === 2 ? 22 : 18;
            }
            
            worksheet.properties.defaultRowHeight = 18;

            // Generate filename
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `${reportName}-${timestamp}.xlsx`;

            // Write file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('XLSX export error:', error);
            showError('Failed to download XLSX. Please try again.');
        }
    };

    return { showPrintMenu, setShowPrintMenu, handlePrint, handleDownloadPDF, handleDownloadXLSX };
};

