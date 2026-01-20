"use client";
import React from "react";
import { Card } from "@/components/ui";
import { SectionHeader } from "@/components/common";
import { Star } from "lucide-react";

const TestimonialsSection = ({
  testimonials,
  badge = "Testimonials",
  title = (
    <>
      Trusted by <span className="gradient-text">Retailers Worldwide</span>
    </>
  ),
  description = "See what our customers have to say about their experience",
}) => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[rgb(var(--color-bg-secondary))]">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <SectionHeader badge={badge} title={title} description={description} />

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-[rgb(var(--color-bg-primary))] border-[rgb(var(--color-border-primary))] hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="p-4 sm:p-5 md:p-6">
                <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm md:text-base text-[rgb(var(--color-text-secondary))] mb-4 sm:mb-5 md:mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[rgb(var(--color-primary))] to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base text-[rgb(var(--color-text-primary))]">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-[rgb(var(--color-text-tertiary))]">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
