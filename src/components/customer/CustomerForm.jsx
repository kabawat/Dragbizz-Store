"use client"
import React from 'react';
import { User, Phone, Mail, MapPin } from 'lucide-react';
import { Input } from '@/components/ui';

const CustomerForm = ({ formData, onChange, fieldErrors = {} }) => {
  const handleInputChange = (fieldName, value) => {
    onChange(fieldName, value);
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Side - Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Information Section */}
        <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">Customer Information</h2>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">Enter the basic details of the customer</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <Input
              type="text"
              label="Customer Name"
              placeholder="Enter customer name"
              value={formData.name || ''}
              onChange={(value) => handleInputChange('name', value)}
              error={!!fieldErrors.name}
              errorMessage={fieldErrors.name}
              helperText="Enter the full name of the customer"
              required
              leftIcon={User}
            />

            {/* Phone Number */}
            <Input
              type="tel"
              label="Phone Number"
              placeholder="Enter phone number"
              value={formData.phone || ''}
              onChange={(value) => handleInputChange('phone', value)}
              error={!!fieldErrors.phone}
              errorMessage={fieldErrors.phone}
              helperText="Enter the customer's phone number"
              required
              leftIcon={Phone}
            />

            {/* Email Address */}
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter email address"
              value={formData.email || ''}
              onChange={(value) => handleInputChange('email', value)}
              error={!!fieldErrors.email}
              errorMessage={fieldErrors.email}
              helperText="Enter the customer's email address (optional)"
              leftIcon={Mail}
            />

            {/* Address */}
            <Input
              type="text"
              label="Address"
              placeholder="Enter address"
              value={formData.address || ''}
              onChange={(value) => handleInputChange('address', value)}
              error={!!fieldErrors.address}
              errorMessage={fieldErrors.address}
              helperText="Enter the customer's address (optional)"
              leftIcon={MapPin}
            />
          </div>
        </div>

        {/* Form Summary */}
        <div className="bg-[rgb(var(--color-bg-primary))]/10 backdrop-blur-sm rounded-lg border border-[rgb(var(--color-border-primary))]/30 p-4">
          <h3 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">Form Summary</h3>
          <div className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
            <div>Name: {formData.name || 'Not provided'}</div>
            <div>Phone: {formData.phone || 'Not provided'}</div>
            <div>Email: {formData.email || 'Not provided'}</div>
            <div>Address: {formData.address || 'Not provided'}</div>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits Section */}
      <div className="lg:col-span-1">
        <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 shadow-lg sticky top-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Why Add Customer Details?</h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">Complete information helps in better service</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Marketing Benefits */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm">📧</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Marketing & Communication</h4>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">Send targeted promotions, newsletters, and product updates to increase sales</p>
              </div>
            </div>

            {/* Notification Benefits */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm">🔔</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Smart Notifications</h4>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">Get notified about order updates, payment reminders, and important announcements</p>
              </div>
            </div>

            {/* Fraud Prevention */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-sm">🛡️</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Fraud Prevention</h4>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">Verify customer identity and prevent fraudulent transactions</p>
              </div>
            </div>

            {/* Customer Service */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-sm">🎯</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Better Service</h4>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">Provide personalized service and faster order processing</p>
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 text-sm">📊</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Customer Analytics</h4>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">Track customer behavior and preferences for better business decisions</p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">💡 Pro Tips</h4>
            <ul className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
              <li>• Always verify phone numbers for SMS notifications</li>
              <li>• Email helps in sending receipts and updates</li>
              <li>• Address is useful for delivery and billing</li>
              <li>• Complete details improve customer trust</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
