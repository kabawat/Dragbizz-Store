import React from "react";
import { Input, Button } from "@/components/ui";
import { Fingerprint } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";

const IdentityTab = () => {
    const { t } = useTranslation();

    return (
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
    );
};

export default IdentityTab;
