"use client";
import { CreditCard } from "lucide-react";

export const PaymentTipsSidebar = () => (
    <div className="lg:col-span-1">
        <div className="sticky top-6">
            <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                            Payment Management Tips
                        </h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                            Best practices
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 text-sm">💰</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Payment Tracking</h4>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">Keep track of all supplier payments</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-yellow-600 text-sm">💳</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Payment Methods</h4>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">Choose convenient methods</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 text-sm">📊</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Records</h4>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">Maintain accurate financial records</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                    <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">💡 Pro Tips</h4>
                    <ul className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
                        <li>• Verify payment details</li>
                        <li>• Keep payment references</li>
                        <li>• Allocate to specific bills</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
);
