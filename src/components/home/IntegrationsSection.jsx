"use client";
import {
  Cloud,
  CreditCard,
  Database,
  Globe,
  Mail,
  MessageSquare,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { SectionHeader } from "@/components/common";
import { Card } from "@/components/ui";

const IntegrationsSection = () => {
  const integrations = [
    {
      category: "Payment Gateways",
      icon: CreditCard,
      items: [
        "Razorpay",
        "Stripe",
        "PayPal",
        "Square",
        "Mercado Pago",
        "50+ More",
      ],
      color: "from-blue-500 to-cyan-500",
    },
    {
      category: "E-Commerce",
      icon: ShoppingBag,
      items: ["Shopify", "WooCommerce", "Magento", "BigCommerce", "PrestaShop"],
      color: "from-purple-500 to-pink-500",
    },
    {
      category: "Email Marketing",
      icon: Mail,
      items: ["Mailchimp", "SendGrid", "Constant Contact", "Campaign Monitor"],
      color: "from-green-500 to-emerald-500",
    },
    {
      category: "Communication",
      icon: MessageSquare,
      items: [
        "WhatsApp Business",
        "Slack",
        "Telegram",
        "Discord",
        "Microsoft Teams",
      ],
      color: "from-orange-500 to-red-500",
    },
    {
      category: "Cloud Storage",
      icon: Cloud,
      items: ["AWS S3", "Google Cloud", "Azure", "Dropbox", "OneDrive"],
      color: "from-indigo-500 to-blue-500",
    },
    {
      category: "Automation",
      icon: Zap,
      items: ["Zapier", "Make (Integromat)", "IFTTT", "n8n", "Custom Webhooks"],
      color: "from-yellow-500 to-orange-500",
    },
    {
      category: "Accounting",
      icon: Database,
      items: ["QuickBooks", "Xero", "FreshBooks", "Sage", "Tally"],
      color: "from-teal-500 to-cyan-500",
    },
    {
      category: "Shipping",
      icon: Globe,
      items: ["FedEx", "UPS", "DHL", "ShipStation", "Shippo"],
      color: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <section
      id="integrations"
      className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-[rgb(var(--color-bg-primary))]"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <SectionHeader
          badge="Integrations"
          title="Connect With 1000+ Tools"
          description="Seamlessly integrate with your favorite apps and services"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            return (
              <Card
                key={index}
                className={`border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] overflow-hidden bg-gradient-to-br ${integration.color}/10`}
              >
                <div className="p-4 sm:p-5 md:p-6">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-[rgb(var(--color-text-primary))]">
                    {integration.category}
                  </h3>
                  <ul className="space-y-2">
                    {integration.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))] flex items-center gap-2"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${integration.color}`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
