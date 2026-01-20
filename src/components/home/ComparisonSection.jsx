"use client";
import React from "react";
import { Card } from "@/components/ui";
import { SectionHeader } from "@/components/common";
import { CheckCircle, X } from "lucide-react";

const ComparisonSection = () => {
  const features = [
    { name: "AI-Powered Analytics", dragbizz: true, competitor: false },
    { name: "Real-Time Processing", dragbizz: true, competitor: false },
    { name: "Multi-Currency Support", dragbizz: true, competitor: false },
    { name: "50+ Payment Gateways", dragbizz: true, competitor: false },
    { name: "Unlimited Scalability", dragbizz: true, competitor: false },
    { name: "Mobile Apps (iOS/Android)", dragbizz: true, competitor: false },
    { name: "99.99% Uptime SLA", dragbizz: true, competitor: false },
    { name: "Enterprise Security", dragbizz: true, competitor: false },
    { name: "API & Webhooks", dragbizz: true, competitor: false },
    { name: "24/7 AI Support", dragbizz: true, competitor: false },
    { name: "Custom Workflows", dragbizz: true, competitor: false },
    { name: "Advanced Reporting", dragbizz: true, competitor: false },
  ];

  return (
    <section
      id="comparison"
      className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-[rgb(var(--color-bg-secondary))]"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <SectionHeader
          badge="Why Choose DragBizz"
          title="See How We're 10X Better"
          description="Compare DragBizz with other retail management solutions"
        />

        <div className="max-w-5xl mx-auto">
          <Card className="bg-[rgb(var(--color-bg-primary))] border-[rgb(var(--color-border-primary))] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgb(var(--color-border-primary))]">
                    <th className="text-left p-4 sm:p-6 font-semibold text-sm sm:text-base text-[rgb(var(--color-text-primary))]">
                      Features
                    </th>
                    <th className="text-center p-4 sm:p-6 font-semibold text-sm sm:text-base text-[rgb(var(--color-primary))]">
                      DragBizz
                    </th>
                    <th className="text-center p-4 sm:p-6 font-semibold text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
                      Competitors
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr
                      key={index}
                      className={`border-b border-[rgb(var(--color-border-primary))] ${
                        index % 2 === 0
                          ? "bg-[rgb(var(--color-bg-secondary))]"
                          : ""
                      }`}
                    >
                      <td className="p-4 sm:p-6 text-xs sm:text-sm md:text-base text-[rgb(var(--color-text-primary))] font-medium">
                        {feature.name}
                      </td>
                      <td className="p-4 sm:p-6 text-center">
                        {feature.dragbizz ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 sm:p-6 text-center">
                        {feature.competitor ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
