"use client";
import { PersonalInfoSectionView } from "@dragorbit/features/settings";

import { useTranslation } from "@/hooks/ui/useTranslation";
import PersonalInfoCard from "./PersonalInfoCard";

const PersonalInfoSection = ({ form, apiUser, user, onEditClick }) => {
  const { t } = useTranslation();
  return (
    <PersonalInfoSectionView
      model={{ t, onEditClick, PersonalInfoCard, form, apiUser, user }}
    />
  );
};

export default PersonalInfoSection;
