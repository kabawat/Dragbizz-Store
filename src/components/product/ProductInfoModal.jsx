"use client";
import React from 'react';
import { 
  Package, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Star, 
  ShoppingCart, 
  X 
} from 'lucide-react';

const ProductInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-[9999]">
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-[rgb(var(--color-border-primary))] shadow-lg">
        <div className="relative mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Why Add Product Details?</h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">Complete information helps in better sales and management</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="absolute cursor-pointer top-0 right-0 w-8 h-8 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center transition-colors border border-[rgb(var(--color-border-primary))]"
          >
            <X className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Sales Benefits */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[rgb(var(--color-success))]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-[rgb(var(--color-success))]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Boost Sales</h4>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Detailed product info helps customers make informed decisions</p>
            </div>
          </div>

          {/* Customer Experience */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Better Customer Experience</h4>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Clear descriptions and specifications improve customer satisfaction</p>
            </div>
          </div>

          {/* Inventory Management */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[rgb(var(--color-warning))]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-4 h-4 text-[rgb(var(--color-warning))]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Inventory Tracking</h4>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Proper categorization helps in stock management and analytics</p>
            </div>
          </div>

          {/* SEO Benefits */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star className="w-4 h-4 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">SEO Optimization</h4>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Rich content helps your products rank better in search results</p>
            </div>
          </div>

          {/* Order Management */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[rgb(var(--color-secondary))]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-4 h-4 text-[rgb(var(--color-secondary))]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Order Processing</h4>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Complete details ensure smooth order fulfillment</p>
            </div>
          </div>

          {/* Business Growth */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[rgb(var(--color-success))]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-[rgb(var(--color-success))]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Business Growth</h4>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Well-documented products help scale your business efficiently</p>
            </div>
          </div>
        </div>

        {/* Section Information */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-4">📋 Form Sections Guide</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                <h5 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">Basic Information</h5>
              </div>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Product name, brand, category, and essential details. This is the foundation of your product listing.</p>
            </div>

            {/* Content & SEO */}
            <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                <h5 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">Content & SEO</h5>
              </div>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Descriptions, features, specifications, and tags. Helps customers understand your product better.</p>
            </div>

            {/* GST Information */}
            <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                <h5 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">GST Information</h5>
              </div>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Tax settings, GST rates, and HSN codes. Required for compliance and accurate billing.</p>
            </div>

            {/* Pricing Information */}
            <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                <h5 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">Pricing Information</h5>
              </div>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Base price, MRP, selling price, and discounts. Set competitive pricing to maximize sales.</p>
            </div>

            {/* Status & Visibility */}
            <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                <h5 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">Status & Visibility</h5>
              </div>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Product status, visibility settings, and availability. Control when and how your product appears.</p>
            </div>

            {/* Additional Details */}
            <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
              <div className="flex items-center space-x-2 mb-2">
                <ShoppingCart className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                <h5 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">Additional Details</h5>
              </div>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Unit of measurement, weight, dimensions, and other specifications. Helps in inventory management.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoModal;
