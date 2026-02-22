"use client";
import { ShieldCheck } from "lucide-react";
import { Button, Input, Card, CardBody } from "@/components/ui";

export default function CheckoutOtpStep({
  contactDisplay,
  otp,
  onOtpChange,
  onSubmit,
  onBack,
  loading,
  error,
}) {
  return (
    <div className="animate-in zoom-in-95 duration-500">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[rgb(var(--color-primary))]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[rgb(var(--color-primary))]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
            Verify it&apos;s you
          </h1>
          <p className="text-[rgb(var(--color-text-secondary))] text-sm">
            We&apos;ve sent a 5-digit code to{" "}
            <span className="font-bold text-[rgb(var(--color-text-primary))]">
              {contactDisplay}
            </span>
          </p>
        </div>

        <Card className="border-none">
          <CardBody className="p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase text-center block">
                  Enter OTP Code
                </label>
                <Input
                  value={otp}
                  onChange={(val) =>
                    onOtpChange(val.replace(/\D/g, "").slice(0, 5))
                  }
                  className="text-center font-mono text-3xl tracking-[0.5em] h-16 font-bold bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))] focus:bg-[rgb(var(--color-bg-primary))] transition-all text-[rgb(var(--color-text-primary))]"
                  placeholder="00000"
                  maxLength={5}
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))] text-sm p-3 rounded-lg text-center font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={otp.length < 5}
                className="!h-12 !rounded-xl !text-base shadow-lg shadow-[rgb(var(--color-primary))]/20 font-bold"
              >
                Confirm Order
              </Button>

              <button
                type="button"
                onClick={onBack}
                className="w-full text-center text-sm text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-primary))] font-medium transition-colors"
              >
                Change contact
              </button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
