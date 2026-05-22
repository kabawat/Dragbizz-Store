import React from "react";
import { FileUpload } from "@/components/ui";
import { Info } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";

const UploadTab = ({ uploadedFiles, setUploadedFiles, loading }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-[rgb(var(--color-warning))]/10 rounded-xl mb-4 border border-[rgb(var(--color-warning))]/20">
                <Info className="w-5 h-5 text-[rgb(var(--color-warning))] shrink-0" />
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                    {t("invoice.uploadInstructions")}
                </p>
            </div>
            <FileUpload
                loading={loading}
                label={t("invoice.uploadSignature")}
                accept="image/*"
                multiple={false}
                value={uploadedFiles}
                onChange={setUploadedFiles}
                dropZoneLabel={t("invoice.dragDropSignature")}
            />
        </div>
    );
};

export default UploadTab;
