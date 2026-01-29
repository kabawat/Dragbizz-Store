"use client";
import React from "react";
import { Copy, ExternalLink, ShoppingBag, Download, Printer } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { copyToClipboard } from "@/utils/clipboard";
import { useGlobalToast } from "@/contexts/ToastContext";

const CatalogQRModal = ({ isOpen, onClose, store, catalogId: propCatalogId }) => {
    const { t } = useTranslation();
    const { showSuccess, showError } = useGlobalToast();

    // Prefer catalogId from store object, fallback to prop
    const catalogId = store?.catalogId || propCatalogId;

    if (!catalogId) return null;

    const catalogUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/c/${catalogId}`;
    const displayUrl = `${typeof window !== "undefined" ? window.location.host : ""}/c/${catalogId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(catalogUrl)}`;

    const handleCopy = async () => {
        const success = await copyToClipboard(catalogUrl);
        if (success) {
            showSuccess(t("settings.linkCopied"));
        }
    };

    const handleView = () => {
        window.open(catalogUrl, '_blank');
    };

    const getBase64FromUrl = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleDownloadPDF = async () => {
        try {
            const { jsPDF } = await import("jspdf");
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Header - Dark background
            doc.setFillColor(31, 41, 55);
            doc.rect(0, 0, 210, 45, 'F');

            // Branded Text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text('DRAGBIZZ', 105, 25, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('YOUR DIGITAL BUSINESS PARTNER', 105, 33, { align: 'center' });

            // Store Information Section
            let y = 65;
            doc.setTextColor(31, 41, 55);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text(store?.name || 'Exclusive Product Catalog', 105, y, { align: 'center' });

            y += 12;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(75, 85, 99);

            const address = store?.address;
            if (address) {
                const addrStr = [address.line1, address.city, address.state, address.pincode].filter(Boolean).join(', ');
                if (addrStr) {
                    doc.text(addrStr, 105, y, { align: 'center' });
                    y += 8;
                }
            }

            const contactInfo = [
                store?.phone && `Phone: ${store.phone}`,
                store?.email && `Email: ${store.email}`
            ].filter(Boolean).join('  |  ');

            if (contactInfo) {
                doc.text(contactInfo, 105, y, { align: 'center' });
                y += 12;
            }

            // Separator Line
            doc.setDrawColor(229, 231, 235);
            doc.setLineWidth(0.5);
            doc.line(50, y, 160, y);

            // Marketing Section
            y += 15;
            doc.setTextColor(220, 38, 38); // Brand Red-ish
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('SCAN TO EXPLORE OUR COLLECTION', 105, y, { align: 'center' });

            y += 8;
            doc.setTextColor(107, 114, 128);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text('Discover our latest products, check real-time stock,', 105, y, { align: 'center' });
            y += 6;
            doc.text('and place orders instantly from the comfort of your phone.', 105, y, { align: 'center' });

            // QR Code Section
            y += 15;
            const imgData = await getBase64FromUrl(qrCodeUrl);
            doc.addImage(imgData, 'PNG', 55, y, 100, 100);

            // Catalog URL with blue link color
            y += 112;
            doc.setTextColor(37, 99, 235);
            doc.setFontSize(11);
            doc.text(displayUrl, 105, y, { align: 'center' });

            // Footer
            doc.setTextColor(156, 163, 175);
            doc.setFontSize(9);
            doc.text('Thank you for choosing DragBizz - Empowering Small Businesses', 105, 275, { align: 'center' });
            doc.text('www.dragbizz.com', 105, 282, { align: 'center' });

            doc.save(`${store?.name?.replace(/\s+/g, '-').toLowerCase() || 'catalog'}-qr.pdf`);
            showSuccess("PDF generated successfully");
        } catch (error) {
            console.error("PDF generation failed:", error);
            showError("Failed to generate PDF. Please try again.");
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print QR Code - ${store?.name || 'Catalog'}</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; text-align: center; }
                        img { width: 350px; height: 350px; border: 1px solid #eee; padding: 10px; border-radius: 10px; }
                        h1 { color: #1f2937; margin-bottom: 5px; font-size: 28px; }
                        h2 { color: #4b5563; margin-top: 5px; margin-bottom: 20px; font-size: 20px; font-weight: normal; }
                        p { color: #666; font-family: monospace; font-size: 16px; margin-top: 20px; }
                        .marketing { color: #dc2626; font-weight: bold; margin-bottom: 30px; font-size: 18px; }
                    </style>
                </head>
                <body>
                    <h1>${store?.name || 'Our Product Catalog'}</h1>
                    <div class="marketing">Scan to browse & order products online!</div>
                    <img src="${qrCodeUrl}" alt="QR Code" />
                    <p>${displayUrl}</p>
                    <script>
                        window.onload = () => {
                            window.print();
                            window.onafterprint = () => window.close();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t("settings.publicCatalog")}
            size="3xl"
        >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10 py-4">
                {/* Left Side: QR Code Section */}
                <div className="bg-[rgb(var(--color-bg-secondary))] p-8 rounded-[1.5rem] border border-[rgb(var(--color-border-primary)/0.2)] flex-shrink-0">
                    <div className="bg-white p-2 rounded-2xl border border-[rgb(var(--color-border-primary))]/50">
                        <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="w-50 h-50 block"
                        />
                    </div>
                </div>

                {/* Right Side: Store Branding & Information Section */}
                <div className="flex-1 min-w-0 gap-6 py-2">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] tracking-tight">
                            {store?.name || t("settings.publicCatalog")}
                        </h2>
                        {store?.address && (
                            <p className="text-base text-[rgb(var(--color-text-secondary))]">
                                {[store.address.line1, store.address.city, store.address.state, store.address.pincode].filter(Boolean).join(", ")}
                            </p>
                        )}
                    </div>

                    {/* Marketing & Link Section */}
                    <div className="w-full space-y-5">
                        <div className="text-center md:text-left space-y-2">
                            <p className="text-base text-[rgb(var(--color-text-primary))]">
                                Scan to browse & order products online
                            </p>
                        </div>

                        {/* Shareable Link Box */}
                        <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-xl border border-[rgb(var(--color-border-primary)/0.4)] flex items-center justify-between gap-4">
                            <div className="flex flex-col truncate">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-[rgb(var(--color-text-tertiary))] mb-1">
                                    Catalog URL
                                </span>
                                <code className="text-[13px] text-[rgb(var(--color-primary))] font-mono font-bold truncate">
                                    {displayUrl}
                                </code>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="flex-shrink-0 p-2.5 bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:text-white rounded-lg transition-colors active:scale-95"
                                title={t("common.copyLink")}
                            >
                                <Copy className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="h-10 text-xs font-bold text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))]"
                                onClick={handleDownloadPDF}
                                leftIcon={Download}
                            >
                                Download PDF
                            </Button>
                            <Button
                                variant="outline"
                                className="h-10 text-xs font-bold text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))]"
                                onClick={handlePrint}
                                leftIcon={Printer}
                            >
                                Print QR
                            </Button>
                        </div>

                        <Button
                            variant="primary"
                            className="w-full h-11 text-sm font-bold uppercase tracking-wider bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-white"
                            onClick={handleView}
                            leftIcon={ExternalLink}
                        >
                            Visit Public Catalog
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CatalogQRModal;
