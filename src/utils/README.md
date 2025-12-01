# Reusable Utilities

This directory contains reusable utility functions and hooks that can be used across the application to avoid code duplication.

## Validators (`validators.js`)

Centralized validation functions for common form fields.

### Usage

```javascript
import { validateEmail, validatePhone, validateGST, validatePAN, detectContactType } from '@/utils/validators';

// Email validation
const emailResult = validateEmail(email, required);
if (!emailResult.isValid) {
  setError(emailResult.error);
}

// Phone validation
const phoneResult = validatePhone(phone, required);
if (!phoneResult.isValid) {
  setError(phoneResult.error);
}

// Contact type detection
const contactType = detectContactType(contact); // Returns 'email' or 'phone'
```

### Available Validators

- `validateEmail(email, required)` - Validates email format
- `validatePhone(phone, required)` - Validates phone number
- `validateContact(contact, contactType, required)` - Validates email or phone
- `validateName(name, required, minLength, maxLength)` - Validates name
- `validateGST(gst, required)` - Validates GST number
- `validatePAN(pan, required)` - Validates PAN number
- `validatePassword(password, required, minLength)` - Validates password
- `validateOTP(otp, length, required)` - Validates OTP
- `detectContactType(contact)` - Detects if contact is email or phone

## Form Data Hook (`useFormData`)

Reusable hook for managing form data with nested field support.

### Usage

```javascript
import { useFormData } from '@/hooks/useFormData';

const { formData, updateField, errors, setErrors, resetForm } = useFormData({
  name: '',
  email: '',
  address: {
    city: '',
    state: ''
  }
});

// Update simple field
updateField('name', 'John');

// Update nested field
updateField('address.city', 'Mumbai');

// Reset form
resetForm();
```

## Error Handler Hook (`useErrorHandler`)

Reusable hook for handling API errors including quota errors and field errors.

### Usage

```javascript
import { useErrorHandler } from '@/hooks/useErrorHandler';

const {
  quotaError,
  showQuotaModal,
  errorMessage,
  showErrorModal,
  fieldErrors,
  handleApiError,
  handleApiResult,
  setShowQuotaModal,
  setShowErrorModal,
  clearErrors
} = useErrorHandler();

// In try-catch block
try {
  const result = await apiCall();
  handleApiResult(result, setFieldErrors, 'Default error message');
} catch (error) {
  handleApiError(error, setFieldErrors, 'Default error message');
}
```

## Migration Guide

### Before (Repeated Code)

```javascript
// Validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  setError('Please enter a valid email address');
}

// Form data update
const updateFormData = (field, value) => {
  if (field.includes('.')) {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  } else {
    setFormData(prev => ({ ...prev, [field]: value }));
  }
};

// Error handling
if (error.response.status === 403 && errorData.error === 'Quota Exceeded') {
  setQuotaError({...});
  setShowQuotaModal(true);
} else {
  const fieldErrors = extractFieldErrors(errorData);
  setFieldErrors(fieldErrors);
}
```

### After (Using Utilities)

```javascript
// Validation
import { validateEmail } from '@/utils/validators';
const emailResult = validateEmail(email, true);
if (!emailResult.isValid) {
  setError(emailResult.error);
}

// Form data update
import { useFormData } from '@/hooks/useFormData';
const { updateField } = useFormData(initialData);
updateField('address.city', 'Mumbai');

// Error handling
import { useErrorHandler } from '@/hooks/useErrorHandler';
const { handleApiError } = useErrorHandler();
handleApiError(error, setFieldErrors, 'Default message');
```

