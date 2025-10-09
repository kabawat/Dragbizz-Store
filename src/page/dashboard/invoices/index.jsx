"use client"
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getInvoices, setFilters } from '@/store/slices/invoicesSlice';
import { Button, Card, Input, Select, Badge } from '@/components/ui';
import { Search, Plus, FileText, Calendar, DollarSign, User } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
import Link from 'next/link';

const InvoicesPage = () => {
  const dispatch = useAppDispatch();
  const { invoices, isLoading, error, filters } = useAppSelector((state) => state.invoices);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getInvoices(filters));
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ invoiceNumber: searchTerm }));
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'RELEASED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Invoices"
          description="Manage your customer invoices"
        />

        {/* Main Content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Action Button */}
            <div className="flex justify-end">
            <Link href="/dashboard/invoices/add">
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Invoice</span>
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input
                  placeholder="Search by invoice number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </form>

              <Select
                placeholder="Filter by Status"
                value={filters.invoiceStatus}
                onChange={(value) => handleFilterChange('invoiceStatus', value)}
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="RELEASED">Released</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>

              <Select
                placeholder="Filter by Payment"
                value={filters.paymentStatus}
                onChange={(value) => handleFilterChange('paymentStatus', value)}
              >
                <option value="">All Payments</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </Select>

              <Select
                placeholder="Limit"
                value={filters.limit || 10}
                onChange={(value) => handleFilterChange('limit', value)}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </Select>
            </div>
          </Card>

          {/* Invoices List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <Card className="p-6 text-center">
              <p className="text-red-600">{error}</p>
            </Card>
          ) : invoices.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first invoice</p>
              <Link href="/dashboard/invoices/add">
                <Button>Create Invoice</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <Card key={invoice._id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {invoice.invoiceNumber}
                        </h3>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <Badge className={getPaymentStatusColor(invoice.paymentStatus)}>
                          {invoice.paymentStatus}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>
                            {invoice.customer?.name || 'Walk-in Customer'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-gray-900">
                            ₹{invoice.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {invoice.items && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            {invoice.items.length} item(s) •
                            Total Items: {invoice.items.reduce((sum, item) => sum + item.quantity, 0)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Link href={`/dashboard/invoices/view/${invoice._id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      {invoice.status === 'DRAFT' && (
                        <Link href={`/dashboard/invoices/edit/${invoice._id}`}>
                          <Button size="sm">
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
