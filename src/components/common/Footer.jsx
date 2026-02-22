"use client";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const footerLinks = {
    product: [
      { name: "Features", href: "/products" },
      { name: "Pricing", href: "/products#pricing" },
      { name: "Updates", href: "/products#features" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Documentation", href: "/docs" },
      { name: "Get Support", href: "/contact" },
    ],
  };

  return (
    <footer className="bg-[rgb(var(--color-bg-secondary))] border-t border-[rgb(var(--color-border-primary))] py-10 sm:py-12 md:py-16">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10 md:mb-12">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[rgb(var(--color-primary))] to-purple-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold">DragBizz</span>
            </div>
            <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))] mb-4">
              The complete retail management solution for modern businesses.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">
              Product
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-[rgb(var(--color-primary))] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">
              Company
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-[rgb(var(--color-primary))] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">
              Support
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-[rgb(var(--color-primary))] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-center text-xs sm:text-sm text-[rgb(var(--color-text-tertiary))] pt-6 sm:pt-8 border-t border-[rgb(var(--color-border-primary))]">
          <p>&copy; 2025 DragBizz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
