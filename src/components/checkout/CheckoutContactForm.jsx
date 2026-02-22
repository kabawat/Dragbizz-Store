"use client";
import { ArrowRight, MapPin, Mail, Phone, User } from "lucide-react";
import { Button, Input, Card, CardBody, Select } from "@/components/ui";
import INDIAN_STATES from "@/constants/indianStates";

export default function CheckoutContactForm({
  formData,
  onFormChange,
  onSubmit,
  loading,
  error,
}) {
  const setForm = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      onFormChange((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      onFormChange((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="animate-in slide-in-from-left-4 duration-500">
      <Card className="border-none overflow-hidden bg-[rgb(var(--color-bg-primary))]">
        <CardBody className="p-0">
          <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" /> Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] mb-1.5 block">
                    Full Name
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(val) => setForm("name", val)}
                    required
                    className="bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))] focus:bg-[rgb(var(--color-bg-primary))] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] mb-1.5 block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                    <Input
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(val) =>
                        setForm("phone", val.replace(/\D/g, "").slice(0, 10))
                      }
                      type="tel"
                      className="pl-10 bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))] focus:bg-[rgb(var(--color-bg-primary))] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] mb-1.5 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                    <Input
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(val) => setForm("email", val)}
                      type="email"
                      className="pl-10 bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))] focus:bg-[rgb(var(--color-bg-primary))] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-[rgb(var(--color-border-primary))]" />

            <section className="space-y-4">
              <h3 className="text-sm font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Delivery Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] mb-1.5 block">
                    Street Address
                  </label>
                  <Input
                    placeholder="House No, Building, Street Area"
                    value={formData.deliveryAddress.line1}
                    onChange={(val) => setForm("deliveryAddress.line1", val)}
                    required
                    className="bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))] focus:bg-[rgb(var(--color-bg-primary))] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] mb-1.5 block">
                      City
                    </label>
                    <Input
                      placeholder="Mumbai"
                      value={formData.deliveryAddress.city}
                      onChange={(val) => setForm("deliveryAddress.city", val)}
                      required
                      className="bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))] focus:bg-[rgb(var(--color-bg-primary))] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] mb-1.5 block">
                      State
                    </label>
                    <Select
                      placeholder="Select State"
                      value={formData.deliveryAddress.stateCode}
                      onChange={(val) => setForm("deliveryAddress.stateCode", val)}
                      options={INDIAN_STATES}
                      searchable
                      required
                      className="bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))] focus:bg-[rgb(var(--color-bg-primary))] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] mb-1.5 block">
                      Pincode
                    </label>
                    <Input
                      placeholder="400001"
                      value={formData.deliveryAddress.pincode}
                      onChange={(val) =>
                        setForm("deliveryAddress.pincode", val)
                      }
                      required
                      className="bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))] focus:bg-[rgb(var(--color-bg-primary))] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div className="bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))] text-sm p-4 rounded-xl flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[rgb(var(--color-danger))] rounded-full" />
                {error}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                className="!h-12 !rounded-xl !text-base shadow-lg shadow-[rgb(var(--color-primary))]/20 transition-all font-bold"
                rightIcon={ArrowRight}
              >
                Continue to Verify
              </Button>
              <p className="text-xs text-center text-[rgb(var(--color-text-tertiary))] mt-4">
                We&apos;ll send an OTP to verify your contact.
              </p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
