"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileSignature, ShieldCheck } from "lucide-react";
import { Tabs, TabPanel, SideDrawer, Card } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { signatureService } from "@/service/retailer";
import { utilityService } from "@/service";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";

// Signature Fonts for Typed Signature
import { SIGNATURE_FONTS } from "@/constants/signatureFonts";
import styles from "../settings/SignatureSettings.module.css";

// Subcomponents
import TypeTab from "./Signature/TypeTab";
import DrawTab from "./Signature/DrawTab";
import UploadTab from "./Signature/UploadTab";
import IdentityTab from "./Signature/IdentityTab";
import SignaturePreview from "./Signature/SignaturePreview";

// Reusable Signature Drawer
const SignatureDrawer = ({
    isOpen,
    onClose,
    onSuccess,
    agencyId,
}) => {
    const { t } = useTranslation();
    const { showToast } = useGlobalToast();

    // Tab State
    const [activeTab, setActiveTab] = useState("type");

    // Feature States
    const [typedName, setTypedName] = useState("");
    const [selectedStyle, setSelectedStyle] = useState({ bold: false, italic: false });
    const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0]);

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isUploadingSignature, setIsUploadingSignature] = useState(false);

    const [idNumber, setIdNumber] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    const [isSigning, setIsSigning] = useState(false);
    const { execute: executeCreate } = useApiResponse();
    const [previewUrl, setPreviewUrl] = useState("");

    const [isMounted, setIsMounted] = useState(false);
    const [drawnSignature, setDrawnSignature] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        setIsMounted(true);
        if (uploadedFiles.length > 0) {
            if (uploadedFiles[0] instanceof File) {
                const url = URL.createObjectURL(uploadedFiles[0]);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            } else if (typeof uploadedFiles[0] === 'string') {
                setPreviewUrl(uploadedFiles[0]);
            }
        } else {
            setPreviewUrl("");
        }
    }, [uploadedFiles]);

    const handleUploadFilesChange = async (files) => {
        if (!files || files.length === 0) {
            // Document removed, also delete from S3
            if (uploadedFiles.length > 0 && typeof uploadedFiles[0] === 'string') {
                utilityService.deleteFile(uploadedFiles[0]).catch(e => console.error("Failed to delete", e));
            }
            setUploadedFiles([]);
            return;
        }

        const file = files[0];
        if (typeof file === 'string') {
            setUploadedFiles(files);
            return;
        }

        try {
            setIsUploadingSignature(true);
            const uploadRes = await utilityService.uploadFile(file, "signatures");
            setUploadedFiles([uploadRes.publicFileUrl]); // Store S3 URL directly
        } catch (error) {
            showToast(t("common.uploadFailed") || "Failed to upload image", "error");
            setUploadedFiles([]);
        } finally {
            setIsUploadingSignature(false);
        }
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

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

    useEffect(() => {
        if (activeTab === "draw" && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        }
    }, [activeTab]);

    const handleFinalSign = async () => {
        setIsSigning(true);
        try {
            let finalContent = "";
            let config = {};
            let verificationDetails = undefined;

            if (activeTab === "type") {
                if (!typedName) {
                    showToast(t("invoice.pleaseTypeSignature") || "Please type a signature first.", "error");
                    return;
                }
                finalContent = typedName;
                config = {
                    fontFamily: selectedFont.family,
                    bold: selectedStyle.bold,
                    italic: selectedStyle.italic,
                    color: "#000000",
                };
            } else if (activeTab === "upload") {
                if (!uploadedFiles || uploadedFiles.length === 0) {
                    showToast(t("invoice.pleaseUploadSignature") || "Please upload a signature file.", "error");
                    return;
                }
                const fileOrUrl = uploadedFiles[0];
                if (typeof fileOrUrl === 'string') {
                    finalContent = fileOrUrl;
                } else {
                    const uploadRes = await utilityService.uploadFile(fileOrUrl, "signatures");
                    finalContent = uploadRes.publicFileUrl;
                }
            } else if (activeTab === "draw") {
                if (!drawnSignature) {
                    showToast(t("invoice.pleaseDrawSignature") || "Please draw a signature first.", "error");
                    return;
                }
                const res = await fetch(drawnSignature);
                const blob = await res.blob();
                const fileToUpload = new File([blob], `signature_draw_${Date.now()}.png`, { type: "image/png" });

                const uploadRes = await utilityService.uploadFile(fileToUpload, "signatures");
                finalContent = uploadRes.publicFileUrl;
            } else if (activeTab === "identity") {
                if (!idNumber || !isVerified) {
                    showToast(t("invoice.verifyIDFirst") || "Please verify Identity first.", "error");
                    return;
                }
                finalContent = idNumber;
                verificationDetails = {
                    idType: "PAN",
                    idNumber: idNumber,
                    isVerified: isVerified,
                    verifiedAt: new Date().toISOString()
                };
            }

            const signatureData = {
                agency: agencyId,
                method: activeTab,
                content: finalContent,
                config,
                ...(verificationDetails && { verificationDetails }),
                metadata: {
                    source: "web-dashboard",
                }
            };

            const response = await executeCreate(
                signatureService.createSignature(signatureData)
            );

            if (response?.success) {
                if (onSuccess) onSuccess(response.data);
                showToast("Signature saved successfully!", "success");
            } else {
                showToast(response?.message || "Failed to save signature", "error");
            }
        } catch (error) {
            console.error("Signature save error:", error);
            showToast("An error occurred while saving your signature.", "error");
        } finally {
            setIsSigning(false);
        }
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
                <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full">
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

                                <TabPanel isActive={activeTab === "type"}>
                                    <TypeTab
                                        typedName={typedName}
                                        setTypedName={setTypedName}
                                        selectedStyle={selectedStyle}
                                        setSelectedStyle={setSelectedStyle}
                                        selectedFont={selectedFont}
                                        setSelectedFont={setSelectedFont}
                                    />
                                </TabPanel>

                                <TabPanel isActive={activeTab === "draw"}>
                                    <DrawTab
                                        canvasRef={canvasRef}
                                        startDrawing={startDrawing}
                                        draw={draw}
                                        stopDrawing={stopDrawing}
                                        clearCanvas={clearCanvas}
                                    />
                                </TabPanel>

                                <TabPanel isActive={activeTab === "upload"}>
                                    <UploadTab
                                        uploadedFiles={uploadedFiles}
                                        setUploadedFiles={handleUploadFilesChange}
                                        loading={isUploadingSignature}
                                    />
                                </TabPanel>

                                <TabPanel isActive={activeTab === "identity"}>
                                    <IdentityTab />
                                </TabPanel>
                            </Card>

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
                        <div>
                            <SignaturePreview
                                activeTab={activeTab}
                                typedName={typedName}
                                selectedFont={selectedFont}
                                selectedStyle={selectedStyle}
                                drawnSignature={drawnSignature}
                                uploadedFiles={uploadedFiles}
                                previewUrl={previewUrl}
                                isVerified={isVerified}
                                idNumber={idNumber}
                                isMounted={isMounted}
                                isSigning={isSigning}
                                handleFinalSign={handleFinalSign}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </SideDrawer>
    );
};

export default SignatureDrawer;
