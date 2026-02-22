"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "@/components/common";
import { Card } from "@/components/ui";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How is DragBizz 10X better than competitors?",
      answer:
        "DragBizz offers AI-powered analytics, real-time processing, unlimited scalability, 50+ payment gateways, native mobile apps, 99.99% uptime SLA, enterprise security, and 24/7 AI support - features that most competitors don't provide.",
    },
    {
      question: "Can I integrate with my existing tools?",
      answer:
        "Yes! DragBizz integrates with 1000+ tools including payment gateways (Razorpay, Stripe, PayPal), e-commerce platforms (Shopify, WooCommerce), email marketing (Mailchimp), automation tools (Zapier), and more via our comprehensive API.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use bank-level encryption, SOC 2 compliance, PCI DSS Level 1 certification, GDPR compliance, regular security audits, and 256-bit SSL encryption for all data in transit and at rest.",
    },
    {
      question: "Do you offer mobile apps?",
      answer:
        "Yes! We provide native iOS and Android apps with offline mode, push notifications, and full feature parity with our web platform. Manage your business on the go!",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We support 50+ payment gateways including Razorpay, Stripe, PayPal, Square, and many more. Accept payments in 150+ currencies globally.",
    },
    {
      question: "Can I customize the platform?",
      answer:
        "Yes! DragBizz offers customizable workflows, custom fields, branded invoices, custom reports, and a comprehensive REST API for building custom integrations.",
    },
    {
      question: "What kind of support do you provide?",
      answer:
        "We offer 24/7 AI chatbot support, email support, phone support for enterprise plans, comprehensive documentation, video tutorials, and dedicated account managers for premium customers.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes! We offer a 14-day free trial with full access to all features. No credit card required. Start your free trial today!",
    },
  ];

  return (
    <section
      id="faq"
      className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-[rgb(var(--color-bg-secondary))]"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <SectionHeader
          badge="FAQ"
          title="Frequently Asked Questions"
          description="Everything you need to know about DragBizz"
        />

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full p-4 sm:p-5 md:p-6 text-left flex items-center justify-between hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
              >
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[rgb(var(--color-text-primary))] pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--color-text-secondary))] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--color-text-secondary))] flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                  <p className="text-xs sm:text-sm md:text-base text-[rgb(var(--color-text-secondary))] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
