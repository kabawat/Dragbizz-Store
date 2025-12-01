"use client"
import { useState, useCallback } from 'react';
import { extractFieldErrors } from '@/utils/validationErrorHandler';

export const useErrorHandler = () => {
  const [quotaError, setQuotaError] = useState(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleApiError = useCallback((error, setFieldErrorsFn, defaultMessage = 'An error occurred. Please try again.') => {
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      
      if (error.response.status === 403 && 
          (errorData.error === 'Quota Exceeded' || errorData.error === 'Forbidden')) {
        const quotaData = errorData.data || {};
        setQuotaError({
          message: errorData.message || 'Quota exceeded',
          quota: quotaData.quota || quotaData,
          resetTime: quotaData.resetTime || null,
          canUpgrade: quotaData.canUpgrade !== false
        });
        setShowQuotaModal(true);
        return { handled: true, type: 'quota' };
      }
      
      const extractedFieldErrors = extractFieldErrors(errorData);
      if (Object.keys(extractedFieldErrors).length > 0) {
        if (setFieldErrorsFn) {
          setFieldErrorsFn(extractedFieldErrors);
        } else {
          setFieldErrors(extractedFieldErrors);
        }
        return { handled: true, type: 'field', errors: extractedFieldErrors };
      }
      
      setErrorMessage(errorData.message || defaultMessage);
      setShowErrorModal(true);
      return { handled: true, type: 'general', message: errorData.message || defaultMessage };
    } else {
      setErrorMessage(defaultMessage);
      setShowErrorModal(true);
      return { handled: true, type: 'general', message: defaultMessage };
    }
  }, []);

  const handleApiResult = useCallback((result, setFieldErrorsFn, defaultMessage = 'An error occurred. Please try again.') => {
    if (!result.success) {
      if (result.error?.fields) {
        const extractedFieldErrors = extractFieldErrors(result.error);
        if (Object.keys(extractedFieldErrors).length > 0) {
          if (setFieldErrorsFn) {
            setFieldErrorsFn(extractedFieldErrors);
          } else {
            setFieldErrors(extractedFieldErrors);
          }
          return { handled: true, type: 'field', errors: extractedFieldErrors };
        }
      }
      
      setErrorMessage(result.message || defaultMessage);
      setShowErrorModal(true);
      return { handled: true, type: 'general', message: result.message || defaultMessage };
    }
    
    return { handled: false };
  }, []);

  const clearErrors = useCallback(() => {
    setQuotaError(null);
    setShowQuotaModal(false);
    setErrorMessage('');
    setShowErrorModal(false);
    setFieldErrors({});
  }, []);

  return {
    quotaError,
    showQuotaModal,
    errorMessage,
    showErrorModal,
    fieldErrors,
    setQuotaError,
    setShowQuotaModal,
    setErrorMessage,
    setShowErrorModal,
    setFieldErrors,
    handleApiError,
    handleApiResult,
    clearErrors
  };
};

