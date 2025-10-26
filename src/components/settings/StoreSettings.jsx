"use client"
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';

const StoreSettings = () => {
  const [stores] = useState([
    {
      id: 1,
      name: "Main Store",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      gst: "22AAAAA0000A1Z5",
      pan: "AAAAA0000A",
      phone: "+1 (555) 123-4567",
      email: "main@retailstore.com",
      isCurrent: true
    },
    {
      id: 2,
      name: "Branch Store",
      address: "456 Oak Avenue",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      gst: "22BBBBB0000B1Z5",
      pan: "BBBBB0000B",
      phone: "+1 (555) 987-6543",
      email: "branch@retailstore.com",
      isCurrent: false
    },
    {
      id: 3,
      name: "Downtown Store",
      address: "789 Commerce Plaza",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      gst: "22CCCCC0000C1Z5",
      pan: "CCCCC0000C",
      phone: "+1 (555) 456-7890",
      email: "downtown@retailstore.com",
      isCurrent: false
    }
  ]);

  const handleAddStore = () => {
    console.log('Add new store');
  };

  const handleEditStore = (storeId) => {
    console.log('Edit store:', storeId);
  };

  const handleDeleteStore = (storeId) => {
    console.log('Delete store:', storeId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Store Management</h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">{stores.length} {stores.length === 1 ? 'store' : 'stores'} registered</p>
        </div>
        <button
          onClick={handleAddStore}
          className="flex items-center gap-2 px-4 py-2.5 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary))]/90 transition-colors cursor-pointer font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New Store
        </button>
      </div>

      {/* Store Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div
            key={store.id}
            className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6 hover:shadow-md transition-shadow relative flex flex-col h-full"
          >
            {/* Card Header with Icon and Actions */}
            <div className="flex items-start justify-between mb-4">
              {/* Store Icon */}
              <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditStore(store.id)}
                  className="w-8 h-8 flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                </button>
                {!store.isCurrent && (
                  <button
                    onClick={() => handleDeleteStore(store.id)}
                    className="w-8 h-8 flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  </button>
                )}
              </div>
            </div>

            {/* Store Name */}
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              {store.name}
            </h3>

            {/* Address */}
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-3">
              {store.address}, {store.city}, {store.state} {store.pincode}
            </p>

            {/* GST & PAN */}
            <div className="space-y-1 mb-3">
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                <span className="font-medium text-[rgb(var(--color-text-primary))]">GST:</span> {store.gst}
              </p>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                <span className="font-medium text-[rgb(var(--color-text-primary))]">PAN:</span> {store.pan}
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-1">
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                <span className="font-medium text-[rgb(var(--color-text-primary))]">Phone:</span> {store.phone}
              </p>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                <span className="font-medium text-[rgb(var(--color-text-primary))]">Email:</span> {store.email}
              </p>
            </div>

            {/* Current Store Badge */}
            {store.isCurrent && (
              <div className="mt-auto pt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700">
                  Current Store
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreSettings;

