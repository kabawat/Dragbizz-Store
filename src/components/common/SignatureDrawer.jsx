"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { FileSignature, ShieldCheck, Upload as UploadIcon, Type as TypeIcon, Fingerprint, CheckCircle2, AlertCircle, Info, PenTool, RotateCcw } from "lucide-react";
import { Tabs, TabPanel, Button, FileUpload, Input, SideDrawer, Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { signatureService } from "@/service/retailer";
import { useGlobalToast } from "@/contexts/ToastContext";

// Signature Fonts for Typed Signature
import { SIGNATURE_FONTS } from "@/constants/signatureFonts";

// Reusable Signature Drawer
const SignatureDrawer = ({
    isOpen,
    onClose,
    onSuccess,
    agencyId,
}) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("type");
    const [typedName, setTypedName] = useState("");
    const [selectedStyle, setSelectedStyle] = useState({ bold: false, italic: false });
    const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [idNumber, setIdNumber] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const [drawnSignature, setDrawnSignature] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = React.useRef(null);

    React.useEffect(() => {
        setIsMounted(true);
        if (uploadedFiles.length > 0 && uploadedFiles[0] instanceof File) {
            const url = URL.createObjectURL(uploadedFiles[0]);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl("");
        }
    }, [uploadedFiles]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        setDrawnSignature(canvas.toDataURL());
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setDrawnSignature(null);
    };

    React.useEffect(() => {
        if (activeTab === "draw" && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
        }
    }, [activeTab]);

    const handleVerify = () => {
        if (!idNumber) return;
        setIsVerifying(true);
        // Mock verification
        setTimeout(() => {
            setIsVerifying(false);
            setIsVerified(true);
        }, 1500);
    };

    const handleFinalSign = () => {
        setIsSigning(true);
        // Mock signing process
        setTimeout(() => {
            setIsSigning(false);
            alert("Document signed successfully! The company DSC has been applied for legal validity.");
        }, 2000);
    };

    const tabs = [
        { id: "type", label: t("invoice.typeName") },
        { id: "draw", label: t("invoice.draw") },
        { id: "upload", label: t("invoice.uploadImage") },
        { id: "identity", label: t("invoice.digitalIdentity") },
    ];
    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={t("invoice.createSignature")}
            icon={FileSignature}
            description={t("invoice.chooseSigningMethod")}
            width="w-full"
            backdropBlur="blur-sm"
        >
            <div className="flex flex-col h-full">
                <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Interaction Area */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-6 bg-[rgb(var(--color-bg-primary))] dark:bg-[rgb(var(--color-bg-secondary))]">
                                <Tabs
                                    tabs={tabs}
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    variant="pills"
                                    className="mb-8"
                                />

                                {/* Typed Signature Tab */}
                                <TabPanel isActive={activeTab === "type"}>
                                    <div className="space-y-6">
                                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                                            <Input label={t("invoice.typeFullName")} placeholder={t("invoice.namePlaceholder")} value={typedName} onChange={(val) => setTypedName(val)} className="text-lg flex-1" />
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <button
                                                    onClick={() => setSelectedStyle(prev => ({ ...prev, bold: !prev.bold }))}
                                                    className={`w-10 rounded-lg border transition-all flex items-center justify-center ${selectedStyle.bold ? 'bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]' : 'bg-[rgb(var(--color-bg-primary))] border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))]'}`}
                                                    title="Bold"
                                                    type="button"
                                                >
                                                    <span className="font-bold text-lg">B</span>
                                                </button>
                                                <button
                                                    onClick={() => setSelectedStyle(prev => ({ ...prev, italic: !prev.italic }))}
                                                    className={`w-10 rounded-lg border transition-all flex items-center justify-center ${selectedStyle.italic ? 'bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]' : 'bg-[rgb(var(--color-bg-primary))] border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))]'}`}
                                                    title="Italic"
                                                    type="button"
                                                >
                                                    <span className="italic text-lg font-serif">I</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="h-[300px] overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 custom-scrollbar">
                                            {SIGNATURE_FONTS.map((font) => (
                                                <div
                                                    key={font.id}
                                                    onClick={() => setSelectedFont(font)}
                                                    className={`p-6 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center min-h-[100px] ${selectedFont.id === font.id
                                                        ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5 shadow-sm"
                                                        : "border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))]/50"
                                                        }`}
                                                >
                                                    <span
                                                        style={{
                                                            fontFamily: font.family,
                                                            fontWeight: selectedStyle.bold ? 'bold' : 'normal',
                                                            fontStyle: selectedStyle.italic ? 'italic' : 'normal'
                                                        }}
                                                        className="text-2xl whitespace-nowrap overflow-hidden text-ellipsis px-2 text-[rgb(var(--color-text-primary))]"
                                                    >
                                                        {typedName || font.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabPanel>

                                {/* Draw Signature Tab */}
                                <TabPanel isActive={activeTab === "draw"}>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
                                                <PenTool className="w-4 h-4" />
                                                <span>{t("invoice.drawBelow")}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearCanvas}
                                                className="text-[rgb(var(--color-danger))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10"
                                            >
                                                <RotateCcw className="w-4 h-4 mr-1" />
                                                {t("common.clear")}
                                            </Button>
                                        </div>
                                        <div className="relative border-2 border-dashed border-[rgb(var(--color-border-primary))] rounded-2xl bg-white overflow-hidden touch-none shadow-sm">
                                            <canvas
                                                ref={canvasRef}
                                                width={800}
                                                height={400}
                                                className="w-full h-auto cursor-crosshair min-h-[300px]"
                                                onMouseDown={startDrawing}
                                                onMouseMove={draw}
                                                onMouseUp={stopDrawing}
                                                onMouseLeave={stopDrawing}
                                                onTouchStart={startDrawing}
                                                onTouchMove={draw}
                                                onTouchEnd={stopDrawing}
                                            />
                                        </div>
                                        <p className="text-[10px] text-center text-[rgb(var(--color-text-tertiary))] uppercase font-bold tracking-widest">
                                            {t("invoice.signInstructions")}
                                        </p>
                                    </div>
                                </TabPanel>

                                {/* Upload Tab */}
                                <TabPanel isActive={activeTab === "upload"}>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-4 bg-[rgb(var(--color-warning))]/10 rounded-xl mb-4 border border-[rgb(var(--color-warning))]/20">
                                            <Info className="w-5 h-5 text-[rgb(var(--color-warning))] shrink-0" />
                                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                                                {t("invoice.uploadInstructions")}
                                            </p>
                                        </div>
                                        <FileUpload
                                            label={t("invoice.uploadSignature")}
                                            accept="image/*,.pdf"
                                            multiple={false}
                                            value={uploadedFiles}
                                            onChange={setUploadedFiles}
                                            dropZoneLabel={t("invoice.dragDropSignature")}
                                        />
                                    </div>
                                </TabPanel>

                                {/* Identity Tab */}
                                <TabPanel isActive={activeTab === "identity"}>
                                    <div className="space-y-6 relative">
                                        {/* Coming Soon Overlay */}
                                        <div className="absolute inset-0 bg-[rgb(var(--color-bg-primary))]/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-2xl">
                                            <span className="bg-[rgb(var(--color-primary))] text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg transform -rotate-12 border border-white/20">
                                                {t("invoice.comingSoon")}
                                            </span>
                                        </div>
                                        <div className="p-6 border-2 border-dashed border-[rgb(var(--color-border-primary))] rounded-2xl flex flex-col items-center text-center opacity-70">
                                            <Fingerprint className="w-12 h-12 text-[rgb(var(--color-primary))] mb-4" />
                                            <h3 className="font-semibold text-lg mb-2">{t("invoice.epanVerification")}</h3>
                                            <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6 max-w-sm">
                                                {t("invoice.securelyVerifyIdentity")}
                                            </p>

                                            <div className="w-full max-w-sm flex gap-2 pointer-events-none">
                                                <Input
                                                    placeholder={t("invoice.enterPan")}
                                                    disabled
                                                    className="flex-1"
                                                />
                                                <Button disabled>
                                                    {t("invoice.verifyIdentity")}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </TabPanel>
                            </Card>

                            {/* Legal Validity Strategy Disclosure */}
                            <div className="p-6 bg-[rgb(var(--color-primary))]/5 rounded-2xl border border-[rgb(var(--color-primary))]/20">
                                <div className="flex items-start gap-4">
                                    <ShieldCheck className="w-6 h-6 text-[rgb(var(--color-primary))] shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                                            {t("invoice.legalValidityStrategy")}
                                        </h4>
                                        <p
                                            className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: t("invoice.legalValidityDescription") }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar / Summary Area */}
                        <div className="space-y-6">
                            <Card className="p-6 sticky top-24 bg-[rgb(var(--color-bg-primary))] dark:bg-[rgb(var(--color-bg-secondary))]">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-[rgb(var(--color-border-primary))] pb-4">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    {t("invoice.signSummary")}
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[rgb(var(--color-text-secondary))]">{t("invoice.method")}</span>
                                        <span className="font-medium capitalize">{activeTab}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[rgb(var(--color-text-secondary))]">{t("invoice.legalStatus")}</span>
                                        <span className="text-green-600 font-medium flex items-center gap-1">
                                            <ShieldCheck className="w-4 h-4" /> {t("invoice.valid")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-[rgb(var(--color-text-tertiary))]">
                                        <span>{t("invoice.timestamp")}</span>
                                        <span>{isMounted ? new Date().toLocaleString() : "--/--/----, --:--:--"}</span>
                                    </div>
                                </div>

                                {/* Preview Box - Polished & Light */}
                                <div className="mb-8 p-6 bg-[rgb(var(--color-bg-secondary))] rounded-2xl border border-[rgb(var(--color-border-primary))] min-h-[160px] flex flex-col items-center justify-center relative shadow-inner group overflow-hidden">
                                    {/* Subtle Decorative Element - Hidden after signing */}
                                    {!((activeTab === "type" && typedName) ||
                                        (activeTab === "draw" && drawnSignature) ||
                                        (activeTab === "upload" && uploadedFiles.length > 0) ||
                                        (activeTab === "identity" && isVerified)) && (
                                            <div className="absolute top-4 right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                                <FileSignature className="w-16 h-16 text-blue-900" />
                                            </div>
                                        )}

                                    <p className="absolute top-3 left-4 text-[9px] uppercase tracking-[0.15em] text-[rgb(var(--color-text-tertiary))] font-black flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${(activeTab === "type" && typedName) ||
                                            (activeTab === "draw" && drawnSignature) ||
                                            (activeTab === "upload" && uploadedFiles.length > 0) ||
                                            (activeTab === "identity" && isVerified) ? "bg-[rgb(var(--color-success))] shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-[rgb(var(--color-warning))] animate-pulse"
                                            }`}></span>
                                        {t("invoice.signaturePreview")}
                                    </p>

                                    <div className="relative z-10 w-full flex flex-col items-center justify-center">
                                        {activeTab === "type" && typedName && (
                                            <span
                                                style={{
                                                    fontFamily: selectedFont.family,
                                                    fontWeight: selectedStyle.bold ? 'bold' : 'normal',
                                                    fontStyle: selectedStyle.italic ? 'italic' : 'normal'
                                                }}
                                                className="text-4xl text-[rgb(var(--color-text-primary))] transition-all duration-300"
                                            >
                                                {typedName}
                                            </span>
                                        )}
                                        {activeTab === "upload" && previewUrl && (
                                            <img
                                                src={previewUrl}
                                                className="max-h-20 object-contain mix-blend-multiply dark:mix-blend-normal brightness-90 contrast-125 transition-transform duration-300 hover:scale-105"
                                                alt="Uploaded Signature"
                                            />
                                        )}
                                        {activeTab === "draw" && drawnSignature && (
                                            <img
                                                src={drawnSignature}
                                                className="max-h-20 object-contain mix-blend-multiply dark:mix-blend-normal brightness-90 contrast-125 transition-transform duration-300 hover:scale-105"
                                                alt="Drawn Signature"
                                            />
                                        )}
                                        {activeTab === "identity" && isVerified && (
                                            <div className="text-center bg-[rgb(var(--color-primary))]/5 px-6 py-3 rounded-xl border border-[rgb(var(--color-primary))]/10 scale-110">
                                                <p className="font-serif text-[10px] italic text-[rgb(var(--color-primary))] mb-1 font-bold uppercase tracking-tighter">
                                                    {t("invoice.digitallyVerified")}
                                                </p>
                                                <p className="font-black text-xl tracking-widest uppercase">{idNumber}</p>
                                            </div>
                                        )}

                                        {/* Enhanced Empty States */}
                                        {(!typedName && activeTab === "type") && (
                                            <div className="flex flex-col items-center gap-2 text-[rgb(var(--color-text-tertiary))] opacity-50">
                                                <TypeIcon className="w-8 h-8 stroke-1" />
                                                <span className="text-[10px] uppercase font-bold tracking-widest">{t("invoice.typeYourName")}</span>
                                            </div>
                                        )}
                                        {(!drawnSignature && activeTab === "draw") && (
                                            <div className="flex flex-col items-center gap-2 text-[rgb(var(--color-text-tertiary))] opacity-50">
                                                <PenTool className="w-8 h-8 stroke-1" />
                                                <span className="text-[10px] uppercase font-bold tracking-widest">{t("invoice.drawOnLeft")}</span>
                                            </div>
                                        )}
                                        {(!uploadedFiles.length && activeTab === "upload") && (
                                            <div className="flex flex-col items-center gap-2 text-[rgb(var(--color-text-tertiary))] opacity-50">
                                                <UploadIcon className="w-8 h-8 stroke-1" />
                                                <span className="text-[10px] uppercase font-bold tracking-widest">{t("invoice.uploadYourFile")}</span>
                                            </div>
                                        )}
                                        {(!isVerified && activeTab === "identity") && (
                                            <div className="flex flex-col items-center gap-2 text-[rgb(var(--color-text-tertiary))] opacity-50">
                                                <Fingerprint className="w-8 h-8 stroke-1" />
                                                <span className="text-[10px] uppercase font-bold tracking-widest">{t("invoice.verifyIDFirst")}</span>
                                            </div>
                                        )}

                                        {/* Stamp Effect - Visible when signed (Real Overlay) */}
                                        {((activeTab === "type" && typedName) ||
                                            (activeTab === "draw" && drawnSignature) ||
                                            (activeTab === "upload" && uploadedFiles.length > 0) ||
                                            (activeTab === "identity" && isVerified)) && (
                                                <div className="absolute -right-2 -bottom-2 w-28 h-28 border-3 border-blue-600/60 rounded-full flex items-center justify-center -rotate-12 pointer-events-none select-none z-[100] transition-all duration-500 mix-blend-multiply dark:mix-blend-normal transform scale-[1.1] origin-bottom-right">
                                                    <div className="border-2 border-blue-600/60 rounded-full w-[94%] h-[94%] flex flex-col items-center justify-center text-center p-2 bg-blue-50/20 backdrop-blur-[0.2px]">
                                                        <span className="text-[9px] font-black text-blue-700 uppercase leading-none mb-1 tracking-widest">{t("invoice.authentic")}</span>
                                                        <span className="text-[11px] font-black text-blue-800 uppercase leading-none border-y-2 border-blue-600/60 py-1.5 mb-1 w-full">{t("invoice.verifiedBy")}</span>
                                                        <span className="text-[14px] font-black text-blue-800 uppercase leading-none tracking-tighter">DragBizz</span>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>

                                <Button
                                    className="w-full py-4 text-lg font-bold"
                                    size="lg"
                                    disabled={
                                        (activeTab === "type" && !typedName) ||
                                        (activeTab === "draw" && !drawnSignature) ||
                                        (activeTab === "upload" && uploadedFiles.length === 0) ||
                                        (activeTab === "identity" && !isVerified)
                                    }
                                    loading={isSigning}
                                    onClick={handleFinalSign}
                                >
                                    {t("invoice.confirmSign")}
                                </Button>

                                <div className="mt-4 flex items-center gap-2 justify-center text-[10px] text-[rgb(var(--color-text-tertiary))] uppercase font-bold tracking-widest">
                                    <div className="h-px bg-[rgb(var(--color-border-primary))] flex-1"></div>
                                    <span>{t("invoice.securedByDSC")}</span>
                                    <div className="h-px bg-[rgb(var(--color-border-primary))] flex-1"></div>
                                </div>
                            </Card>

                            <div className="text-center space-y-2 px-4">
                                <p className="text-xs text-[rgb(var(--color-text-tertiary))] flex items-center justify-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Documents are non-editable after signing
                                </p>
                                <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] uppercase">
                                    Audit Trail: IP {isMounted ? `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.XXX.XXX` : "XXX.XXX.XXX.XXX"} recorded
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SideDrawer>
    );
};

export default SignatureDrawer;
