"use client"
import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Building2, AlertTriangle, CheckCircle, Clock, IndianRupee } from 'lucide-react';
import { purchaseOrderService } from '@/service/retailer';
import { SideDrawer, SettingsPanel } from '@/components/ui';
import PurchaseOrderDetails from '@/components/purchaseOrders/PurchaseOrderDetails';
import { ThemeProvider } from '@/contexts/ThemeContext';

const ViewPurchaseOrder = ({ purchaseOrderId }) => {
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        setLoading(true);
        const result = await purchaseOrderService.getPublicPurchaseOrder(purchaseOrderId);
        if (result.success) {
          setPurchaseOrder(result.data);
        } else {
          setError('Purchase order not found');
        }
      } catch (err) {
        console.error('Error fetching purchase order:', err);
        setError('Failed to load purchase order');
      } finally {
        setLoading(false);
      }
    };

    if (purchaseOrderId) {
      fetchPurchaseOrder();
    }
  }, [purchaseOrderId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { 
        icon: Clock, 
        text: 'Pending', 
        color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700' 
      },
      'APPROVED': { 
        icon: CheckCircle, 
        text: 'Approved', 
        color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700' 
      },
      'REJECTED': { 
        icon: AlertTriangle, 
        text: 'Rejected', 
        color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700' 
      },
      'OPEN': { 
        icon: AlertTriangle, 
        text: 'Open', 
        color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700' 
      }
    };
    
    return statusConfig[status?.toUpperCase()] || statusConfig['PENDING'];
  };

  const handleDownload = () => {
    // Implement download functionality
    // Download purchase order PDF
  };

  const handleViewDetails = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">Loading Purchase Order...</h2>
          <p className="text-[rgb(var(--color-text-secondary))]">Please wait while we fetch the details</p>
        </div>
      </div>
    );
  }

  if (error || !purchaseOrder) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">Purchase Order Not Found</h2>
          <p className="text-[rgb(var(--color-text-secondary))]">{error || 'The purchase order you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(purchaseOrder.approvalStatus || purchaseOrder.status);
  const StatusIcon = statusBadge.icon;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z" fill="currentColor" className="text-[rgb(var(--color-primary))]"/>
          </svg>
        </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-8">
        {/* Store Profile Section */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-3">
            Hello, {purchaseOrder.supplier?.name || 'Supplier'}
          </h1>
          <p className="text-lg text-[rgb(var(--color-text-secondary))]">
            Purchase Order #{purchaseOrder.poNumber || purchaseOrder.billNumber || `PO-${purchaseOrderId}`}
          </p>
        </div>

        {/* Purchase Order Card */}
        <div className="bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-2xl shadow-xl p-12 max-w-4xl w-full mb-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[rgb(var(--color-primary))] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-[rgb(var(--color-primary))]" />
            </div>
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">Purchase Order Details</h2>
          </div>

          {/* Store Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6">
              <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Store Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">Store Name:</span>
                  <span className="text-[rgb(var(--color-text-primary))] font-semibold text-right">
                    {purchaseOrder.store?.name || 'DragBizz Store'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">Phone:</span>
                  <span className="text-[rgb(var(--color-text-primary))] font-semibold">
                    {purchaseOrder.store?.phone || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">Email:</span>
                  <span className="text-[rgb(var(--color-text-primary))] font-semibold">
                    {purchaseOrder.store?.email || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">Address:</span>
                  <span className="text-[rgb(var(--color-text-primary))] font-semibold text-sm text-right max-w-[60%]">
                    {purchaseOrder.store?.address ? 
                      `${purchaseOrder.store.address.line1}, ${purchaseOrder.store.address.city}, ${purchaseOrder.store.address.state} - ${purchaseOrder.store.address.pincode}` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6">
              <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Order Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">PO Date:</span>
                  <span className="text-[rgb(var(--color-text-primary))] font-semibold">
                    {formatDate(purchaseOrder.poDate || purchaseOrder.billDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">Expected Delivery:</span>
                  <span className="text-[rgb(var(--color-text-primary))] font-semibold">
                    {formatDate(purchaseOrder.expectedDeliveryDate || purchaseOrder.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">Status:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusBadge.color}`}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusBadge.text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Count */}
          <div className="bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] bg-opacity-10 rounded-lg p-6 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {purchaseOrder.items?.length || 0}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">Number of Items</h3>
              <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                {purchaseOrder.items?.length === 1 ? 'item' : 'items'} in this order
              </p>
            </div>
          </div>

          {/* Notes Section */}
          {purchaseOrder.notes && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 rounded-lg p-6 mb-8 border border-amber-200 dark:border-amber-700">
              <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Notes
              </h4>
              <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                {purchaseOrder.notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleViewDetails}
              className="flex-1 text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))] hover:opacity-80 font-medium text-base flex items-center justify-center py-3 border-2 border-[rgb(var(--color-primary))] border-opacity-30 rounded-lg hover:bg-[rgb(var(--color-primary))] hover:bg-opacity-10 transition-colors"
            >
              View details →
            </button>
            <button 
              onClick={handleDownload}
              className="flex-1 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:opacity-90 text-white font-medium text-base flex items-center justify-center py-3 px-6 rounded-lg transition-colors shadow-md"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PO
            </button>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] bg-opacity-20 rounded-full flex items-center justify-center">
            <div className="text-4xl">🙏</div>
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] rounded-2xl p-8 max-w-4xl w-full text-white text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white bg-opacity-40 rounded-lg px-6 py-3 border-2 border-white border-opacity-70 shadow-lg">
              <span className="text-xl font-bold text-[rgb(var(--color-primary))] tracking-wide">DragBizz</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3">
            Easily manage purchase orders in 10 seconds 😉
          </h3>
          <p className="text-white text-opacity-80 mb-6 text-lg">
            and share them with your suppliers!
          </p>
          <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors text-lg shadow-lg">
            Try now for free 🚀
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[rgb(var(--color-text-secondary))] text-sm">
          <p className="font-semibold">Powered by <span className="text-[rgb(var(--color-primary))] font-bold">DragBizz</span></p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-[rgb(var(--color-text-primary))]">Terms</a>
            <a href="#" className="hover:text-[rgb(var(--color-text-primary))]">Privacy</a>
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={`Purchase Order #${purchaseOrder?.poNumber || purchaseOrder?.billNumber || purchaseOrderId}`}
        showDownloadButton={true}
        onDownload={handleDownload}
        width="w-1/2"
      >
        {purchaseOrder && (
          <PurchaseOrderDetails purchaseOrder={purchaseOrder} />
        )}
      </SideDrawer>
      
      {/* Theme Settings Panel */}
      <SettingsPanel />
      </div>
    </ThemeProvider>
  );
};

export default ViewPurchaseOrder;
