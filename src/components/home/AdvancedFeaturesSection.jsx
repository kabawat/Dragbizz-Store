"use client"
import React from 'react';
import { Card } from '@/components/ui';
import { SectionHeader } from '@/components/common';
import { 
  Brain, 
  Zap, 
  Shield, 
  Database, 
  Globe, 
  Lock, 
  BarChart3, 
  Bot,
  Cloud,
  Smartphone,
  CreditCard,
  Bell,
  TrendingUp,
  Users,
  Settings,
  Code
} from 'lucide-react';

const AdvancedFeaturesSection = () => {
  const advancedFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Machine learning algorithms analyze your sales patterns, predict demand, and suggest optimal inventory levels automatically.',
      color: 'from-purple-500 to-pink-500',
      gradient: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
      badge: 'NEW'
    },
    {
      icon: Zap,
      title: 'Real-Time Processing',
      description: 'Ultra-fast transaction processing with sub-second response times. Handle thousands of transactions simultaneously without lag.',
      color: 'from-yellow-500 to-orange-500',
      gradient: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10',
      badge: '10X FASTER'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, multi-factor authentication, and SOC 2 compliance. Your data is protected with military-grade security.',
      color: 'from-green-500 to-emerald-500',
      gradient: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
      badge: 'SECURE'
    },
    {
      icon: Database,
      title: 'Unlimited Scalability',
      description: 'Auto-scaling infrastructure handles millions of products, customers, and transactions. Grow without limits.',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
      badge: 'UNLIMITED'
    },
    {
      icon: Globe,
      title: 'Multi-Currency & Multi-Language',
      description: 'Support for 150+ currencies and 50+ languages. Sell globally with localized pricing and content.',
      color: 'from-indigo-500 to-purple-500',
      gradient: 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10',
      badge: 'GLOBAL'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data encrypted in transit and at rest. PCI DSS compliant payment processing with tokenization.',
      color: 'from-red-500 to-pink-500',
      gradient: 'bg-gradient-to-br from-red-500/10 to-pink-500/10',
      badge: 'PCI DSS'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics Dashboard',
      description: 'Real-time business intelligence with predictive analytics, custom reports, and automated insights.',
      color: 'from-teal-500 to-cyan-500',
      gradient: 'bg-gradient-to-br from-teal-500/10 to-cyan-500/10',
      badge: 'PRO'
    },
    {
      icon: Bot,
      title: 'AI Chatbot Support',
      description: '24/7 intelligent chatbot handles customer queries, order tracking, and support tickets automatically.',
      color: 'from-violet-500 to-purple-500',
      gradient: 'bg-gradient-to-br from-violet-500/10 to-purple-500/10',
      badge: 'AI'
    },
    {
      icon: Cloud,
      title: '99.99% Uptime SLA',
      description: 'Enterprise-grade cloud infrastructure with automatic failover and disaster recovery. Guaranteed uptime.',
      color: 'from-sky-500 to-blue-500',
      gradient: 'bg-gradient-to-br from-sky-500/10 to-blue-500/10',
      badge: 'SLA'
    },
    {
      icon: Smartphone,
      title: 'Native Mobile Apps',
      description: 'iOS and Android apps with offline mode, push notifications, and full feature parity with web platform.',
      color: 'from-rose-500 to-pink-500',
      gradient: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10',
      badge: 'MOBILE'
    },
    {
      icon: CreditCard,
      title: '50+ Payment Gateways',
      description: 'Integrated with Razorpay, Stripe, PayPal, and 50+ payment providers. Accept payments globally.',
      color: 'from-emerald-500 to-green-500',
      gradient: 'bg-gradient-to-br from-emerald-500/10 to-green-500/10',
      badge: '50+'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Intelligent alerts for low stock, sales milestones, customer behavior, and business insights.',
      color: 'from-amber-500 to-yellow-500',
      gradient: 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10',
      badge: 'SMART'
    },
    {
      icon: TrendingUp,
      title: 'Revenue Optimization',
      description: 'AI-driven pricing strategies, cross-sell recommendations, and automated marketing campaigns.',
      color: 'from-lime-500 to-green-500',
      gradient: 'bg-gradient-to-br from-lime-500/10 to-green-500/10',
      badge: 'AI'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Role-based access control, team workspaces, real-time collaboration, and activity tracking.',
      color: 'from-cyan-500 to-blue-500',
      gradient: 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10',
      badge: 'TEAM'
    },
    {
      icon: Settings,
      title: 'Customizable Workflows',
      description: 'Build custom automation workflows, integrate with 1000+ apps via Zapier, and automate repetitive tasks.',
      color: 'from-orange-500 to-red-500',
      gradient: 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
      badge: 'AUTOMATE'
    },
    {
      icon: Code,
      title: 'Developer API',
      description: 'RESTful API with comprehensive documentation, webhooks, and SDKs for seamless integrations.',
      color: 'from-slate-500 to-gray-500',
      gradient: 'bg-gradient-to-br from-slate-500/10 to-gray-500/10',
      badge: 'API'
    }
  ];

  return (
    <section id="advanced-features" className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-[rgb(var(--color-bg-primary))]">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <SectionHeader 
          badge="Advanced Features"
          title="10X More Powerful Than Any Competitor"
          description="Enterprise-grade features that give you a competitive edge"
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {advancedFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={`relative border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] overflow-hidden ${feature.gradient}`}
              >
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    {feature.badge && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
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
      </div>
    </section>
  );
};

export default AdvancedFeaturesSection;

