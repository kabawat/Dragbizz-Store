"use client";
import { MessageCircle, BookOpen, ExternalLink, HelpCircle, ChevronDown, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useMemo } from "react";
import { getFaqs, getQuickStartSteps } from "@/data/constants/supportData";

const HelpTab = () => {
    const { t } = useTranslation();
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = useMemo(() => getFaqs(t), [t]);
    const steps = useMemo(() => getQuickStartSteps(t), [t]);

    const toggleFaq = (idx) => {
        setOpenFaq(openFaq === idx ? null : idx);
    };

    return (
        <div className="space-y-8 max-h-full overflow-y-auto pr-2 pb-6">
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="#" className="group bg-[rgb(var(--color-bg-primary))] p-6 rounded-2xl border border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))]/30 transition-all">
                    <div className="flex items-start justify-between">
                        <div className="w-12 h-12 bg-[rgb(var(--color-primary))]/10 rounded-xl flex items-center justify-center text-[rgb(var(--color-primary))] mb-4 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <ExternalLink className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-primary))]" />
                    </div>
                    <h3 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-2">
                        {t("suggestions.help.ui.docsTitle") || "Detailed Documentation"}
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                        {t("suggestions.help.ui.docsDesc") || "Step-by-step guides on how to use every feature of DragBizz Pro."}
                    </p>
                </a>

                <a href="#" className="group bg-[rgb(var(--color-bg-primary))] p-6 rounded-2xl border border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))]/30 transition-all">
                    <div className="flex items-start justify-between">
                        <div className="w-12 h-12 bg-[rgb(var(--color-primary))]/10 rounded-xl flex items-center justify-center text-[rgb(var(--color-primary))] mb-4 group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <ExternalLink className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-primary))]" />
                    </div>
                    <h3 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-2">
                        {t("suggestions.help.ui.contactTitle") || "Contact Support"}
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                        {t("suggestions.help.ui.contactDesc") || "Need direct help? Our support team is available via chat and email 24/7."}
                    </p>
                </a>
            </div>

            {/* FAQs */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <HelpCircle className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                    <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
                        {t("suggestions.help.ui.faqTitle") || "Frequently Asked Questions"}
                    </h3>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`border rounded-xl transition-all ${openFaq === idx ? "border-[rgb(var(--color-primary))]/50 bg-[rgb(var(--color-primary))]/5" : "border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]"}`}
                        >
                            <button
                                onClick={() => toggleFaq(idx)}
                                className="w-full text-left px-5 py-4 flex items-center justify-between"
                            >
                                <span className="font-semibold text-[rgb(var(--color-text-primary))]">{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? "max-h-40" : "max-h-0"}`}>
                                <div className="px-5 pb-5 text-[rgb(var(--color-text-secondary))] leading-relaxed text-sm">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Getting Started Progress (Visual only) */}
            <div className="bg-[rgb(var(--color-bg-primary))] p-8 rounded-2xl border border-[rgb(var(--color-border-primary))] border-dashed">
                <h3 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-4">
                    {t("suggestions.help.ui.checklistTitle") || "Quick Start Checklist"}
                </h3>
                <div className="space-y-4">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                {idx < 2 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-[rgb(var(--color-border-primary))]" />}
                            </div>
                            <span className={idx < 2 ? "text-[rgb(var(--color-text-secondary))] line-through" : "text-[rgb(var(--color-text-primary))]"}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HelpTab;
