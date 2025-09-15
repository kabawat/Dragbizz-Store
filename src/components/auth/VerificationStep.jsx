import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, RefreshCw, Edit3, AlertCircle, CheckCircle } from 'lucide-react';

const VerificationStep = ({
  contactType,
  contact,
  firstName,
  onVerificationComplete,
  onChangeContact
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '')) {
      handleVerification(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerification = async (code) => {
    setIsVerifying(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (code === '12345') { // Demo code
        onVerificationComplete();
      } else {
        setAttempts(prev => prev + 1);
        if (attempts >= 2) {
          setError('Too many failed attempts. Please request a new code.');
          setOtp(['', '', '', '', '', '']);
          setCanResend(true);
          setTimeLeft(0);
        } else {
          setError('That code didn\'t work, try again.');
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handleResendCode = () => {
    if (!canResend) return;
    
    setCanResend(false);
    setTimeLeft(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setAttempts(0);
    inputRefs.current[0]?.focus();
  };

  const formatContact = (contact, type) => {
    if (type === 'email') {
      const [username, domain] = contact.split('@');
      if (username.length <= 3) return contact;
      return `${username.slice(0, 2)}***@${domain}`;
    } else {
      if (contact.length <= 6) return contact;
      return `${contact.slice(0, 3)}***${contact.slice(-2)}`;
    }
  };

  return (
    <div className="animate-slide-in transition-all duration-700 ease-in-out">
      {/* Progress Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              ✓
            </div>
            <div className="w-16 h-1 bg-green-500 mx-2"></div>
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              ✓
            </div>
            <div className="w-16 h-1 bg-green-500 mx-2"></div>
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">Step 3 of 3</p>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {contactType === 'email' ? (
            <Mail className="w-8 h-8 text-blue-500" />
          ) : (
            <Phone className="w-8 h-8 text-blue-500" />
          )}
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Almost there, {firstName}! 🎯
        </h2>
        
        <p className="text-sm sm:text-base text-gray-600 mb-2">
          We've sent a 5-digit code to
        </p>
        
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mr-3 ${
              contactType === 'email' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {contactType === 'email' ? (
                <>
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </>
              ) : (
                <>
                  <Phone className="w-3 h-3 mr-1" />
                  Phone
                </>
              )}
            </div>
            <p className="font-semibold text-gray-800 mr-2">
              {formatContact(contact, contactType)}
            </p>
            <button
              onClick={onChangeContact}
              className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* OTP Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Enter verification code
          </label>
          <div className="flex justify-center space-x-3 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  error ? 'border-red-500 bg-red-50 animate-shake' : 'border-gray-300'
                }`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className="text-center mb-4">
              <p className="text-red-500 text-sm flex items-center justify-center animate-fade-in">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            </div>
          )}

          {isVerifying && (
            <div className="flex items-center justify-center mb-4">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-gray-600">Verifying...</span>
            </div>
          )}
        </div>

        {/* Resend Section */}
        <div className="text-center">
          <p className="text-gray-600 mb-3">
            Didn't receive the code?
          </p>
          
          {canResend ? (
            <button
              onClick={handleResendCode}
              className="flex items-center justify-center mx-auto px-4 py-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-500 ease-in-out rounded-lg cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend Code
            </button>
          ) : (
            <p className="text-gray-500">
              Resend in {timeLeft}s
            </p>
          )}
          
          <button
            onClick={onChangeContact}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-2 py-1 rounded transition-all duration-500 ease-in-out cursor-pointer"
          >
            Change {contactType}?
          </button>
        </div>

        {/* Demo Hint */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-yellow-700 text-sm">
            💡 <strong>Demo:</strong> Use code <code className="bg-yellow-200 px-2 py-1 rounded">12345</code> to continue
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationStep;