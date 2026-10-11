"use client";
import { PersonalInfoCardView } from "@dragorbit/features/settings";

const PersonalInfoCard = ({ icon: Icon, label, value }) => {
  const getValueClasses = () => {
    const base = "text-sm font-medium text-[rgb(var(--color-text-primary))]";
    if (label === "Email") return `${base} break-all`;
    if (label === "Gender") return `${base} capitalize`;
    return base;
  };

  return (
    <PersonalInfoCardView model={{ Icon, label, getValueClasses, value }} />
  );
};

export default PersonalInfoCard;
