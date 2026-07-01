"use client";

import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

export function KhataActionButtons({ loading = false, disabled = false, onYouGave, onYouGot }) {
  const { t } = useTranslation();
  const isDisabled = disabled || loading;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="danger"
        size="lg"
        fullWidth
        loading={loading}
        disabled={isDisabled}
        onClick={onYouGave}
        className="rounded-xl h-12 font-semibold"
      >
        {t("khata.youGave")}
      </Button>
      <Button
        type="button"
        variant="success"
        size="lg"
        fullWidth
        loading={loading}
        disabled={isDisabled}
        onClick={onYouGot}
        className="rounded-xl h-12 font-semibold"
      >
        {t("khata.youGot")}
      </Button>
    </div>
  );
}

export default KhataActionButtons;
