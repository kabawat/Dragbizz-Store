"use client";
import { FileUpload as SharedFileUpload } from "@dragorbit/ui";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
export default function FileUpload(props) {
  const { currentVariant } = useTheme();
  const { t } = useTranslation();
  return <SharedFileUpload {...props} t={t} currentVariant={currentVariant} />;
}
