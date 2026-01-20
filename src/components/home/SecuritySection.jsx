"use client";
import React from "react";
import { Card } from "@/components/ui";
import { SectionHeader } from "@/components/common";
import {
  Shield,
  Lock,
  CheckCircle,
  Award,
  FileCheck,
  Server,
} from "lucide-react";

const SecuritySection = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: "SOC 2 Compliant",
      description: "Certified for security, availability, and confidentiality",
      badge: "CERTIFIED",
    },
    {
      icon: Lock,
      title: "PCI DSS Level 1",
      description: "Highest level of payment security compliance",
      badge: "LEVEL 1",
    },
    {
      icon: FileCheck,
      title: "GDPR Compliant",
      description: "Full compliance with EU data protection regulations",
      badge: "EU",
    },
    {
      icon: Server,
      title: "End-to-End Encryption",
      description: "256-bit SSL encryption for all data in transit and at rest",
      badge: "256-BIT",
    },
    {
      icon: CheckCircle,
      title: "Regular Security Audits",
      description: "Third-party security audits and penetration testing",
      badge: "AUDITED",
    },
    {
      icon: Award,
      title: "ISO 27001 Certified",
      description: "International standard for information security management",
      badge: "ISO",
    },
  ];

  const trustBadges = [
    "SSL Secured",
    "Bank-Level Security",
    "99.99% Uptime",
    "24/7 Monitoring",
    "Data Backup",
    "Disaster Recovery",
  ];

  return (
    <section
      id="security"
      className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-[rgb(var(--color-bg-secondary))]"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <SectionHeader
          badge="Security & Compliance"
          title="Enterprise-Grade Security"
          description="Your data is protected with military-grade security and compliance"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] overflow-hidden"
              >
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    {feature.badge && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/10 text-green-600">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-[rgb(var(--color-text-primary))]">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-[rgb(var(--color-text-secondary))] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-[rgb(var(--color-bg-primary))] border-[rgb(var(--color-border-primary))] p-6 sm:p-8 md:p-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 text-[rgb(var(--color-text-primary))]">
              Trusted By Thousands
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]"
                >
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mb-2" />
                  <span className="text-xs sm:text-sm text-center text-[rgb(var(--color-text-primary))] font-medium">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
