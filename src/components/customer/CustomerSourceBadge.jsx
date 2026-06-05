"use client";
import {
  FileText,
  Globe,
  MessageCircle,
  Monitor,
  Phone,
  QrCode,
  Store,
  Upload,
  UserRound,
} from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getCustomerSourceLabel } from "@/utils/customer/customerSource.util";

const SOURCE_CONFIG = {
  MANUAL: {
    icon: UserRound,
    badgeStyle: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },
  POS: {
    icon: Monitor,
    badgeStyle: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  },
  INVOICE: {
    icon: FileText,
    badgeStyle: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  },
  BULK_IMPORT: {
    icon: Upload,
    badgeStyle: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  ONLINE: {
    icon: Globe,
    badgeStyle: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  IN_STORE: {
    icon: Store,
    badgeStyle: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  WHATSAPP: {
    icon: MessageCircle,
    badgeStyle: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  PHONE: {
    icon: Phone,
    badgeStyle: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  QR_CATALOG: {
    icon: QrCode,
    badgeStyle: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  },
};

const CustomerSourceBadge = ({ source, className = "", showLabel = true }) => {
  const { t } = useTranslation();
  const normalizedSource = source || "MANUAL";
  const config = SOURCE_CONFIG[normalizedSource] || SOURCE_CONFIG.MANUAL;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 max-w-full px-2 py-0.5 rounded-full text-xs font-medium border ${config.badgeStyle} ${className}`}
      title={getCustomerSourceLabel(normalizedSource, t)}
    >
      <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
      {showLabel && (
        <span className="truncate">{getCustomerSourceLabel(normalizedSource, t)}</span>
      )}
    </span>
  );
};

export default CustomerSourceBadge;
