"use client"
import React from 'react';
import { Button, Card, Badge } from '@/components/ui';
import { Building2, Store, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">🏪</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 gradient-text">
              Welcome to DragBizz Store!
            </h1>
            <p className="text-xl text-[rgb(var(--color-text-secondary))] mb-6">
              Your retail management system is ready to go
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="primary" className="text-lg px-4 py-2">
                Agency Created ✓
              </Badge>
              <Badge variant="primary" className="text-lg px-4 py-2">
                Store Created ✓
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Agency Management</h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                  Manage your agency settings and multiple stores
                </p>
                <Button variant="outline" className="w-full">
                  Manage Agency
                </Button>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-[rgb(var(--color-secondary))] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Store className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Store Management</h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                  Manage inventory, customers, and operations
                </p>
                <Button variant="outline" className="w-full">
                  Manage Store
                </Button>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                  View sales reports and business insights
                </p>
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </div>
            </Card>
          </div>

          {/* Onboarding Complete */}
          <Card className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">🎉 Onboarding Complete!</h2>
              <p className="text-lg text-[rgb(var(--color-text-secondary))]">
                You've successfully set up your agency and store
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">What's Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--color-bg-secondary))]">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Set up your inventory</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--color-bg-secondary))]">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Add your first products</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--color-bg-secondary))]">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Configure payment methods</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--color-bg-secondary))]">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Start selling!</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Quick Start Guide</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-[rgb(var(--color-text-secondary))]">Add your products to the inventory</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-[rgb(var(--color-text-secondary))]">Set up customer management</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-[rgb(var(--color-text-secondary))]">Configure your store settings</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
            <p className="text-lg text-[rgb(var(--color-text-secondary))] mb-8">
              Your store is ready! Start adding products and managing your business.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                Start Managing Store
              </Button>
              <Button variant="outline" size="lg">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
