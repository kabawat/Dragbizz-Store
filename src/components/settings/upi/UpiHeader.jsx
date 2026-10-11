"use client";
import { UpiHeaderView } from "@dragorbit/features/integrations";

import { useTranslation } from "@/hooks/ui/useTranslation";

const UpiHeader = ({ upiCount = 0, isLoading = false, onAddUpi }) => {
  const { t } = useTranslation();
  return <UpiHeaderView model={{ t, isLoading, upiCount, onAddUpi }} />;
};

export default UpiHeader;
