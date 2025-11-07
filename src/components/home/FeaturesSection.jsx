"use client"
import React from 'react';
import { FeatureCard, SectionHeader } from '@/components/common';

const FeaturesSection = ({ 
  features, 
  badge = 'Features',
  title = 'Everything You Need to Run Your Business',
  description = 'Comprehensive tools and features designed to streamline your retail operations'
}) => {
  return (
    <section id="features" className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-[rgb(var(--color-bg-secondary))]">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <SectionHeader badge={badge} title={title} description={description} />
        
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              gradient={feature.gradient}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

