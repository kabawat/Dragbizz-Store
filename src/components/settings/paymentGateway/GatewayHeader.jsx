"use client";
import { GatewayHeaderView } from "@dragorbit/features/integrations";

import { useTranslation } from "@/hooks/ui/useTranslation";

const GatewayHeader = ({
  gatewayCount = 0,
  isLoading = false,
  onAddGateway,
  canCreate = true,
}) => {
  const { t } = useTranslation();
  return (
    <GatewayHeaderView
      model={{ t, isLoading, gatewayCount, canCreate, onAddGateway }}
    />
  );
};

export default GatewayHeader;
