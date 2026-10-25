"use client";
import { SignatureSettings } from "@/components/settings";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";

const SignaturesUtilityPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("settings.digitalSignatures") || "Digital Signatures",
    t("settings.signatureDescription") ||
      "Manage digital signatures for invoices and bills",
  );

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
      <div className="w-full h-full overflow-y-auto custom-scrollbar">
        <SignatureSettings />
      </div>
    </div>
  );
};

export default SignaturesUtilityPage;

