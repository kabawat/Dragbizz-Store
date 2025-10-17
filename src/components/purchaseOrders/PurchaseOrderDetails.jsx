"use client"
import React from 'react';
import { Calendar, Building2, FileText, IndianRupee, Phone, Mail, Barcode } from 'lucide-react';

const PurchaseOrderDetails = ({ purchaseOrder }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': {
        text: 'Pending',
        color: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      'APPROVED': {
        text: 'Approved',
        color: 'bg-green-100 text-green-800 border-green-200'
      },
      'REJECTED': {
        text: 'Rejected',
        color: 'bg-red-100 text-red-800 border-red-200'
      },
      'DRAFT': {
        text: 'Draft',
        color: 'bg-gray-100 text-gray-800 border-gray-200'
      }
    };

    return statusConfig[status?.toUpperCase()] || statusConfig['PENDING'];
  };

  const statusBadge = getStatusBadge(purchaseOrder.approvalStatus || purchaseOrder.status);

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
            Details
          </button>
        </nav>
      </div>

      {/* Purchase Order Summary Card */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white font-semibold">
                {purchaseOrder.store?.name?.charAt(0)?.toUpperCase() || 'PO'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {purchaseOrder.store?.name || 'DragBizz Store'}
              </h3>
              <div className="text-sm text-gray-600 mt-1">
                <span>Purchase Order Date {formatDate(purchaseOrder.poDate || purchaseOrder.billDate)}</span>
                <span className="mx-2">•</span>
                <span>Due Date {formatDate(purchaseOrder.expectedDeliveryDate || purchaseOrder.dueDate)}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600 mb-2 flex items-center justify-end">
              <Phone className="w-4 h-4 mr-1" />
              Contact Information
            </div>
            <div className="text-sm font-semibold text-gray-900 flex items-center justify-end mb-1">
              <Phone className="w-4 h-4 mr-2 text-blue-600" />
              {purchaseOrder.store?.phone || 'N/A'}
            </div>
            <div className="text-sm font-semibold text-gray-900 flex items-center justify-end">
              <Mail className="w-4 h-4 mr-2 text-blue-600" />
              {purchaseOrder.store?.email || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Table */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h4>
        <div className="overflow-x-auto max-h-64 overflow-y-auto border border-gray-100 rounded-lg">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {purchaseOrder.items?.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.name || `Item ${index + 1}`}
                      </div>
                      {item.barcode && (
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Barcode className="w-3 h-3 mr-1" />
                          {item.barcode}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Notes Section */}
      {purchaseOrder.notes && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Notes
          </h4>
          <div className="max-h-32 overflow-y-auto">
            <p className="text-blue-700 text-sm">
              {purchaseOrder.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderDetails;
