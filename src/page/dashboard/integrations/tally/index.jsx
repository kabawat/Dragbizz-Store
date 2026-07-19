"use client";

import IntegrationsSettings from "@/components/settings/integrations";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";

const TallyIntegrationsPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(t("integrations.tallySettings"), t("integrations.tallySettingsDesc"));

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
      <div className="w-full h-full overflow-y-auto custom-scrollbar">
        <IntegrationsSettings />
      </div>
    </div>
  );
};

export default TallyIntegrationsPage;
