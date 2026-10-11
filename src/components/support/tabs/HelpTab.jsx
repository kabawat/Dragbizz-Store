"use client";
import { HelpTabView } from "@dragorbit/features/support";
import { Calculator, Package, BarChart3, Settings } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  getFaqs,
  getQuickStartSteps,
  getRelatedLinks,
} from "@/data/constants/supportData";
import { getMainDomainUrl } from "@/utils/helper/domain";

const iconsMap = {
  Calculator,
  Package,
  BarChart3,
  Settings,
};

const HelpTab = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = useMemo(() => getFaqs(t), [t]);
  const steps = useMemo(() => getQuickStartSteps(t), [t]);
  const relatedLinks = useMemo(() => getRelatedLinks(t), [t]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.q.toLowerCase().includes(query) ||
        faq.a.toLowerCase().includes(query) ||
        faq.category?.toLowerCase().includes(query),
    );
  }, [faqs, searchQuery]);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <HelpTabView
      model={{
        t,
        searchQuery,
        setSearchQuery,
        getMainDomainUrl,
        filteredFaqs,
        openFaq,
        toggleFaq,
        relatedLinks,
        iconsMap,
        Link,
        steps,
      }}
    />
  );
};

export default HelpTab;
