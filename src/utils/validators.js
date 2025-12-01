const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+]?[\d\s\-\(\)]{10,}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const validateEmail = (email, required = false) => {
  if (!email || !email.trim()) {
    return {
      isValid: !required,
      error: required ? 'Email is required' : null
    };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  return { isValid: true, error: null };
};

export const validatePhone = (phone, required = false) => {
  if (!phone || !phone.trim()) {
    return {
      isValid: !required,
      error: required ? 'Phone number is required' : null
    };
  }

  const cleanPhone = phone.replace(/\D/g, '');
  
  if (!PHONE_REGEX.test(phone)) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number'
    };
  }

  if (cleanPhone.length < 10) {
    return {
      isValid: false,
      error: 'Phone number must be at least 10 digits'
    };
  }

  if (cleanPhone.length > 15) {
    return {
      isValid: false,
      error: 'Phone number is too long'
    };
  }

  return { isValid: true, error: null };
};

export const validateContact = (contact, contactType, required = false) => {
  if (!contact || !contact.trim()) {
    return {
      isValid: !required,
      error: required ? 'Email or phone number is required' : null
    };
  }

  if (contactType === 'email') {
    return validateEmail(contact, required);
  } else if (contactType === 'phone') {
    return validatePhone(contact, required);
  }

  return { isValid: true, error: null };
};

export const validateName = (name, required = false, minLength = 2, maxLength = 100) => {
  if (!name || !name.trim()) {
    return {
      isValid: !required,
      error: required ? 'Name is required' : null
    };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < minLength) {
    return {
      isValid: false,
      error: `Name must be at least ${minLength} characters`
    };
  }

  if (trimmedName.length > maxLength) {
    return {
      isValid: false,
      error: `Name cannot exceed ${maxLength} characters`
    };
  }

  return { isValid: true, error: null };
};

export const validateGST = (gst, required = false) => {
  if (!gst || !gst.trim()) {
    return {
      isValid: !required,
      error: required ? 'GST number is required' : null
    };
  }

  if (!GST_REGEX.test(gst.trim().toUpperCase())) {
    return {
      isValid: false,
      error: 'Please enter a valid GST number'
    };
  }

  return { isValid: true, error: null };
};

export const validatePAN = (pan, required = false) => {
  if (!pan || !pan.trim()) {
    return {
      isValid: !required,
      error: required ? 'PAN number is required' : null
    };
  }

  if (!PAN_REGEX.test(pan.trim().toUpperCase())) {
    return {
      isValid: false,
      error: 'Please enter a valid PAN number'
    };
  }

  return { isValid: true, error: null };
};

export const validatePassword = (password, required = false, minLength = 6) => {
  if (!password || !password.trim()) {
    return {
      isValid: !required,
      error: required ? 'Password is required' : null
    };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${minLength} characters`
    };
  }

  return { isValid: true, error: null };
};

export const validateOTP = (otp, length = 5, required = false) => {
  if (!otp || !otp.trim()) {
    return {
      isValid: !required,
      error: required ? 'OTP is required' : null
    };
  }

  if (otp.length !== length) {
    return {
      isValid: false,
      error: `OTP must be ${length} digits`
    };
  }

  if (!/^\d+$/.test(otp)) {
    return {
      isValid: false,
      error: 'OTP must contain only digits'
    };
  }

  return { isValid: true, error: null };
};

export const detectContactType = (contact) => {
  if (!contact) return 'phone';

  const cleanValue = contact.replace(/\s+/g, '');

  if (contact.includes('@') && contact.includes('.')) {
    return 'email';
  }

  if (/^[\+]?[\d\s\-\(\)]+$/.test(contact) && cleanValue.length >= 10) {
    return 'phone';
  }

  if (/^\d/.test(cleanValue)) {
    return 'phone';
  }

  if (/^[a-zA-Z@]/.test(cleanValue)) {
    return 'email';
  }

  return 'phone';
};

export const VALIDATION_REGEX = {
  EMAIL: EMAIL_REGEX,
  PHONE: PHONE_REGEX,
  GST: GST_REGEX,
  PAN: PAN_REGEX
};

