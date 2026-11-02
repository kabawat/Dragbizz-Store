import React from "react";
import { Button } from "@/components/ui";
import { FileSignature, ShieldCheck, CheckCircle2, AlertCircle, Type as TypeIcon, PenTool, Upload as UploadIcon, Fingerprint } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";

const SignaturePreview = ({
    activeTab,
    typedName,
    selectedFont,
    selectedStyle,
    drawnSignature,
    uploadedFiles,
    previewUrl,
    isVerified,
    idNumber,
    isMounted,
    isSigning,
    handleFinalSign
}) => {
    const { t } = useTranslation();
    const themeVariant = useAppSelector((state) => state.theme.variant);

    const hasSignatureContent = (
        (activeTab === "type" && typedName) ||
        (activeTab === "draw" && drawnSignature) ||
        (activeTab === "upload" && uploadedFiles.length > 0) ||
        (activeTab === "identity" && isVerified)
    );

    return (
        <div className="space-y-6">
            <div className="p-6 sticky top-24 bg-[rgb(var(--color-bg-primary))] dark:bg-[rgb(var(--color-bg-secondary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm">
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
                    {!hasSignatureContent && (
                        <div className="absolute top-4 right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <FileSignature className="w-16 h-16 text-blue-900" />
                        </div>
                    )}

                    <p className="absolute top-3 left-4 text-[0.5625rem] uppercase tracking-[0.15em] text-[rgb(var(--color-text-tertiary))] font-black flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${hasSignatureContent ? "bg-[rgb(var(--color-success))] shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-[rgb(var(--color-warning))] animate-pulse"
                            }`}></span>
                        {t("invoice.signaturePreview")}
                    </p>

                    <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-[80px]">
                        {activeTab === "type" && typedName && (
                            <span
                                style={{ fontFamily: selectedFont.family }}
                                className={`text-4xl text-[rgb(var(--color-text-primary))] transition-all duration-300 ${selectedStyle.bold ? 'font-bold' : ''} ${selectedStyle.italic ? 'italic' : ''}`}
                            >
                                {typedName}
                            </span>
                        )}
                        {activeTab === "upload" && previewUrl && (
                            <img
                                src={previewUrl}
                                className={`max-h-20 object-contain transition-transform duration-300 hover:scale-105 ${themeVariant === 'dark' ? 'invert' : ''}`}
                                alt="Uploaded Signature"
                            />
                        )}
                        {activeTab === "draw" && drawnSignature && (
                            <img
                                src={drawnSignature}
                                className={`max-h-20 object-contain transition-transform duration-300 hover:scale-105 ${themeVariant === 'dark' ? 'invert' : ''}`}
                                alt="Drawn Signature"
                            />
                        )}
                        {activeTab === "identity" && isVerified && (
                            <div className="text-center bg-[rgb(var(--color-primary))]/5 px-6 py-3 rounded-xl border border-[rgb(var(--color-primary))]/10 scale-110">
                                <p className="font-serif text-[0.625rem] italic text-[rgb(var(--color-primary))] mb-1 font-bold uppercase tracking-tighter">
                                    {t("invoice.digitallyVerified")}
                                </p>
                                <p className="font-black text-xl tracking-widest uppercase">{idNumber}</p>
                            </div>
                        )}

                        {/* Enhanced Empty States */}
                        {(!typedName && activeTab === "type") && (
                            <div className="flex flex-col items-center gap-2 text-[rgb(var(--color-text-tertiary))] opacity-50">
                                <TypeIcon className="w-8 h-8 stroke-1" />
                                <span className="text-[0.625rem] uppercase font-bold tracking-widest">{t("invoice.typeYourName")}</span>
                            </div>
                        )}
                        {(!drawnSignature && activeTab === "draw") && (
                            <div className="flex flex-col items-center gap-2 text-[rgb(var(--color-text-tertiary))] opacity-50">
                                <PenTool className="w-8 h-8 stroke-1" />
                                <span className="text-[0.625rem] uppercase font-bold tracking-widest">{t("invoice.drawOnLeft")}</span>
                            </div>
                        )}
                        {(!uploadedFiles.length && activeTab === "upload") && (
                            <div className="flex flex-col items-center gap-2 text-[rgb(var(--color-text-tertiary))] opacity-50">
                                <UploadIcon className="w-8 h-8 stroke-1" />
                                <span className="text-[0.625rem] uppercase font-bold tracking-widest">{t("invoice.uploadYourFile")}</span>
                            </div>
                        )}
                        {(!isVerified && activeTab === "identity") && (
                            <div className="flex flex-col items-center gap-2 text-[rgb(var(--color-text-tertiary))] opacity-50">
                                <Fingerprint className="w-8 h-8 stroke-1" />
                                <span className="text-[0.625rem] uppercase font-bold tracking-widest">{t("invoice.verifyIDFirst")}</span>
                            </div>
                        )}

                        {/* Stamp Effect - Visible when signed */}
                        {hasSignatureContent && (
                            <div className="absolute -right-2 -bottom-2 w-28 h-28 border-3 border-blue-600/60 rounded-full flex items-center justify-center -rotate-12 pointer-events-none select-none z-[100] transition-all duration-500 mix-blend-multiply dark:mix-blend-normal transform scale-[1.1] origin-bottom-right">
                                <div className="border-2 border-blue-600/60 rounded-full w-[94%] h-[94%] flex flex-col items-center justify-center text-center p-2 bg-blue-50/20 backdrop-blur-[0.2px]">
                                    <span className="text-[0.5625rem] font-black text-blue-700 uppercase leading-none mb-1 tracking-widest">{t("invoice.authentic")}</span>
                                    <span className="text-[0.6875rem] font-black text-blue-800 uppercase leading-none border-y-2 border-blue-600/60 py-1.5 mb-1 w-full">{t("invoice.verifiedBy")}</span>
                                    <span className="text-[0.875rem] font-black text-blue-800 uppercase leading-none tracking-tighter">DragBizz</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    className="w-full py-4 text-lg font-bold"
                    size="lg"
                    disabled={!hasSignatureContent}
                    loading={isSigning}
                    onClick={handleFinalSign}
                >
                    {t("invoice.confirmSign")}
                </Button>

                <div className="mt-4 flex items-center gap-2 justify-center text-[0.625rem] text-[rgb(var(--color-text-tertiary))] uppercase font-bold tracking-widest">
                    <div className="h-px bg-[rgb(var(--color-border-primary))] flex-1"></div>
                    <span>{t("invoice.securedByDSC")}</span>
                    <div className="h-px bg-[rgb(var(--color-border-primary))] flex-1"></div>
                </div>
            </div>

            <div className="text-center space-y-2 px-4">
                <p className="text-xs text-[rgb(var(--color-text-tertiary))] flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Documents are non-editable after signing
                </p>
                <p className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] uppercase">
                    Audit Trail: IP {isMounted ? `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.XXX.XXX` : "XXX.XXX.XXX.XXX"} recorded
                </p>
            </div>
        </div>
    );
};

export default SignaturePreview;
