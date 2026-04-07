"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Trash2, PenTool, AlertCircle } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { SignatureDrawer } from "@/components/common";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchSignatures, addSignature, removeSignature } from "@/store/slices/signaturesSlice";
import { signatureService, utilityService } from "@/service";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";

import SignatureDeleteModal from "./SignatureDeleteModal";

const SignatureSettings = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { showToast } = useGlobalToast();

    const { items: signatures, loading: signaturesLoading } = useAppSelector((state) => state.signatures);
    const { agency: profileAgency, selectedStore } = useAppSelector((state) => state.profile);
    const themeVariant = useAppSelector((state) => state.theme.variant);

    const [showDrawer, setShowDrawer] = useState(false);
    const [signatureToDelete, setSignatureToDelete] = useState(null);
    const { execute: executeDelete, loading: isDeleting } = useApiResponse();

    // Derive agencyId
    const agencyId = profileAgency?.agencyId || profileAgency?._id || selectedStore?.agency || selectedStore?.agencyId;

    const loadSignatures = useCallback(() => {
        if (agencyId) {
            dispatch(fetchSignatures({ agencyId, lightweight: true }));
        }
    }, [agencyId, dispatch]);

    useEffect(() => {
        loadSignatures();
    }, [loadSignatures]);

    const handleCreateSuccess = (signatureData) => {
        dispatch(addSignature(signatureData));
        setShowDrawer(false);
        showToast("Signature saved successfully!", "success");
    };

    const confirmDelete = async () => {
        if (!signatureToDelete) return;
        const id = signatureToDelete.id || signatureToDelete._id;

        const result = await executeDelete(
            signatureService.deleteSignature(id),
            { showToast: false }
        );

        if (result?.success) {
            // If the signature was stored in S3, delete the file as well
            if (signatureToDelete.method === "upload" || signatureToDelete.method === "draw") {
                utilityService.deleteFile(signatureToDelete.content).catch(err => {
                    console.error("Failed to delete signature image from S3", err);
                });
            }

            dispatch(removeSignature(id));
            showToast(t("settings.signatureDeleted") || "Signature deleted successfully", "success");
            setSignatureToDelete(null);
        } else {
            showToast(result?.message || "Failed to delete signature", "error");
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                        {t("settings.digitalSignatures") || "Digital Signatures"}
                    </h2>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                        {t("settings.signatureDescription") || "Manage your digital signatures for invoices and documents."}
                    </p>
                </div>
                <Button
                    onClick={() => setShowDrawer(true)}
                    leftIcon={Plus}
                    variant="primary"
                >
                    {t("common.addNew") || "Add New"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {signaturesLoading && signatures.length === 0 ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-40 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))
                ) : signatures.length > 0 ? (
                    <>
                        {signatures.map((sig) => {
                            const id = sig.id || sig._id;
                            return (
                                <div key={id} className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/70 p-4 relative group flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-3 border-b border-[rgb(var(--color-border-primary))]/20 pb-3">
                                        <div className="flex items-center gap-2 text-xs text-[rgb(var(--color-text-secondary))]">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            {new Date(sig.createdAt).toLocaleDateString()}
                                        </div>
                                        <button
                                            onClick={() => setSignatureToDelete(sig)}
                                            className="w-8 h-8 flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors cursor-pointer"
                                            title={t("common.delete")}
                                        >
                                            <Trash2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                        </button>
                                    </div>

                                    <div className="flex-1 flex items-center justify-center min-h-[100px] bg-[rgb(var(--color-bg-secondary))]/30 rounded-lg p-4 mb-2">
                                        <div className="relative w-full h-24 flex items-center justify-center">
                                            {(sig.method === "upload" || sig.method === "draw") ? (
                                                <Image
                                                    src={sig.content}
                                                    alt="Signature"
                                                    fill
                                                    className={`object-contain ${themeVariant === 'dark' ? 'invert' : ''}`}
                                                />
                                            ) : sig.method === "type" ? (
                                                <span
                                                    style={{ fontFamily: sig.config?.fontFamily || "'Dancing Script', cursive" }}
                                                    className={`text-4xl text-[rgb(var(--color-text-primary))] select-none ${sig.config?.bold ? 'font-bold' : ''} ${sig.config?.italic ? 'italic' : ''}`}
                                                >
                                                    {sig.content}
                                                </span>
                                            ) : sig.method === "identity" ? (
                                                <div className="text-center text-[rgb(var(--color-primary))]">
                                                    <Fingerprint className="w-6 h-6 mx-auto mb-1 opacity-70" />
                                                    <p className="font-bold tracking-widest text-lg">{sig.content}</p>
                                                    <p className="text-[10px] uppercase font-black opacity-50">
                                                        {sig.verificationDetails?.idType || "Verified ID"}
                                                    </p>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="text-[10px] text-center text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider font-medium">
                                        {sig.method === "type" ? t("invoice.typeName") :
                                            sig.method === "draw" ? t("invoice.draw") :
                                                t("invoice.uploadImage")}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Always show Add New Card at the end if there are signatures */}
                        <button
                            type="button"
                            onClick={() => setShowDrawer(true)}
                            className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-dashed border-[rgb(var(--color-border-primary))]/70 p-6 relative flex flex-col items-center justify-center h-full min-h-[220px] hover:border-[rgb(var(--color-primary))]/60 hover:bg-[rgb(var(--color-primary))]/5 transition-colors cursor-pointer"
                        >
                            <div className="w-12 h-12 mb-4 rounded-full bg-[rgb(var(--color-primary))]/10 flex items-center justify-center">
                                <Plus className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                            </div>
                            <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                                {t("common.addNew")}
                            </h3>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))] text-center max-w-[220px]">
                                {t("settings.createSignaturePrompt") || "Create a new digital signature"}
                            </p>
                        </button>
                    </>
                ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-[rgb(var(--color-border-primary))]/50 rounded-xl bg-[rgb(var(--color-bg-primary))]/30">
                        <div className="p-4 rounded-full bg-[rgb(var(--color-bg-secondary))] mb-4">
                            <PenTool className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                        </div>
                        <h3 className="text-base font-medium text-[rgb(var(--color-text-primary))] mb-1">
                            {t("settings.noSignatures") || "No signatures found"}
                        </h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4 max-w-sm">
                            {t("settings.createSignaturePrompt") || "Create a digital signature to use on your invoices and documents."}
                        </p>
                        <Button
                            onClick={() => setShowDrawer(true)}
                            variant="outline"
                            size="sm"
                            leftIcon={Plus}
                        >
                            {t("common.createNow") || "Create Now"}
                        </Button>
                    </div>
                )}
            </div>

            <SignatureDrawer
                isOpen={showDrawer}
                onClose={() => setShowDrawer(false)}
                onSuccess={handleCreateSuccess}
                agencyId={agencyId}
            />

            <SignatureDeleteModal
                isOpen={!!signatureToDelete}
                signatureToDelete={signatureToDelete}
                isDeleting={isDeleting}
                onClose={() => setSignatureToDelete(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default SignatureSettings;
