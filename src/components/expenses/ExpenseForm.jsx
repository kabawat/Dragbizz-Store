"use client"
import React, { useState, useEffect } from 'react';
import {
  Input,
  Select,
  Textarea,
  Loading,
  Alert
} from '@/components/ui';
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  EXPENSE_STATUS
} from '@/data/constants/expenses';

const ExpenseForm = ({
  onSubmit = null,
  onCancel = null,
  isLoading = false,
  error = null,
  expense = null,
  formRef = null,
  mode = 'page' // 'page' or 'drawer'
}) => {
  const [formData, setFormData] = useState({
    title: '',
    billNumber: '',
    date: new Date().toISOString().split('T')[0],
    category: 'office-supplies',
    amount: '',
    paymentMethod: 'CASH',
    vendor: '',
    status: 'PAID',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || '',
        billNumber: expense.billNumber || '',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        category: expense.category?.name || expense.category || 'office-supplies',
        amount: expense.amount || '',
        paymentMethod: expense.paymentMethod || 'CASH',
        vendor: expense.vendor?.name || expense.vendor || '',
        status: expense.status || 'PAID',
        description: expense.description || ''
      });
    }
  }, [expense]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      title: formData.title,
      billNumber: formData.billNumber,
      date: formData.date,
      category: formData.category,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      vendor: formData.vendor ? {
        name: formData.vendor
      } : null,
      status: formData.status,
      description: formData.description
    };

    onSubmit(submitData);
  };

  return (
    <div className={mode === 'drawer' ? '' : 'bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6'}>
      {error && (
        <Alert className="mb-6" variant="error">
          {error}
        </Alert>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Title *
            </label>
            <Input
              size="sm"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="Enter expense title"
              error={errors.title}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Bill Number
            </label>
            <Input
              size="sm"
              value={formData.billNumber}
              onChange={(value) => handleInputChange('billNumber', value)}
              placeholder="Enter bill number"
            />
          </div>
        </div>

        {/* Date and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Date *
            </label>
            <Input
              size="sm"
              type="date"
              value={formData.date}
              onChange={(value) => handleInputChange('date', value)}
              error={errors.date}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Category *
            </label>
            <Select
              size="sm"
              value={formData.category}
              onChange={(value) => handleInputChange('category', value)}
              options={EXPENSE_CATEGORIES.map(cat => ({
                value: cat.value,
                label: cat.label
              }))}
              error={errors.category}
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
            Amount *
          </label>
          <Input
            size="sm"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(value) => handleInputChange('amount', value)}
            placeholder="0.00"
            error={errors.amount}
          />
        </div>

        {/* Payment Method and Vendor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Payment Method *
            </label>
            <Select
              size="sm"
              value={formData.paymentMethod}
              onChange={(value) => handleInputChange('paymentMethod', value)}
              options={PAYMENT_METHODS.map(method => ({
                value: method.value,
                label: `${method.icon} ${method.label}`
              }))}
              error={errors.paymentMethod}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Vendor
            </label>
            <Input
              size="sm"
              value={formData.vendor}
              onChange={(value) => handleInputChange('vendor', value)}
              placeholder="Enter vendor name"
            />
          </div>
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Status
            </label>
            <Select
              size="sm"
              value={formData.status}
              onChange={(value) => handleInputChange('status', value)}
              options={EXPENSE_STATUS.map(status => ({
                value: status.value,
                label: status.label
              }))}
            />
          </div>
        </div>


        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
            placeholder="Enter expense description"
            rows={3}
          />
        </div>

      </form>
    </div>
  );
};

export default ExpenseForm;
