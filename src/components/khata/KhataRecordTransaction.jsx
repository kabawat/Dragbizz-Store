"use client";
import { KhataRecordTransaction as SharedKhataRecordTransaction } from "@dragorbit/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
export function KhataRecordTransaction(props) {
  const { t } = useTranslation();
  return <SharedKhataRecordTransaction {...props} t={t} />;
}
export default KhataRecordTransaction;
