"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Percent, ShoppingBag, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";
import useCustomerDisplayAds from "@/hooks/payment/useCustomerDisplayAds";

const DEFAULT_SLIDES = [
  { id: "welcome", icon: Sparkles, titleKey: "invoice.customerPayment.idleSlideWelcome", bodyKey: "invoice.customerPayment.idleSlideWelcomeBody" },
  { id: "offers", icon: Percent, titleKey: "invoice.customerPayment.idleSlideOffers", bodyKey: "invoice.customerPayment.idleSlideOffersBody" },
  { id: "catalog", icon: ShoppingBag, titleKey: "invoice.customerPayment.idleSlideCatalog", bodyKey: "invoice.customerPayment.idleSlideCatalogBody" },
];

const SLIDE_INTERVAL_MS = 6000;

const CustomerDisplayIdle = () => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const configuredAds = useCustomerDisplayAds();
  const [activeIndex, setActiveIndex] = useState(0);

  const storeName = selectedStore?.storeName || "";
  const slides =
    configuredAds.length > 0
      ? configuredAds
      : DEFAULT_SLIDES.map((slide) => ({
          id: slide.id,
          title: t(slide.titleKey),
          body: t(slide.bodyKey),
          Icon: slide.icon,
        }));

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeIndex];
  const SlideIcon = activeSlide.Icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center animate-in fade-in duration-500">
      <div className="mb-8">
        <Image
          src="/logo/logo.png"
          alt="DragBizz"
          width={72}
          height={72}
          className="mx-auto rounded-2xl shadow-sm"
          priority
        />
      </div>

      {storeName && (
        <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2">{storeName}</h1>
      )}
      <p className="text-base text-[rgb(var(--color-text-secondary))] mb-10 max-w-md">
        {t("invoice.customerPayment.idleWelcome")}
      </p>

      <div
        key={activeSlide.id}
        className="w-full max-w-lg rounded-2xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] p-8 shadow-sm animate-in fade-in zoom-in-95 duration-700"
      >
        {SlideIcon && (
          <div className="w-14 h-14 rounded-full bg-[rgb(var(--color-primary))]/10 flex items-center justify-center mx-auto mb-5">
            <SlideIcon className="w-7 h-7 text-[rgb(var(--color-primary))]" />
          </div>
        )}
        <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
          {activeSlide.title}
        </h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed">
          {activeSlide.body}
        </p>
      </div>

      {slides.length > 1 && (
        <div className="flex gap-2 mt-6">
          {slides.map((slide, index) => (
            <span
              key={slide.id}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex
                  ? "w-6 bg-[rgb(var(--color-primary))]"
                  : "w-2 bg-[rgb(var(--color-border-primary))]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDisplayIdle;
