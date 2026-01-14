"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Loader2, MessageSquare, X, Bot, User, CheckCircle2, AlertCircle, Sparkles, Clock, MicOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { voiceAIService } from '@/service';
import { supplierService } from '@/service';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';

const VoiceAISupplier = ({ storeId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { currentVariant } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if speech recognition is supported
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // English only
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        let errorMsg = 'Voice recognition error. Please try again.';
        if (event.error === 'no-speech') {
          errorMsg = 'No speech detected. Please try again.';
        } else if (event.error === 'not-allowed') {
          errorMsg = 'Microphone permission denied. Please allow microphone access.';
        }
        
        setMessages(prev => [...prev, {
          type: 'ai',
          content: errorMsg,
          timestamp: new Date(),
          isError: true
        }]);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([{
      type: 'ai',
      content: 'Hello! 👋\n\nI can help you create a new supplier. You can tell me supplier details such as:\n\n• Supplier name\n• Agency name\n• Phone number\n• Email address\n• Address (optional)\n• GST number (optional)\n\nYou can type in simple language or click the microphone button to speak, and I will automatically create the supplier for you!',
      timestamp: new Date()
    }]);
    setIsReady(true);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message
    const newUserMessage = {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Call Voice AI API
      const result = await voiceAIService.chatSupplier(userMessage, sessionId, storeId);

      if (result.success && result.data) {
        const aiResponse = result.data;
        
        // Update session ID if provided
        if (aiResponse.sessionId && !sessionId) {
          setSessionId(aiResponse.sessionId);
        }

        // Add AI response
        const newAIMessage = {
          type: 'ai',
          content: aiResponse.message || 'Processing...',
          timestamp: new Date(),
          data: aiResponse
        };
        setMessages(prev => [...prev, newAIMessage]);

        // If supplier is ready to create (success: true and status: ready_to_create)
        if (aiResponse.success && aiResponse.status === 'ready_to_create' && aiResponse.extractedData) {
          // Create supplier via retailer API
          try {
            const supplierData = {
              store: storeId,
              name: aiResponse.extractedData.name,
              agency: aiResponse.extractedData.agency,
              phone: aiResponse.extractedData.phone || null,
              email: aiResponse.extractedData.email || null,
              ...(aiResponse.extractedData.address && {
                address: aiResponse.extractedData.address
              }),
              ...(aiResponse.extractedData.gstNumber && {
                gstNumber: aiResponse.extractedData.gstNumber
              })
            };

            const createResult = await supplierService.createSupplier(supplierData);
            
            if (createResult.success) {
              setMessages(prev => [...prev, {
                type: 'ai',
                content: `Supplier "${aiResponse.extractedData.name}" (${aiResponse.extractedData.agency}) has been successfully created! 🎉`,
                timestamp: new Date(),
                isSuccess: true
              }]);
              
              // Call onSuccess after a short delay
              setTimeout(() => {
                if (onSuccess) {
                  onSuccess(createResult.data);
                }
              }, 1500);
            } else {
              setMessages(prev => [...prev, {
                type: 'ai',
                content: `Error: ${createResult.message || 'There was a problem creating the supplier. Please try again.'}`,
                timestamp: new Date(),
                isError: true
              }]);
            }
          } catch (error) {
            setMessages(prev => [...prev, {
              type: 'ai',
              content: `Error: There was a problem creating the supplier. Please try again.`,
              timestamp: new Date(),
              isError: true
            }]);
          }
        }
      } else {
        // Handle error response
        let errorMessage = result.message || 'An error occurred. Please try again.';
        
        if (result.error || result.fields?.quota) {
          const quota = result.fields?.quota || {};
          if (quota.hasAccess === false) {
            errorMessage = 'Voice AI feature is not available in your current subscription plan. Please upgrade your plan.';
          }
        }
        
        setMessages(prev => [...prev, {
          type: 'ai',
          content: errorMessage,
          timestamp: new Date(),
          isError: true
        }]);
      }
    } catch (error) {
      // Handle network/API errors
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Parse subscription errors (AI is boolean-based, not quota-based)
        if (error.response.status === 403 || error.response.status === 429) {
          const quota = errorData.fields?.quota || errorData.data?.quota || {};
          // For AI, only check hasAccess (enabled/disabled), not quota
          if (quota.hasAccess === false) {
            errorMessage = 'Voice AI feature is not available in your current subscription plan. Please upgrade your plan.';
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      setMessages(prev => [...prev, {
        type: 'ai',
        content: errorMessage,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickExamples = [
    "Create supplier name ABC Traders, agency XYZ Corp, phone 9876543210",
    "Add supplier: Rajesh Kumar, agency Tech Solutions, email rajesh@example.com",
    "New supplier: Priya Sharma, agency Global Imports, phone 9876543210, email priya@example.com"
  ];

  const handleQuickExample = (example) => {
    setInputValue(example);
    inputRef.current?.focus();
  };

  // Handle voice recording
  const handleVoiceRecord = () => {
    if (!isSpeechSupported) {
      setMessages(prev => [...prev, {
        type: 'ai',
        content: 'Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.',
        timestamp: new Date(),
        isError: true
      }]);
      return;
    }

    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setMessages(prev => [...prev, {
          type: 'ai',
          content: 'Could not start voice recording. Please check microphone permissions.',
          timestamp: new Date(),
          isError: true
        }]);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[rgb(var(--color-bg-primary))]">
      {/* Header with Info */}
      <div className="px-4 py-3 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[rgb(var(--color-primary))]/10">
            <Sparkles className="w-4 h-4 text-[rgb(var(--color-primary))]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
              AI Assistant
            </p>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">
              Tell me supplier details and I'll create it for you
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[rgb(var(--color-bg-primary))] to-[rgb(var(--color-bg-secondary))]/30">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} transition-opacity duration-300`}
          >
            {message.type === 'ai' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgb(var(--color-primary))]/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-[rgb(var(--color-primary))]" />
              </div>
            )}
            
            <div className={`flex flex-col gap-1 max-w-[75%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  message.type === 'user'
                    ? 'bg-[rgb(var(--color-primary))] text-white rounded-br-sm'
                    : message.isError
                    ? currentVariant === 'dark'
                      ? 'bg-red-900/30 text-red-200 border border-red-800 rounded-bl-sm'
                      : 'bg-red-50 text-red-800 border border-red-200 rounded-bl-sm'
                    : message.isSuccess
                    ? currentVariant === 'dark'
                      ? 'bg-green-900/30 text-green-200 border-2 border-green-700 rounded-bl-sm'
                      : 'bg-green-50 text-green-800 border-2 border-green-300 rounded-bl-sm'
                    : 'bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border-primary))] rounded-bl-sm'
                }`}
              >
                {message.isSuccess && (
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className={`w-4 h-4 ${currentVariant === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                    <span className={`text-xs font-semibold ${currentVariant === 'dark' ? 'text-green-300' : 'text-green-700'}`}>Success!</span>
                  </div>
                )}
                {message.isError && (
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className={`w-4 h-4 ${currentVariant === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                    <span className={`text-xs font-semibold ${currentVariant === 'dark' ? 'text-red-300' : 'text-red-700'}`}>Error</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
              <div className="flex items-center gap-1 px-2">
                <Clock className="w-3 h-3 text-[rgb(var(--color-text-tertiary))]" />
                <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center">
                <User className="w-4 h-4 text-[rgb(var(--color-primary))]" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start gap-3 transition-opacity duration-300">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgb(var(--color-primary))]/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-3 border border-[rgb(var(--color-border-primary))] shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-[rgb(var(--color-primary))]" />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Examples */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 py-3 border-t border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/50">
          <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2">{t('common.quickExamples')}:</p>
          <div className="flex flex-wrap gap-2">
            {quickExamples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickExample(example)}
                className="text-xs px-3 py-1.5 rounded-full bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-primary))]/10 hover:border-[rgb(var(--color-primary))]/30 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-[rgb(var(--color-border-primary))] p-4 bg-[rgb(var(--color-bg-primary))]">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type supplier details... (e.g., 'Create supplier name ABC Traders, agency XYZ Corp, phone 9876543210')"
              value={inputValue}
              onChange={(value) => setInputValue(value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || isRecording}
              className="w-full pr-12"
            />
            {inputValue && !isRecording && (
              <button
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors"
              >
                <X className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
              </button>
            )}
            {isRecording && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className={`w-2 h-2 ${currentVariant === 'dark' ? 'bg-red-400' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                <span className={`text-xs ${currentVariant === 'dark' ? 'text-red-400' : 'text-red-600'} font-medium`}>Recording...</span>
              </div>
            )}
          </div>
          
          {/* Voice Record Button */}
          {isSpeechSupported && (
            <Button
              variant={isRecording ? "danger" : "outline"}
              onClick={handleVoiceRecord}
              disabled={isLoading}
              size="sm"
              className={`shrink-0 ${isRecording ? 'animate-pulse' : ''}`}
              leftIcon={isRecording ? MicOff : Mic}
            >
              {isRecording ? 'Stop' : 'Voice'}
            </Button>
          )}
          
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading || isRecording}
            loading={isLoading}
            leftIcon={Send}
            size="sm"
            className="shrink-0"
          >
            Send
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] text-xs">Enter</kbd> to send
            </p>
            {isSpeechSupported && (
              <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                or click <kbd className="px-1.5 py-0.5 rounded bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] text-xs">Voice</kbd> to speak
              </p>
            )}
          </div>
          {sessionId && (
            <div className="flex items-center gap-1 text-xs text-[rgb(var(--color-text-tertiary))]">
              <MessageSquare className="w-3 h-3" />
              <span>Session active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAISupplier;

