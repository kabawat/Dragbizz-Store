"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Mail, MessageSquare, Copy } from 'lucide-react';
import AddActionButton from './AddActionButton';

const SendMenu = ({
  item,
  onShare,
  getShareUrl,
  formatCurrency,
  formatDate,
  className = '',
  buttonClassName = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buildShareUrl = (item) => {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin;
    const path = getShareUrl ? getShareUrl(item) : `/${item._id || item.id}`;
    return `${base}${path}`;
  };

  const handleCopy = async (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        // You can add a toast notification here
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleWhatsAppShare = () => {
    const shareUrl = buildShareUrl(item);
    const message = `Purchase Order: ${item.billNumber || item.poNumber}\nAmount: ${formatCurrency(item.totalAmount)}\nSupplier: ${item.supplier?.name || 'N/A'}\n\nView details: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    setIsOpen(false);
    onShare?.('whatsapp', item);
  };

  const handleEmailShare = () => {
    const shareUrl = buildShareUrl(item);
    const subject = `Purchase Order: ${item.billNumber || item.poNumber}`;
    const body = `Purchase Order Details:\n\nPO Number: ${item.billNumber || item.poNumber}\nAmount: ${formatCurrency(item.totalAmount)}\nSupplier: ${item.supplier?.name || 'N/A'}\nExpected Delivery: ${formatDate(item.dueDate)}\n\nView details: ${shareUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    setIsOpen(false);
    onShare?.('email', item);
  };

  const handleSMSShare = () => {
    const shareUrl = buildShareUrl(item);
    const message = `Purchase Order: ${item.billNumber || item.poNumber}\nAmount: ${formatCurrency(item.totalAmount)}\nSupplier: ${item.supplier?.name || 'N/A'}\n\nView details: ${shareUrl}`;
    window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
    setIsOpen(false);
    onShare?.('sms', item);
  };

  const handleCopyLink = async () => {
    const shareUrl = buildShareUrl(item);
    await handleCopy(shareUrl);
    setIsOpen(false);
    onShare?.('copy', item);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef} {...props}>
      <AddActionButton
        onClick={() => setIsOpen(!isOpen)}
        Icon={Send}
        label="Send"
        size="sm"
        title="Send"
        className={`h-9 px-3 rounded-lg bg-white/90 hover:bg-white ${buttonClassName}`}
      />

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200" 
            style={{ color: '#25D366' }}
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
          
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200" 
            style={{ color: '#2563EB' }}
            onClick={handleEmailShare}
          >
            <Mail className="w-4 h-4" /> Email
          </button>
          
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200" 
            style={{ color: '#6B7280' }}
            onClick={handleSMSShare}
          >
            <MessageSquare className="w-4 h-4" /> Message
          </button>
          
          <div className="my-1 border-t border-[rgb(var(--color-border-primary))]" />
          
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200" 
            style={{ color: '#7C3AED' }}
            onClick={handleCopyLink}
          >
            <Copy className="w-4 h-4" /> Copy link
          </button>
        </div>
      )}
    </div>
  );
};

export default SendMenu;
