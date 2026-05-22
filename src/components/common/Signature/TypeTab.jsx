import React from "react";
import { Input } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { SIGNATURE_FONTS } from "@/constants/signatureFonts";

const TypeTab = ({
    typedName,
    setTypedName,
    selectedStyle,
    setSelectedStyle,
    selectedFont,
    setSelectedFont
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
                <Input
                    label={t("invoice.typeFullName")}
                    placeholder={t("invoice.namePlaceholder")}
                    value={typedName}
                    onChange={(val) => setTypedName(val)}
                    className="text-lg flex-1"
                />
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
                            style={{ fontFamily: font.family }}
                            className={`text-2xl whitespace-nowrap overflow-hidden text-ellipsis px-2 text-[rgb(var(--color-text-primary))] ${selectedStyle.bold ? 'font-bold' : ''} ${selectedStyle.italic ? 'italic' : ''}`}
                        >
                            {typedName || font.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TypeTab;
