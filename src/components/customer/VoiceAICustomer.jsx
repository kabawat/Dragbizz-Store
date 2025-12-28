"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Loader2, MessageSquare, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { voiceAIService } from '@/service';
import { customerService } from '@/service';

const VoiceAICustomer = ({ storeId, onSuccess, onCancel }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([{
      type: 'ai',
      content: 'Namaste! Main aapki madad kar sakta hoon naya customer create karne mein. Customer ka naam, email ya phone number bataiye.',
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
      const result = await voiceAIService.chatCustomer(userMessage, sessionId, storeId);

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

        // If customer is ready to create (success: true and status: ready_to_create)
        if (aiResponse.success && aiResponse.status === 'ready_to_create' && aiResponse.extractedData) {
          // Create customer via retailer API
          try {
            const customerData = {
              store: storeId,
              name: aiResponse.extractedData.name,
              phone: aiResponse.extractedData.phone || null,
              email: aiResponse.extractedData.email || null,
              ...(aiResponse.extractedData.companyDetails && {
                companyDetails: aiResponse.extractedData.companyDetails
              }),
              ...(aiResponse.extractedData.addresses && {
                addresses: aiResponse.extractedData.addresses
              })
            };

            const createResult = await customerService.createCustomer(customerData);
            
            if (createResult.success) {
              setMessages(prev => [...prev, {
                type: 'ai',
                content: `Customer "${aiResponse.extractedData.name}" successfully create ho gaya hai! 🎉`,
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
                content: `Error: ${createResult.message || 'Customer create karne mein problem aayi. Please try again.'}`,
                timestamp: new Date(),
                isError: true
              }]);
            }
          } catch (error) {
            setMessages(prev => [...prev, {
              type: 'ai',
              content: `Error: Customer create karne mein problem aayi. Please try again.`,
              timestamp: new Date(),
              isError: true
            }]);
          }
        }
      } else {
        setMessages(prev => [...prev, {
          type: 'ai',
          content: result.message || 'Kuch error aaya hai. Please try again.',
          timestamp: new Date(),
          isError: true
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'ai',
        content: 'Kuch error aaya hai. Please try again.',
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

  return (
    <div className="flex flex-col h-full bg-[rgb(var(--color-bg-primary))]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-[rgb(var(--color-primary))] text-white'
                  : message.isError
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : message.isSuccess
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))]'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[rgb(var(--color-primary))]" />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Processing...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[rgb(var(--color-border-primary))] p-4 bg-[rgb(var(--color-bg-primary))]">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your message... (e.g., 'Create customer name Mukesh Singh, email mukesh@example.com')"
            value={inputValue}
            onChange={(value) => setInputValue(value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            loading={isLoading}
            leftIcon={Send}
            size="sm"
          >
            Send
          </Button>
        </div>
        <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-2">
          Example: "Create customer name Mukesh Singh, phone 9876543210"
        </p>
      </div>
    </div>
  );
};

export default VoiceAICustomer;

