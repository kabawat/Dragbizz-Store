"use client";
import { TallyIntegrationsScreen } from "@dragorbit/features/integrations";

import IntegrationsSettings from "@/components/settings/integrations";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";

const TallyIntegrationsPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("integrations.tallySettings"),
    t("integrations.tallySettingsDesc"),
  );

  return <TallyIntegrationsScreen model={{ IntegrationsSettings }} />;
};

export default TallyIntegrationsPage;
