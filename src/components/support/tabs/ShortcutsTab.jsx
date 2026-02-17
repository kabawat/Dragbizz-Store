import { Keyboard, Plus, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useMemo } from "react";
import { getShortcutCategories } from "@/data/constants/supportData";

const ShortcutsTab = () => {
    const { t } = useTranslation();

    const shortcutCategories = useMemo(() => getShortcutCategories(t), [t]);

    return (
        <div className="space-y-8 max-h-full overflow-y-auto pr-2 pb-10">
            {/* Header Pro Tip */}
            <div className="bg-gradient-to-r from-[rgb(var(--color-primary))]/10 via-[rgb(var(--color-primary))]/5 to-transparent border border-[rgb(var(--color-primary))]/20 rounded-2xl p-6">
                <div className="flex items-start gap-5">
                    <div className="w-12 h-12 bg-[rgb(var(--color-bg-primary))] rounded-xl flex items-center justify-center text-[rgb(var(--color-primary))] flex-shrink-0 animate-pulse">
                        <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <h4 className="text-[rgb(var(--color-text-primary))] font-bold text-lg mb-1">
                            {t("suggestions.shortcuts.ui.masterWorkflow") || "Master the Workflow"}
                        </h4>
                        <p className="text-[rgb(var(--color-text-secondary))] text-sm leading-relaxed max-w-3xl">
                            {t("suggestions.shortcuts.ui.workflowDescription") || "DragBizz Pro supports deep keyboard integration. Every shortcut is designed to keep your hands on the keyboard and your business moving faster. Start with Shift+N for new entries or Alt+H to go home."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {shortcutCategories.map((category, idx) => {
                    const CategoryIcon = category.icon;
                    return (
                        <div
                            key={idx}
                            className="bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-primary))] overflow-hidden flex flex-col"
                        >
                            <div className="bg-[rgb(var(--color-bg-secondary))]/30 px-6 py-5 border-b border-[rgb(var(--color-border-primary))] flex items-center gap-4">
                                <div className="p-2.5 bg-[rgb(var(--color-bg-primary))] rounded-xl text-[rgb(var(--color-primary))] border border-[rgb(var(--color-border-primary))]/50">
                                    <CategoryIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[rgb(var(--color-text-primary))]">
                                        {category.title}
                                    </h3>
                                    <p className="text-xs text-[rgb(var(--color-text-tertiary))] font-medium">
                                        {category.description}
                                    </p>
                                </div>
                            </div>
                            <div className="divide-y divide-[rgb(var(--color-border-primary))]/50 h-full">
                                {category.items.map((item, i) => (
                                    <div key={i} className="px-6 py-3.5 flex items-center justify-between hover:bg-[rgb(var(--color-bg-secondary))]/40 transition-colors group">
                                        <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">
                                            {item.action}
                                        </span>
                                        <div className="flex items-center translate-y-[1px]">
                                            {item.keys.map((key, k) => (
                                                <div key={k} className="flex items-center">
                                                    <span className="px-2 py-1 min-w-[34px] text-center bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded text-[10px] font-black text-[rgb(var(--color-text-primary))] uppercase group-hover:border-[rgb(var(--color-primary))]/30 transition-colors">
                                                        {key}
                                                    </span>
                                                    {k < item.keys.length - 1 && (
                                                        <Plus className="mx-1.5 w-2.5 h-2.5 text-[rgb(var(--color-text-tertiary))]" strokeWidth={3} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center pt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-full text-xs text-[rgb(var(--color-text-tertiary))] font-medium">
                    <Keyboard className="w-3.5 h-3.5" />
                    {t("suggestions.shortcuts.ui.proTip") || "Pro tip: Use these shortcuts to work up to 2x faster."}
                </div>
            </div>
        </div>
    );
};

export default ShortcutsTab;
