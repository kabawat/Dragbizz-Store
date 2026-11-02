"use client";
import { AccountPreferencesCardView } from "@dragorbit/features/settings";

import { Calendar, Clock, DollarSign, Globe } from "lucide-react";

const iconMap = {
  language: Globe,
  timezone: Clock,
  dateFormat: Calendar,
  currency: DollarSign,
};

const AccountPreferencesCard = ({ icon, label, value, options = [] }) => {
  const IconComponent = iconMap[icon] || null;

  return <AccountPreferencesCardView model={{ IconComponent, label, value }} />;
};

export default AccountPreferencesCard;
