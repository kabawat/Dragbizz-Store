import React, { useState, useEffect } from "react";
import { Mail, Phone, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react";

const VerificationFlow = ({
  contactType,
  contact,
  onVerificationComplete,
  onBack,
}) => {
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");

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

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-verify when all fields are filled
    if (
      newCode.every((digit) => digit !== "") &&
      newCode.join("").length === 5
    ) {
      handleVerification(newCode.join(""));
    }

    setError("");
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerification = async (code) => {
    setIsLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      if (code === "12345") {
        // Demo code for testing
        setIsVerified(true);
        setTimeout(() => {
          onVerificationComplete();
        }, 1500);
      } else {
        setError("Invalid verification code. Please try again.");
        setVerificationCode(["", "", "", "", ""]);
        document.getElementById("code-0")?.focus();
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setCanResend(false);
    setTimeLeft(60);
    setVerificationCode(["", "", "", "", ""]);
    setError("");

    // Simulate API call
    setTimeout(() => {
      // Code resent successfully
    }, 1000);
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Verified Successfully!
          </h1>
          <p className="text-gray-600 mb-4">
            Your account has been created successfully
          </p>
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {contactType === "email" ? (
              <Mail className="w-8 h-8 text-blue-500" />
            ) : (
              <Phone className="w-8 h-8 text-blue-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Verify Your {contactType === "email" ? "Email" : "Phone"}
          </h1>
          <p className="text-gray-600 mb-4">
            We've sent a 5-digit verification code to
          </p>
          <p className="font-semibold text-gray-800">{contact}</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter verification code
            </label>
            <div className="flex justify-center space-x-3">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    error ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-3 text-center animate-fade-in">
                {error}
              </p>
            )}
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-3">Didn't receive the code?</p>
            {canResend ? (
              <button
                onClick={handleResendCode}
                className="flex items-center justify-center mx-auto px-4 py-2 text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Code
              </button>
            ) : (
              <p className="text-gray-500">Resend in {timeLeft}s</p>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-gray-600">Verifying...</span>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationFlow;
