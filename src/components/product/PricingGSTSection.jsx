"use client"
import React from 'react';
import { Select, Toggle, Input } from '../ui';
import { Package, Calculator, Hash, IndianRupee } from 'lucide-react';
import { CURRENCY_OPTIONS, UOM_OPTIONS, GST_RATE_OPTIONS } from '@/data';
import { useTranslation } from '@/hooks/useTranslation';

const PricingGSTSection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const { t } = useTranslation();
  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  // GST Type options
  const gstTypeOptions = (t) => [
    { value: 'CGST_SGST', label: t('products.cgstSgst'), description: t('products.cgstSgstDescription') },
    { value: 'IGST', label: t('products.igst'), description: t('products.igstDescription') },
    { value: 'UTGST', label: t('products.utgst'), description: t('products.utgstDescription') }
  ];

  // Calculate GST amount based on include/exclude option
  const calculateGSTAmount = () => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const gstRate = parseFloat(formData.gstInfo?.gstRate) || 0;
    const isGstIncluded = formData.gstInfo?.isGstIncluded || false;
    
    if (isGstIncluded) {
      // If GST is included, calculate GST from the selling price
      // GST = (Selling Price * GST Rate) / (100 + GST Rate)
      return (sellingPrice * gstRate) / (100 + gstRate);
    } else {
      // If GST is excluded, calculate GST on top of selling price
      // GST = (Selling Price * GST Rate) / 100
      return (sellingPrice * gstRate) / 100;
    }
  };

  // Calculate base price (price without GST)
  const calculateBasePrice = () => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const gstAmount = calculateGSTAmount();
    const isGstIncluded = formData.gstInfo?.isGstIncluded || false;
    
    if (isGstIncluded) {
      // If GST is included, base price = selling price - GST
      return sellingPrice - gstAmount;
    } else {
      // If GST is excluded, base price = selling price
      return sellingPrice;
    }
  };

  // Calculate total price (selling price + GST if excluded)
  const calculateTotalPrice = () => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const gstAmount = calculateGSTAmount();
    const isGstIncluded = formData.gstInfo?.isGstIncluded || false;
    
    if (isGstIncluded) {
      // If GST is included, total = selling price
      return sellingPrice;
    } else {
      // If GST is excluded, total = selling price + GST
      return sellingPrice + gstAmount;
    }
  };

  const gstAmount = calculateGSTAmount();
  const basePrice = calculateBasePrice();
  const totalPrice = calculateTotalPrice();

  return (
    <>
      {/* Pricing Information */}
      <div className="mb-8">
        
        {/* Price Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* MRP */}
          <div>
            <Input
              type="number"
              label={t('products.mrp')}
              placeholder={t('products.enterAmount')}
              value={formData.mrp || ''}
              onChange={(value) => handleFieldChange('mrp', value)}
              error={errors.mrp}
              errorMessage={errors.mrp}
              required
              leftIcon={() => <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-md">₹</span>}
              min={0}
              step={0.01}
              precision={2}
              helperText={t('products.mrpHelperText')}
              className="transition-all duration-200 group-hover:shadow-sm"
            />
          </div>

          {/* Selling Price */}
          <div>
            <Input
              type="number"
              label={t('products.sellingPrice')}
              placeholder={t('products.enterAmount')}
              value={formData.sellingPrice || ''}
              onChange={(value) => handleFieldChange('sellingPrice', value)}
              error={errors.sellingPrice}
              errorMessage={errors.sellingPrice}
              required
              leftIcon={() => <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-md">₹</span>}
              min={0}
              step={0.01}
              precision={2}
              helperText={t('products.sellingPriceHelperText')}
              className="transition-all duration-200 group-hover:shadow-sm"
            />
          </div>
        </div>

        {/* Currency and UOM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t('products.currency')}
            options={CURRENCY_OPTIONS}
            value={formData.currency || 'INR'}
            onChange={(value) => handleFieldChange('currency', value)}
            error={errors.currency}
            errorMessage={errors.currency}
            required
            searchable
            placeholder={t('products.selectCurrency')}
          />
          <Select
            label={t('products.unitOfMeasure')}
            options={UOM_OPTIONS}
            value={formData.uom || 'PCS'}
            onChange={(value) => handleFieldChange('uom', value)}
            error={errors.uom}
            errorMessage={errors.uom}
            required
            leftIcon={Package}
            searchable
            placeholder={t('products.selectUnitOfMeasure')}
          />
        </div>

        {/* Price Summary */}
        <div className="mt-6 p-6 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
              <span className="text-[rgb(var(--color-primary))] font-bold text-xl mr-2">₹</span>
              {t('products.priceSummary')}
            </h4>
            <div className="text-xs text-[rgb(var(--color-text-tertiary))] bg-[rgb(var(--color-bg-primary))] px-2 py-1 rounded-full">
              {t('products.livePreview')}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column - Prices */}
            <div className="space-y-3">
              {formData.mrp ? (
                <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">{t('products.mrp')}:</span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    ₹{parseFloat(formData.mrp).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] opacity-50">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">{t('products.mrp')}:</span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">₹0.00</span>
                </div>
              )}
              
              {formData.sellingPrice ? (
                <div className="flex justify-between items-center p-3 rounded-lg border border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]">
                  <span className="text-sm font-medium text-white">{t('products.sellingPrice')}:</span>
                  <span className="text-sm font-bold text-white">
                    ₹{parseFloat(formData.sellingPrice).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] opacity-50">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">{t('products.sellingPrice')}:</span>
                  <span className="text-sm font-bold text-[rgb(var(--color-text-tertiary))]">₹0.00</span>
                </div>
              )}
            </div>
            
            {/* Right Column - Savings */}
            <div className="space-y-3">
              {formData.mrp && formData.sellingPrice && parseFloat(formData.mrp) > parseFloat(formData.sellingPrice) ? (
                <div className="flex justify-between items-center p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('products.youSave')}:</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    ₹{(parseFloat(formData.mrp) - parseFloat(formData.sellingPrice)).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] opacity-50">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">{t('products.youSave')}:</span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">₹0.00</span>
                </div>
              )}
              
              {formData.mrp && formData.sellingPrice && parseFloat(formData.mrp) > parseFloat(formData.sellingPrice) ? (
                <div className="flex justify-between items-center p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">{t('products.discount')}:</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {Math.round(((parseFloat(formData.mrp) - parseFloat(formData.sellingPrice)) / parseFloat(formData.mrp)) * 100)}%
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] opacity-50">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">{t('products.discount')}:</span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">0%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GST Information */}
      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
          {t('products.gstInformation')}
        </h3>

        {/* GST Applicable Toggle */}
        <div className="mb-6">
          <Toggle
            label={t('products.gstApplicable')}
            checked={formData.gstInfo?.isGstApplicable || false}
            onChange={(checked) => handleFieldChange('gstInfo.isGstApplicable', checked)}
            helperText={t('products.gstApplicableHelperText')}
          />
        </div>

        {/* GST Fields - Only show if GST is applicable */}
        {formData.gstInfo?.isGstApplicable && (
          <>
            {/* GST Rate and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* GST Rate */}
              <div>
                <Select
                  label={t('products.gstRate')}
                  options={GST_RATE_OPTIONS}
                  value={formData.gstInfo?.gstRate || ''}
                  onChange={(value) => handleFieldChange('gstInfo.gstRate', value)}
                  error={errors.gstRate}
                  errorMessage={errors.gstRate}
                  required
                  leftIcon={Calculator}
                  searchable
                  placeholder={t('products.selectGstRate')}
                />
              </div>

              {/* GST Type */}
              <div>
                <Select
                  label={t('products.gstType')}
                  options={gstTypeOptions(t)}
                  value={formData.gstInfo?.gstType || 'CGST_SGST'}
                  onChange={(value) => handleFieldChange('gstInfo.gstType', value)}
                  error={errors.gstType}
                  errorMessage={errors.gstType}
                  required
                  searchable
                  placeholder={t('products.selectGstType')}
                  helperText={t('products.gstTypeHelperText')}
                />
              </div>
            </div>

            {/* HSN Code */}
            <div className="mb-6">
              <Input
                label={t('products.hsnCode')}
                placeholder={t('products.enterHsnCode')}
                value={formData.gstInfo?.hsnCode || ''}
                onChange={(value) => handleFieldChange('gstInfo.hsnCode', value)}
                error={errors.hsnCode}
                errorMessage={errors.hsnCode}
                leftIcon={Hash}
                maxLength={8}
                helperText={t('products.hsnCodeHelperText')}
              />
            </div>

            {/* GST Include/Exclude Option */}
            <div className="mb-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                  {t('products.gstPricingMethod')}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gstIncluded"
                      value="excluded"
                      checked={!formData.gstInfo?.isGstIncluded}
                      onChange={() => handleFieldChange('gstInfo.isGstIncluded', false)}
                      className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-[rgb(var(--color-text-primary))]">
                      <span className="font-medium">{t('products.gstExcluded')}</span>
                      <span className="text-[rgb(var(--color-text-secondary))] ml-1">- {t('products.gstExcludedDescription')}</span>
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gstIncluded"
                      value="included"
                      checked={formData.gstInfo?.isGstIncluded}
                      onChange={() => handleFieldChange('gstInfo.isGstIncluded', true)}
                      className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-[rgb(var(--color-text-primary))]">
                      <span className="font-medium">{t('products.gstIncluded')}</span>
                      <span className="text-[rgb(var(--color-text-secondary))] ml-1">- {t('products.gstIncludedDescription')}</span>
                    </span>
                  </label>
                </div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-2">
                  {t('products.gstPricingMethodHelperText')}
                </p>
              </div>
            </div>

            {/* GST Summary */}
            {formData.gstInfo?.gstRate && formData.sellingPrice && (
              <div className="p-6 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm">
                <h4 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
                  {t('products.gstSummary')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                      <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                        {formData.gstInfo?.isGstIncluded ? t('products.sellingPriceGstIncluded') : t('products.basePrice')}
                      </span>
                      <span className="font-medium text-[rgb(var(--color-text-primary))]">
                        ₹{formData.gstInfo?.isGstIncluded ? parseFloat(formData.sellingPrice).toFixed(2) : basePrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                      <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">{t('products.gstRate')}:</span>
                      <span className="font-medium text-[rgb(var(--color-text-primary))]">
                        {parseFloat(formData.gstInfo?.gstRate).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                      <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">{t('products.gstType')}:</span>
                      <span className="font-medium text-[rgb(var(--color-text-primary))]">
                        {gstTypeOptions(t).find(type => type.value === formData.gstInfo?.gstType)?.label || formData.gstInfo?.gstType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                      <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">{t('products.gstStatus')}:</span>
                      <span className="font-medium text-[rgb(var(--color-text-primary))]">
                        {formData.gstInfo?.isGstIncluded ? t('products.included') : t('products.excluded')}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {formData.gstInfo?.hsnCode && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                        <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">{t('products.hsnCode')}:</span>
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">
                          {formData.gstInfo.hsnCode}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 rounded-lg border border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]">
                      <span className="text-sm font-medium text-white">{t('products.gstAmount')}:</span>
                      <span className="font-bold text-white">
                        ₹{gstAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300 font-bold">{t('products.totalPrice')}:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default PricingGSTSection;
