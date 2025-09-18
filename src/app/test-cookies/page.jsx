// Test page to verify middleware and cookie functionality
"use client"
import React, { useEffect, useState } from 'react';
import { cookieManager } from '@/utils/cookieManager';

export default function TestPage() {
  const [cookieStatus, setCookieStatus] = useState('Checking...');
  const [allCookies, setAllCookies] = useState('');

  useEffect(() => {
    // Check if we can read the cookie
    const token = cookieManager.getAuthToken();
    setCookieStatus(token ? `Token found: ${token.substring(0, 20)}...` : 'No token found');
    
    // Show all cookies
    setAllCookies(document.cookie);
  }, []);

  const setTestCookie = () => {
    cookieManager.setAuthToken('test-token-12345');
    setCookieStatus('Test token set');
    setAllCookies(document.cookie);
  };

  const clearCookies = () => {
    cookieManager.clearAuth();
    setCookieStatus('Cookies cleared');
    setAllCookies(document.cookie);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Cookie Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Cookie Status</h2>
          <p className="mb-4"><strong>Status:</strong> {cookieStatus}</p>
          <p className="mb-4"><strong>All Cookies:</strong></p>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {allCookies}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={setTestCookie}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Set Test Cookie
            </button>
            <button 
              onClick={clearCookies}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Cookies
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Test Navigation</h2>
          <div className="space-x-4">
            <a 
              href="/dashboard"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block"
            >
              Go to Dashboard
            </a>
            <a 
              href="/login"
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 inline-block"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
