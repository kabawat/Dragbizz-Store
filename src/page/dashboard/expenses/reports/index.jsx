"use client"
import React from 'react';
import { ArrowLeft, Download, TrendingUp, BarChart3, PieChart, IndianRupee, Calendar } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground, Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import Link from 'next/link';

const ExpenseReportsPage = () => {
  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Expense Reports"
          description="Analytics and insights for your business expenses"
        />

        {/* Main Content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/expenses">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Expenses
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Monthly Expense Trend</span>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="h-64 flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Chart will be implemented soon</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Category Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="h-64 flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Pie chart will be implemented soon</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Payment Method Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IndianRupee className="h-5 w-5" />
                    <span>Payment Method Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="h-64 flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Payment analysis will be implemented soon</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Vendor Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Top Vendors</span>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="h-64 flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Vendor analysis will be implemented soon</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Coming Soon Notice */}
            <Card className="mt-6">
              <CardBody className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-[rgb(var(--color-primary))] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                  Advanced Analytics Coming Soon
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] max-w-2xl mx-auto">
                  We're working on comprehensive expense analytics including detailed charts, 
                  trend analysis, budget tracking, and exportable reports. Stay tuned!
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReportsPage;
