import React, { useState } from 'react';
import { Mail, Phone, User, Lock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface RegistrationData {
  firstName: string;
  lastName: string;
  contact: string;
  contactType: 'email' | 'phone';
  password: string;
}

interface RegistrationFlowProps {
  onComplete: (data: RegistrationData) => void;
}

const RegistrationFlow: React.FC<RegistrationFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    contact: '',
    contactType: 'email',
    password: ''
  });

  const [errors, setErrors] = useState<Partial<RegistrationData>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<RegistrationData> = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    }

    if (currentStep === 2) {
      if (!formData.contact.trim()) {
        newErrors.contact = `${formData.contactType === 'email' ? 'Email' : 'Phone'} is required`;
      } else if (formData.contactType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.contact)) {
          newErrors.contact = 'Please enter a valid email address';
        }
      } else {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.contact.replace(/\D/g, ''))) {
          newErrors.contact = 'Please enter a valid 10-digit phone number';
        }
      }
    }

    if (currentStep === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onComplete(formData);
    }, 2000);
  };

  const updateFormData = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((stepNum) => (
        <React.Fragment key={stepNum}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            stepNum <= step 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {stepNum < step ? <CheckCircle className="w-5 h-5" /> : stepNum}
          </div>
          {stepNum < 3 && (
            <div className={`w-12 h-1 mx-2 transition-all duration-300 ${
              stepNum < step ? 'bg-blue-500' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const InputField = ({ 
    icon: Icon, 
    type, 
    placeholder, 
    value, 
    onChange, 
    error 
  }: {
    icon: React.ElementType;
    type: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
  }) => (
    <div className="mb-4">
      <div className={`relative transition-all duration-200 ${error ? 'shake' : ''}`}>
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all duration-300">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join thousands of users worldwide</p>
        </div>

        <StepIndicator />

        <div className="space-y-6">
          {step === 1 && (
            <div className="animate-slide-in">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">What's your name?</h2>
              <InputField
                icon={User}
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(value) => updateFormData('firstName', value)}
                error={errors.firstName}
              />
              <InputField
                icon={User}
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(value) => updateFormData('lastName', value)}
                error={errors.lastName}
              />
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-in">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">How can we reach you?</h2>
              
              <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                <button
                  type="button"
                  onClick={() => updateFormData('contactType', 'email')}
                  className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all duration-200 cursor-pointer ${
                    formData.contactType === 'email'
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData('contactType', 'phone')}
                  className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all duration-200 cursor-pointer ${
                    formData.contactType === 'phone'
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Phone
                </button>
              </div>

              <InputField
                icon={formData.contactType === 'email' ? Mail : Phone}
                type={formData.contactType === 'email' ? 'email' : 'tel'}
                placeholder={formData.contactType === 'email' ? 'your@email.com' : '+91 98765 43210'}
                value={formData.contact}
                onChange={(value) => updateFormData('contact', value)}
                error={errors.contact}
              />
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-in">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Secure your account</h2>
              <InputField
                icon={Lock}
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(value) => updateFormData('password', value)}
                error={errors.password}
              />
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-700 text-sm">
                  <strong>Security Tips:</strong>
                  <br />• Use at least 8 characters
                  <br />• Mix uppercase & lowercase
                  <br />• Include numbers & symbols
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={isLoading}
            className={`ml-auto flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 ${
              isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : step === 3 ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <ArrowRight className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Creating...' : step === 3 ? 'Create Account' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFlow;