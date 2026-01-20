"use client";
import React from 'react';
import { Mail, Phone, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';

const ContactInput = ({
  contact,
  contactType,
  validationStatus,
  isValidating,
  errors,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      {contact && (
        <div className="mb-2">
          <div className="flex items-center justify-start">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${contactType === 'email'
              ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white'
              : 'bg-green-600 text-white dark:bg-green-600 dark:text-white'
              }`}>
              {contactType === 'email' ? (
                <>
                  <Mail className="w-3 h-3 mr-1" />
                  {t('auth.email')}
                </>
              ) : (
                <>
                  <Phone className="w-3 h-3 mr-1" />
                  {t('auth.phone')}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Input
        label={t('auth.enterEmailOrPhone')}
        type={contactType === 'email' ? 'email' : 'tel'}
        placeholder={contactType === 'email' ? t('auth.emailPlaceholder') : t('auth.phonePlaceholder')}
        value={contact}
        onChange={onChange}
        leftIcon={contactType === 'email' ? Mail : Phone}
        error={errors.contact}
        rightElement={
          <div>
            {isValidating && (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            {validationStatus === 'valid' && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {validationStatus === 'invalid' && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        }
        className={
          validationStatus === 'valid' ? 'border-green-500 bg-green-50' :
            validationStatus === 'invalid' ? 'border-red-500 bg-red-50' :
              ''
        }
      />

      {contactType === 'phone' && contact && contact.length >= 10 && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-700 dark:text-blue-300 text-xs flex items-center">
            <MessageSquare className="w-3 h-3 mr-1" />
            {t('auth.phoneDetected')}
          </p>
        </div>
      )}

      <div className="mt-2">
        {validationStatus === 'valid' && (
          <p className="text-green-600 dark:text-green-400 text-sm flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            {t('auth.accountFound')}
          </p>
        )}
        {validationStatus === 'invalid' && (
          <p className="text-red-500 dark:text-red-400 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {t('auth.noAccountFound', { type: contactType })}
          </p>
        )}
        {errors.contact && (
          <p className="text-red-500 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.contact}
          </p>
        )}
      </div>
    </div>
  );
};

export default ContactInput;

