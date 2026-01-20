export const detectContactType = (value) => {
  const cleanValue = value.replace(/\s+/g, '');

  if (value.includes('@') && value.includes('.')) {
    return 'email';
  }
  else if (/^[\+]?[\d\s\-\(\)]+$/.test(value) && cleanValue.length >= 10) {
    return 'phone';
  }
  else if (/^\d/.test(cleanValue)) {
    return 'phone';
  }
  else if (/^[a-zA-Z@]/.test(cleanValue)) {
    return 'email';
  }
  
  return 'email';
};

export const formatContact = (contact, type) => {
  if (type === 'email') {
    const [username, domain] = contact.split('@');
    if (username.length <= 3) return contact;
    return `${username.slice(0, 2)}***@${domain}`;
  } else {
    if (contact.length <= 6) return contact;
    return `${contact.slice(0, 3)}***${contact.slice(-2)}`;
  }
};

export const validateForm = (formData, contactType, loginMethod, t) => {
  const newErrors = {};

  if (!formData.contact.trim()) {
    newErrors.contact = t('auth.emailOrPhoneRequired');
  } else if (contactType === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact)) {
      newErrors.contact = t('auth.validEmailRequired');
    }
  } else if (contactType === 'phone') {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    const cleanPhone = formData.contact.replace(/\D/g, '');

    if (!phoneRegex.test(formData.contact)) {
      newErrors.contact = t('auth.validPhoneRequired');
    } else if (cleanPhone.length < 10) {
      newErrors.contact = t('auth.phoneMinDigits');
    } else if (cleanPhone.length > 15) {
      newErrors.contact = t('auth.phoneTooLong');
    }
  }

  if (loginMethod === 'password') {
    if (!formData.password.trim()) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordMinLength');
    }
  } else if (loginMethod === 'otp') {
    if (!formData.otp.trim()) {
      newErrors.otp = t('auth.otpRequired');
    } else if (formData.otp.length !== 5) {
      newErrors.otp = t('auth.otpMustBe5Digits');
    }
  }

  return newErrors;
};

