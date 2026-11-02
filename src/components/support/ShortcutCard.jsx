"use client";
import { ShortcutCardView } from "@dragorbit/features/support";

import ShortcutKeyBadge from "./ShortcutKeyBadge";

// Collapsible shortcut category card
const ShortcutCard = ({ category, isOpen, onToggle }) => {
  const CategoryIcon = category.icon;

  return (
    <ShortcutCardView
      model={{ onToggle, CategoryIcon, category, isOpen, ShortcutKeyBadge }}
    />
  );
};

export default ShortcutCard;
