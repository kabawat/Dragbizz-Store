"use client";
import React from 'react';
import { Select } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';

const DateRangeSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  customStartDate, 
  setCustomStartDate, 
  customEndDate, 
  setCustomEndDate 
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
          {t('customers.selectTimePeriod')}
        </label>
        <Select
          placeholder={t('customers.selectATimePeriod')}
          options={[
            { label: t('customers.last1Month'), value: '1month' },
            { label: t('customers.last3Months'), value: '3months' },
            { label: t('customers.last6Months'), value: '6months' },
            { label: t('customers.last12Months'), value: '12months' },
            { label: t('customers.customRange'), value: 'custom' }
          ]}
          value={selectedPeriod}
          onChange={onPeriodChange}
          clearable={false}
        />
      </div>

      {selectedPeriod === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t('customers.startDate')}
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t('customers.endDate')}
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              min={customStartDate}
              className="w-full px-4 py-2.5 text-sm text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DateRangeSelector;

