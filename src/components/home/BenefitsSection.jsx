"use client";
import { ArrowRight, Award } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge, Button } from "@/components/ui";

const BenefitsSection = ({
  benefits,
  badge = "Benefits",
  title = (
    <>
      Why Choose
      <br />
      <span className="gradient-text">DragBizz?</span>
    </>
  ),
  description = "Join thousands of retailers who trust DragBizz to power their business operations. Experience the difference with our comprehensive solution.",
  ctaText = "Start Your Free Trial",
  onCTAClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const squareImages = Array.from(
    { length: 14 },
    (_, i) => `/images/3d/square_${String(i + 1).padStart(3, "0")}.png`
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % squareImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [squareImages.length]);

  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        {squareImages.slice(0, 4).map((img, index) => (
          <div
            key={index}
            className="absolute hidden sm:block"
            style={{
              top: `${20 + (index % 2) * 40}%`,
              left: `${15 + (index % 2) * 50}%`,
              width: "200px",
              height: "200px",
              transform: `rotate(${index * 30}deg)`,
              filter: "blur(40px)",
            }}
          >
            <Image src={img} alt="" fill className="object-contain" />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <div>
            <Badge
              variant="primary"
              className="mb-3 sm:mb-4 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
            >
              {badge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[rgb(var(--color-text-secondary))] mb-6 sm:mb-8 leading-relaxed">
              {description}
            </p>

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 sm:gap-4 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-purple-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                    <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-[rgb(var(--color-text-secondary))]">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 sm:mt-8 md:mt-10">
              <Button
                variant="primary"
                size="md"
                rightIcon={ArrowRight}
                className="text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 w-full sm:w-auto"
                onClick={onCTAClick}
              >
                {ctaText}
              </Button>
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[rgb(var(--color-border-primary))] shadow-2xl group">
              <Image
                src={squareImages[currentImageIndex]}
                alt="Dashboard Preview"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Floating Elements */}
              <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 bg-white/90 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg shadow-xl">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-800">
                    Live Dashboard
                  </span>
                </div>
              </div>

              <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 right-3 sm:right-4 md:right-6 bg-gradient-to-br from-[rgb(var(--color-primary))] to-purple-500 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full shadow-xl">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm md:text-base font-bold">
                    Best in Class
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
