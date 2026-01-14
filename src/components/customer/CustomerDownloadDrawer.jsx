"use client"
import React, { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { SideDrawer, Select, Button } from '@/components/ui';
import { useGlobalToast } from '@/contexts/ToastContext';
import { customerService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from '@/hooks/useTranslation';

const CustomerDownloadDrawer = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [selectedDownloadPeriod, setSelectedDownloadPeriod] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('xlsx'); // 'xlsx' or 'csv'

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
  const handlePredefinedDownload = async () => {
    if (!selectedDownloadPeriod) {
      showError(t('customers.pleaseSelectTimePeriod'));
      return;
    }
    
    const dateRange = getDateRangePreview(selectedDownloadPeriod);
    if (!dateRange) {
      showError(t('customers.invalidDateRange'));
      return;
    }
    
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    if (!storeId) {
      showError(t('suppliers.storeIdMissing'));
      return;
    }
    
    setIsDownloading(true);
    try {
      const params = {
        store: storeId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: 10000
      };
      
      const result = await customerService.getCustomers(params);
      
      // Console log the response data
      console.log('Download customers API response:', result);
      console.log('Customers data:', result.data);
      
      if (result.success && result.data) {
        const customersData = result.data?.data || result.data || [];
        
        if (customersData.length === 0) {
          showError(t('customers.noCustomersFoundToDownload'));
          setIsDownloading(false);
          return;
        }
        
        // Download file
        await downloadCustomersFile(customersData);
        showSuccess(t('customers.customersDownloadedSuccessfully'));
      } else {
        showError(result.message || t('customers.failedToDownloadCustomers'));
      }
    } catch (error) {
      console.error('Download customers error:', error);
      showError(t('customers.errorDownloadingCustomers'));
    } finally {
      setIsDownloading(false);
      handleClose();
    }
  };

  // Handle custom range download
  const handleCustomRangeDownload = async () => {
    if (!customStartDate || !customEndDate) {
      showError(t('customers.pleaseSelectBothDates'));
      return;
    }
    
    if (new Date(customEndDate) < new Date(customStartDate)) {
      showError(t('customers.endDateMustBeAfterStart'));
      return;
    }
    
    const dateRange = getCustomDateRangePreview();
    if (!dateRange) {
      showError(t('customers.invalidDateRange'));
      return;
    }
    
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    if (!storeId) {
      showError(t('suppliers.storeIdMissing'));
      return;
    }
    
    setIsDownloading(true);
    try {
      const params = {
        store: storeId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: 10000
      };
      
      const result = await customerService.getCustomers(params);
      
      // Console log the response data
      console.log('Download customers API response:', result);
      console.log('Customers data:', result.data);
      
      if (result.success && result.data) {
        const customersData = result.data?.data || result.data || [];
        
        if (customersData.length === 0) {
          showError(t('customers.noCustomersFoundToDownload'));
          setIsDownloading(false);
          return;
        }
        
        // Download file
        await downloadCustomersFile(customersData);
        showSuccess(t('customers.customersDownloadedSuccessfully'));
      } else {
        showError(result.message || t('customers.failedToDownloadCustomers'));
      }
    } catch (error) {
      console.error('Download customers error:', error);
      showError(t('customers.errorDownloadingCustomers'));
    } finally {
      setIsDownloading(false);
      handleClose();
    }
  };

  // Transform customer data for export
  const transformCustomerData = (customers) => {
    if (!customers || !Array.isArray(customers)) return [];
    
    const storeName = selectedStore?.storeName || selectedStore?.name || 'N/A';
    
    return customers.map((customer) => {
      return {
        'Store Name': storeName,
        'Customer Name': customer.name || t('common.na'),
        'Phone': customer.phone || t('common.na'),
        'Email': customer.email || t('common.na'),
        'Address': customer.address || t('common.na'),
        'Created At': customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN') : t('common.na'),
        'Updated At': customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString('en-IN') : t('common.na')
      };
    });
  };

  // Export to CSV
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      showError(t('customers.noDataToExport'));
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to XLSX
  const exportToXLSX = async (data, filename) => {
    try {
      // Dynamically import xlsx library
      const XLSX = await import('xlsx');
      
      if (!data || data.length === 0) {
        showError(t('customers.noDataToExport'));
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, t('customers.customers'));
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const finalFilename = `${filename}_${timestamp}.xlsx`;
      
      XLSX.writeFile(workbook, finalFilename);
    } catch (error) {
      console.error('XLSX export error:', error);
      showError(t('customers.failedToExportAsXlsx'));
      // Fallback to CSV
      exportToCSV(data, filename.replace('.xlsx', '.csv'));
    }
  };

  // Handle file download
  const downloadCustomersFile = async (customers) => {
    if (!customers || customers.length === 0) {
      showError(t('customers.noCustomersToDownload'));
      return;
    }

    const transformedData = transformCustomerData(customers);
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (downloadFormat === 'xlsx') {
      await exportToXLSX(transformedData, `customers_${timestamp}`);
    } else {
      exportToCSV(transformedData, `customers_${timestamp}.csv`);
    }
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
      title={t('customers.downloadCustomers')}
      icon={Download}
      description={t('customers.selectTimePeriodToDownloadCustomers')}
      width="w-full md:w-[500px] lg:w-[600px]"
    >
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
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
              value={selectedDownloadPeriod}
              onChange={handleDownloadPeriodChange}
              clearable={false}
            />
          </div>

          {/* Download Format Selection */}
          {selectedDownloadPeriod && (
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {t('customers.downloadFormat')}
              </label>
              <Select
                placeholder={t('customers.selectFormat')}
                options={[
                  { label: t('customers.excelXlsx'), value: 'xlsx' },
                  { label: t('customers.csv'), value: 'csv' }
                ]}
                value={downloadFormat}
                onChange={setDownloadFormat}
                clearable={false}
              />
            </div>
          )}
          
          {/* Custom Range Date Inputs */}
          {selectedDownloadPeriod === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
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

              {/* End Date */}
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
                    {t('customers.dateRange')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* From Column */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                      {t('customers.from')}
                    </div>
                    <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                      {dateRange.start}
                    </div>
                  </div>
                  {/* To Column */}
                  <div className="space-y-1 border-l border-[rgb(var(--color-border-primary))] pl-4">
                    <div className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                      {t('customers.to')}
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
                  disabled={!customStartDate || !customEndDate || isDownloading}
                  loading={isDownloading}
                >
                  {isDownloading ? t('customers.downloading') : t('customers.downloadButton')}
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  onClick={handlePredefinedDownload}
                  disabled={isDownloading}
                  loading={isDownloading}
                >
                  {isDownloading ? t('customers.downloading') : t('customers.downloadButton')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </SideDrawer>
  );
};

export default CustomerDownloadDrawer;
