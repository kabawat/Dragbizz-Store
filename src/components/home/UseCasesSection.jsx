"use client"
import React from 'react';
import { Card } from '@/components/ui';
import { SectionHeader } from '@/components/common';
import { 
  Store, 
  ShoppingBag, 
  Building2, 
  Package,
  UtensilsCrossed,
  Shirt,
  Laptop,
  Heart
} from 'lucide-react';

const UseCasesSection = () => {
  const useCases = [
    {
      icon: Store,
      title: 'Retail Stores',
      description: 'Perfect for brick-and-mortar stores managing inventory, sales, and customer relationships.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ShoppingBag,
      title: 'E-Commerce',
      description: 'Manage online stores with multi-channel selling, order fulfillment, and inventory sync.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Building2,
      title: 'Wholesale Businesses',
      description: 'Handle bulk orders, B2B transactions, and distributor management efficiently.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Package,
      title: 'Warehouse Management',
      description: 'Optimize warehouse operations with FIFO, batch tracking, and automated reordering.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: UtensilsCrossed,
      title: 'Restaurants & Cafes',
      description: 'Manage food inventory, track perishables, and handle restaurant operations.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shirt,
      title: 'Fashion & Apparel',
      description: 'Track sizes, colors, variants, and manage seasonal inventory effectively.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Laptop,
      title: 'Electronics',
      description: 'Handle serial numbers, warranties, and technical specifications with ease.',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Heart,
      title: 'Healthcare & Pharmacy',
      description: 'Manage medical supplies, track expiration dates, and maintain compliance.',
      color: 'from-red-500 to-pink-500'
    }
  ];

  return (
    <section id="use-cases" className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-[rgb(var(--color-bg-primary))]">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <SectionHeader 
          badge="Use Cases"
          title="Perfect For Every Business Type"
          description="Tailored solutions for different industries and business models"
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <Card
                key={index}
                className={`border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] overflow-hidden bg-gradient-to-br ${useCase.color}/10`}
              >
                <div className="p-4 sm:p-5 md:p-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-4 sm:mb-5 shadow-lg`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-[rgb(var(--color-text-primary))]">
                    {useCase.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-[rgb(var(--color-text-secondary))] leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;

