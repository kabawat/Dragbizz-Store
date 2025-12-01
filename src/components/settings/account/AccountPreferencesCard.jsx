"use client"
import { Globe, Clock, Calendar, DollarSign } from 'lucide-react';

const iconMap = {
  language: Globe,
  timezone: Clock,
  dateFormat: Calendar,
  currency: DollarSign,
};

const AccountPreferencesCard = ({ icon, label, value, options = [] }) => {
  const IconComponent = iconMap[icon] || null;
  
  return (
    <div className="p-4 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]/60">
      <div className="flex items-center gap-2 mb-1">
        {IconComponent && (
          <IconComponent className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
        )}
        <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--color-text-tertiary))]">
          {label}
        </p>
      </div>
      <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
        {value || '-'}
      </p>
    </div>
  );
};

export default AccountPreferencesCard;

