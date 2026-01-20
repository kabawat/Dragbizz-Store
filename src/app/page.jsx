"use client";
import dynamic from "next/dynamic";
import { Footer } from "@/components/common";

const ProductHeader = dynamic(
  () => import("@/components/layout/ProductHeader"),
  {
    ssr: true,
  }
);

const HeroSection = dynamic(() => import("@/components/home/HeroSection"), {
  ssr: true,
});

const FeaturesSection = dynamic(
  () => import("@/components/home/FeaturesSection"),
  {
    ssr: true,
  }
);

const AdvancedFeaturesSection = dynamic(
  () => import("@/components/home/AdvancedFeaturesSection"),
  {
    ssr: true,
  }
);

const BenefitsSection = dynamic(
  () => import("@/components/home/BenefitsSection"),
  {
    ssr: true,
  }
);

const TestimonialsSection = dynamic(
  () => import("@/components/home/TestimonialsSection"),
  {
    ssr: true,
  }
);

const PricingSection = dynamic(
  () => import("@/components/home/PricingSection"),
  {
    ssr: true,
  }
);

const ComparisonSection = dynamic(
  () => import("@/components/home/ComparisonSection"),
  {
    ssr: true,
  }
);

const IntegrationsSection = dynamic(
  () => import("@/components/home/IntegrationsSection"),
  {
    ssr: true,
  }
);

const SecuritySection = dynamic(
  () => import("@/components/home/SecuritySection"),
  {
    ssr: true,
  }
);

const UseCasesSection = dynamic(
  () => import("@/components/home/UseCasesSection"),
  {
    ssr: true,
  }
);

const FAQSection = dynamic(() => import("@/components/home/FAQSection"), {
  ssr: true,
});

const CTASection = dynamic(() => import("@/components/home/CTASection"), {
  ssr: true,
});

import {
  BarChart3,
  Clock,
  Cloud,
  FileText,
  Globe,
  Heart,
  Lock,
  Package,
  Rocket,
  Shield,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const HomePage = () => {
  const heroFeatures = [
    { icon: Zap, text: "Lightning Fast" },
    { icon: Shield, text: "Secure" },
    { icon: TrendingUp, text: "Scalable" },
    { icon: Sparkles, text: "AI-Powered" },
  ];

  const stats = [
    {
      value: "50K+",
      label: "Active Users",
      icon: Users,
      color: "text-blue-500",
    },
    {
      value: "1M+",
      label: "Transactions",
      icon: ShoppingBag,
      color: "text-green-500",
    },
    {
      value: "120+",
      label: "Countries",
      icon: Globe,
      color: "text-purple-500",
    },
    { value: "98%", label: "Satisfaction", icon: Heart, color: "text-red-500" },
  ];

  const mainFeatures = [
    {
      icon: ShoppingBag,
      title: "Complete Retail Management",
      description:
        "Manage inventory, sales, customers, and suppliers all in one place with our comprehensive retail management system.",
      color: "from-blue-500 to-cyan-500",
      gradient: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Get real-time insights into your business performance with powerful analytics and reporting tools.",
      color: "from-purple-500 to-pink-500",
      gradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
    },
    {
      icon: Package,
      title: "Inventory Control",
      description:
        "Track stock levels, manage suppliers, and automate reordering with intelligent inventory management.",
      color: "from-green-500 to-emerald-500",
      gradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
    },
    {
      icon: Users,
      title: "Customer Management",
      description:
        "Build stronger relationships with comprehensive customer profiles and purchase history tracking.",
      color: "from-orange-500 to-red-500",
      gradient: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
    },
    {
      icon: FileText,
      title: "Invoice Generation",
      description:
        "Create professional invoices instantly with customizable templates and automated billing.",
      color: "from-indigo-500 to-blue-500",
      gradient: "bg-gradient-to-br from-indigo-500/10 to-blue-500/10",
    },
    {
      icon: Cloud,
      title: "Cloud-Based Solution",
      description:
        "Access your business data from anywhere, anytime with our secure cloud infrastructure.",
      color: "from-teal-500 to-cyan-500",
      gradient: "bg-gradient-to-br from-teal-500/10 to-cyan-500/10",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description:
        "Automate repetitive tasks and focus on growing your business",
    },
    {
      icon: Target,
      title: "Increase Sales",
      description: "Make data-driven decisions to boost revenue",
    },
    {
      icon: Lock,
      title: "Secure Data",
      description:
        "Enterprise-grade security to protect your business information",
    },
    {
      icon: Rocket,
      title: "Scale Fast",
      description:
        "Grow your business without worrying about system limitations",
    },
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "CEO, TechStart India",
      content:
        "DragBizz transformed our retail operations. We've seen a 40% increase in efficiency since switching.",
      rating: 5,
      avatar: "RK",
    },
    {
      name: "Priya Sharma",
      role: "Store Owner, FashionHub",
      content:
        "The best investment we made. Inventory management is now effortless and sales tracking is a breeze.",
      rating: 5,
      avatar: "PS",
    },
    {
      name: "Amit Patel",
      role: "Operations Manager, QuickMart",
      content:
        "Outstanding platform with excellent support. Our team productivity increased significantly.",
      rating: 5,
      avatar: "AP",
    },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] overflow-x-hidden">
      <ProductHeader />

      <HeroSection heroFeatures={heroFeatures} stats={stats} />

      <FeaturesSection features={mainFeatures} />

      <AdvancedFeaturesSection />

      <ComparisonSection />

      <BenefitsSection benefits={benefits} />

      <IntegrationsSection />

      <SecuritySection />

      <UseCasesSection />

      <TestimonialsSection testimonials={testimonials} />

      <PricingSection />

      <FAQSection />

      <CTASection />

      <Footer />
    </div>
  );
};

export default HomePage;
