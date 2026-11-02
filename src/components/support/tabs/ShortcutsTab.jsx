"use client";
import { ShortcutsTabView } from "@dragorbit/features/support";

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getShortcutCategories } from "@/data/constants/supportData";
import ShortcutCard from "@/components/support/ShortcutCard";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);

const ShortcutsTab = () => {
  const { t } = useTranslation();

  const shortcutCategories = useMemo(
    () => getShortcutCategories(t, isMac),
    [t],
  );

  const [expandedCards, setExpandedCards] = useState(() =>
    shortcutCategories.map(() => true),
  );

  const toggleCard = (idx) => {
    setExpandedCards((prev) =>
      prev.map((open, i) => (i === idx ? !open : open)),
    );
  };

  // Split for independent columns (no cross-column height effect)
  const leftCards = shortcutCategories
    .map((cat, idx) => ({ cat, idx }))
    .filter(({ idx }) => idx % 2 === 0);
  const rightCards = shortcutCategories
    .map((cat, idx) => ({ cat, idx }))
    .filter(({ idx }) => idx % 2 === 1);

  return (
    <ShortcutsTabView
      model={{
        t,
        leftCards,
        ShortcutCard,
        expandedCards,
        toggleCard,
        rightCards,
        shortcutCategories,
      }}
    />
  );
};

export default ShortcutsTab;
