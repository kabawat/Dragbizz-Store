"use client"
import React from 'react';
import { ArrowLeft, Download, TrendingUp, BarChart3, PieChart, IndianRupee, Calendar } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { Button, Card, CardHeader, CardTitle, CardBody } from '@/components/ui';

const ExpenseReportsPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title={t('expenses.reports.title')}
          description={t('expenses.reports.description')}
        />

        {/* Main Content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/expenses">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('expenses.reports.backToExpenses')}
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>{t('expenses.reports.monthlyExpenseTrend')}</span>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="h-64 flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('expenses.reports.chartWillBeImplementedSoon')}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>{t('expenses.reports.categoryBreakdown')}</span>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="h-64 flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('expenses.reports.pieChartWillBeImplementedSoon')}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Payment Method Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IndianRupee className="h-5 w-5" />
                    <span>{t('expenses.reports.paymentMethodAnalysis')}</span>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="h-64 flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('expenses.reports.paymentAnalysisWillBeImplementedSoon')}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Vendor Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>{t('expenses.reports.topVendors')}</span>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="h-64 flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('expenses.reports.vendorAnalysisWillBeImplementedSoon')}</p>
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
                  {t('expenses.reports.advancedAnalyticsComingSoon')}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] max-w-2xl mx-auto">
                  {t('expenses.reports.advancedAnalyticsDescription')}
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
