"use client"
import React, { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { SideDrawer, Select, Button, Input } from '@/components/ui';
import { useGlobalToast } from '@/contexts/ToastContext';
import { supplierService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from '@/hooks/useTranslation';

const SupplierDownloadDrawer = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const [isDownloading, setIsDownloading] = useState(false);

  const [selectedDownloadPeriod, setSelectedDownloadPeriod] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('xlsx'); // 'xlsx' or 'csv'

  const handleDownloadPeriodChange = (value) => {
    setSelectedDownloadPeriod(value);
    if (value !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

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

  const getDateRangePreview = (period) => {
    if (!period || period === 'custom') return null;
    const today = new Date();
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);
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
    startDate.setHours(0, 0, 0, 0);
    const formatDate = (date) =>
      date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    return {
      start: formatDate(startDate),
      end: formatDate(endDate),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const downloadFile = async (rows) => {
    const isCSV = downloadFormat === 'csv';
    const headers = [t('suppliers.name'), t('suppliers.phone'), t('suppliers.email'), t('suppliers.gst'), t('suppliers.agency'), t('suppliers.status'), t('suppliers.createdAt')];
    const mapRow = (row) => [
      row.name || '',
      row.phone || '',
      row.email || '',
      row.gstNumber || '',
      row.agency || '',
      row.isActive ? t('common.active') : t('common.inactive'),
      row.createdAt ? new Date(row.createdAt).toISOString() : ''
    ];
    if (isCSV) {
      const lines = [headers.join(',')].concat(rows.map((r) => mapRow(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')));
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'suppliers.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    // simple xlsx via TSV for compatibility
    const tsvLines = [headers.join('\t')].concat(rows.map((r) => mapRow(r).join('\t')));
    const blob = new Blob([tsvLines.join('\n')], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'suppliers.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async ({ startDate, endDate }) => {
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    if (!storeId) {
      showError(t('suppliers.storeIdMissing'));
      return;
    }

    setIsDownloading(true);
    try {
      const params = {
        store: storeId,
        startDate,
        endDate,
        limit: 10000,
        isFreshLoad: true
      };
      const result = await supplierService.getSuppliers(params);
      if (result.success && result.data) {
        const suppliersData = result.data?.data || result.data || [];
        if (!suppliersData.length) {
          showError(t('suppliers.noSuppliersFoundToDownload'));
          return;
        }
        await downloadFile(suppliersData);
        showSuccess(t('suppliers.downloadedSuccessfully'));
      } else {
        showError(result.message || t('suppliers.failedToDownload'));
      }
    } catch (error) {
      console.error('Download suppliers error:', error);
      showError(t('suppliers.errorDownloadingSuppliers'));
    } finally {
      setIsDownloading(false);
      onClose?.();
    }
  };

  const handlePredefinedDownload = async () => {
    if (!selectedDownloadPeriod) {
      showError(t('suppliers.pleaseSelectTimePeriod'));
      return;
    }
    const range = getDateRangePreview(selectedDownloadPeriod);
    if (!range) {
      showError(t('suppliers.invalidDateRange'));
      return;
    }
    await handleDownload(range);
  };

  const handleCustomRangeDownload = async () => {
    if (!customStartDate || !customEndDate) {
      showError(t('suppliers.pleaseSelectBothDates'));
      return;
    }
    if (new Date(customEndDate) < new Date(customStartDate)) {
      showError(t('suppliers.endDateMustBeAfterStart'));
      return;
    }
    const range = getCustomDateRangePreview();
    if (!range) {
      showError(t('suppliers.invalidDateRange'));
      return;
    }
    await handleDownload(range);
  };

  const handleClose = () => {
    onClose?.();
    setSelectedDownloadPeriod('');
    setCustomStartDate('');
    setCustomEndDate('');
    setDownloadFormat('xlsx');
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={t('suppliers.downloadSuppliers')}
      icon={Download}
      description={t('suppliers.selectTimePeriodToDownload')}
      width="w-full md:w-[500px] lg:w-[600px]"
    >
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t('suppliers.selectTimePeriod')}
            </label>
            <Select
              placeholder={t('suppliers.selectATimePeriod')}
              options={[
                { label: t('suppliers.last1Month'), value: '1month' },
                { label: t('suppliers.last3Months'), value: '3months' },
                { label: t('suppliers.last6Months'), value: '6months' },
                { label: t('suppliers.last12Months'), value: '12months' },
                { label: t('suppliers.customRange'), value: 'custom' }
              ]}
              value={selectedDownloadPeriod}
              onChange={handleDownloadPeriodChange}
              clearable={false}
            />
          </div>

          {selectedDownloadPeriod && (
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {t('suppliers.downloadFormat')}
              </label>
              <Select
                placeholder={t('suppliers.selectFormat')}
                options={[
                  { label: t('suppliers.excelXlsx'), value: 'xlsx' },
                  { label: t('suppliers.csv'), value: 'csv' }
                ]}
                value={downloadFormat}
                onChange={setDownloadFormat}
                clearable={false}
              />
            </div>
          )}

          {selectedDownloadPeriod === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  {t('suppliers.startDate')}
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
                  {t('suppliers.endDate')}
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
                    {t('suppliers.dateRange')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                      {t('suppliers.from')}
                    </div>
                    <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                      {dateRange.start}
                    </div>
                  </div>
                  <div className="space-y-1 border-l border-[rgb(var(--color-border-primary))] pl-4">
                    <div className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                      {t('suppliers.to')}
                    </div>
                    <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                      {dateRange.end}
                    </div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {selectedDownloadPeriod && (
            <div className="pt-2 flex justify-start">
              {selectedDownloadPeriod === 'custom' ? (
                <Button
                  variant="primary"
                  onClick={handleCustomRangeDownload}
                  disabled={!customStartDate || !customEndDate || isDownloading}
                  loading={isDownloading}
                >
                  {isDownloading ? t('suppliers.downloading') : t('suppliers.download')}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handlePredefinedDownload}
                  disabled={isDownloading}
                  loading={isDownloading}
                >
                  {isDownloading ? t('suppliers.downloading') : t('suppliers.download')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </SideDrawer>
  );
};

export default SupplierDownloadDrawer;

