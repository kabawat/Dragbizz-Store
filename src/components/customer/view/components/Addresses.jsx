"use client";

import { useState } from "react";
import { Check, Copy, CreditCard, MapPin, Truck } from "lucide-react";

function formatAddressString(addr) {
  if (!addr) return "";
  const parts = [
    addr.addressLine1,
    addr.city,
    [addr.state, addr.pincode].filter(Boolean).join(" - "),
    addr.country,
  ].filter(Boolean);
  return parts.join(", ");
}

const AddressCard = ({ title, icon: Icon, address, badgeColor = "blue" }) => {
  const [copied, setCopied] = useState(false);
  const formattedText = formatAddressString(address);
  const hasContent = Boolean(
    address &&
      (address.addressLine1 ||
        address.city ||
        address.state ||
        address.pincode ||
        address.country)
  );

  const handleCopy = () => {
    if (!formattedText || typeof window === "undefined" || !navigator?.clipboard) return;
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-secondary))]/20 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgb(var(--color-border-primary))]/40">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                badgeColor === "purple"
                  ? "bg-purple-500/10 text-purple-500"
                  : "bg-blue-500/10 text-blue-500"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
              {title}
            </h3>
          </div>
          {hasContent && (
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
              title="Copy address"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {hasContent ? (
          <div className="space-y-1.5 text-sm text-[rgb(var(--color-text-primary))]">
            {address.addressLine1 && (
              <p className="font-medium">{address.addressLine1}</p>
            )}
            {(address.city || address.state || address.pincode) && (
              <p className="text-[rgb(var(--color-text-secondary))]">
                {[address.city, address.state].filter(Boolean).join(", ")}
                {address.pincode ? ` - ${address.pincode}` : ""}
              </p>
            )}
            {address.country && (
              <p className="text-xs uppercase tracking-wider text-[rgb(var(--color-text-secondary))]">
                {address.country}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[rgb(var(--color-text-secondary))] italic py-2">
            No {title.toLowerCase()} recorded
          </p>
        )}
      </div>
    </div>
  );
};

const Addresses = ({ addresses }) => {
  if (!addresses || (!addresses.billing && !addresses.shipping)) {
    return null;
  }

  return (
    <div className="bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-primary))] p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[rgb(var(--color-text-primary))]">
            Addresses
          </h2>
          <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
            Billing and delivery locations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AddressCard
          title="Billing Address"
          icon={CreditCard}
          address={addresses.billing}
          badgeColor="blue"
        />
        <AddressCard
          title="Shipping Address"
          icon={Truck}
          address={addresses.shipping}
          badgeColor="purple"
        />
      </div>
    </div>
  );
};

export default Addresses;
