import { 
  detectContactType as detectContactTypeFromValidators,
  validateContact,
  validatePassword,
  validateOTP
} from '@/utils/validators';

export const detectContactType = detectContactTypeFromValidators;

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

  const contactValidation = validateContact(formData.contact, contactType, true);
  if (!contactValidation.isValid) {
    newErrors.contact = contactValidation.error || t('auth.emailOrPhoneRequired');
  }

  if (loginMethod === 'password') {
    const passwordValidation = validatePassword(formData.password, true, 6);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error || t('auth.passwordRequired');
    }
  } else if (loginMethod === 'otp') {
    const otpValidation = validateOTP(formData.otp, 5, true);
    if (!otpValidation.isValid) {
      newErrors.otp = otpValidation.error || t('auth.otpRequired');
    }
  }

  return newErrors;
};

