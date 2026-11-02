"use client";
import { AccountActionsSectionView } from "@dragorbit/features/settings";

import { useTranslation } from "@/hooks/ui/useTranslation";

const AccountActionsSection = () => {
  const { t } = useTranslation();
  return <AccountActionsSectionView model={{ t }} />;
};

export default AccountActionsSection;
