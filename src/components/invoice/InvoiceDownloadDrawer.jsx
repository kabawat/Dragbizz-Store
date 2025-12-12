"use client"
import React, { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { SideDrawer, Select, Button } from '@/components/ui';
import { useGlobalToast } from '@/contexts/ToastContext';

const InvoiceDownloadDrawer = ({ isOpen, onClose }) => {
  const { showError, showSuccess } = useGlobalToast();
  
  const [selectedDownloadPeriod, setSelectedDownloadPeriod] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Handle download period selection
  const handleDownloadPeriodChange = (value) => {
    setSelectedDownloadPeriod(value);
    
    if (value !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  // Calculate date range for custom dates
  const getCustomDateRangePreview = () => {
    if (!customStartDate || !customEndDate) return null;
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };
    
    return {
      start: formatDate(customStartDate),
      end: formatDate(customEndDate),
      startDate: customStartDate,
      endDate: customEndDate
    };
  };

  // Calculate date range for selected period
  const getDateRangePreview = (period) => {
    if (!period || period === 'custom') return null;
    
    const today = new Date();
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999); // End of today
    
    let startDate = new Date(today);
    
    switch (period) {
      case '1month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '12months':
        startDate.setMonth(today.getMonth() - 12);
        break;
      default:
        return null;
    }
    
    startDate.setHours(0, 0, 0, 0); // Start of day
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };
    
    return {
      start: formatDate(startDate),
      end: formatDate(endDate),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Handle download for predefined periods
  const handlePredefinedDownload = () => {
    if (!selectedDownloadPeriod) {
      showError('Please select a time period');
      return;
    }
    
    const dateRange = getDateRangePreview(selectedDownloadPeriod);
    
    // TODO: Implement download functionality
    console.log('Download invoices for period:', selectedDownloadPeriod, dateRange);
    handleClose();
  };

  // Handle custom range download
  const handleCustomRangeDownload = () => {
    if (!customStartDate || !customEndDate) {
      showError('Please select both start and end dates');
      return;
    }
    
    if (new Date(customEndDate) < new Date(customStartDate)) {
      showError('End date must be after start date');
      return;
    }
    
    const dateRange = getCustomDateRangePreview();
    
    // TODO: Implement download functionality
    console.log('Download invoices for custom range:', dateRange);
    handleClose();
  };

  // Handle close
  const handleClose = () => {
    setSelectedDownloadPeriod('');
    setCustomStartDate('');
    setCustomEndDate('');
    onClose();
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Download Invoices"
      icon={Download}
      description="Select a time period to download invoices"
      width="w-full md:w-[500px] lg:w-[600px]"
    >
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Select Time Period
            </label>
            <Select
              placeholder="Select a time period"
              options={[
                { label: 'Last 1 Month', value: '1month' },
                { label: 'Last 3 Months', value: '3months' },
                { label: 'Last 6 Months', value: '6months' },
                { label: 'Last 12 Months', value: '12months' },
                { label: 'Custom Range', value: 'custom' }
              ]}
              value={selectedDownloadPeriod}
              onChange={handleDownloadPeriodChange}
              clearable={false}
            />
          </div>
          
          {/* Custom Range Date Inputs */}
          {selectedDownloadPeriod === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  End Date
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
          
          {/* Date Range Preview */}
          {selectedDownloadPeriod && (() => {
            let dateRange = null;
            if (selectedDownloadPeriod === 'custom') {
              dateRange = getCustomDateRangePreview();
            } else {
              dateRange = getDateRangePreview(selectedDownloadPeriod);
            }
            
            return dateRange ? (
              <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide">
                    Date Range
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* From Column */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                      From
                    </div>
                    <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                      {dateRange.start}
                    </div>
                  </div>
                  {/* To Column */}
                  <div className="space-y-1 border-l border-[rgb(var(--color-border-primary))] pl-4">
                    <div className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                      To
                    </div>
                    <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                      {dateRange.end}
                    </div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
          
          {/* Download Button */}
          {selectedDownloadPeriod && (
            <div className="pt-2 flex justify-start">
              {selectedDownloadPeriod === 'custom' ? (
                <Button
                  variant="primary"
                  onClick={handleCustomRangeDownload}
                  disabled={!customStartDate || !customEndDate}
                >
                  Download
                </Button>
              ) : (
                <Button variant="primary" onClick={handlePredefinedDownload}>
                  Download
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </SideDrawer>
  );
};

export default InvoiceDownloadDrawer;

