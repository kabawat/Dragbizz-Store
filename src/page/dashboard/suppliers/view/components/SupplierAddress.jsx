"use client";
import { MapPin } from "lucide-react";

const SupplierAddress = ({ address }) => {
  if (!address) return null;

  return (
    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full flex items-center justify-center">
          <MapPin className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
            Address
          </h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            Supplier location details
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {address.addressLine1 && (
          <div>
            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
              Address Line 1
            </p>
            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
              {address.addressLine1}
            </p>
          </div>
        )}
        {address.addressLine2 && (
          <div>
            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
              Address Line 2
            </p>
            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
              {address.addressLine2}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {address.city && (
            <div>
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                City
              </p>
              <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                {address.city}
              </p>
            </div>
          )}
          {address.state && (
            <div>
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                State
              </p>
              <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                {address.state}
              </p>
            </div>
          )}
          {address.pincode && (
            <div>
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                Pincode
              </p>
              <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                {address.pincode}
              </p>
            </div>
          )}
          {address.country && (
            <div>
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                Country
              </p>
              <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                {address.country}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierAddress;
