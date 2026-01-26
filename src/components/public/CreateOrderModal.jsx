"use client";
import { useState } from "react";
import { X, ShoppingBag, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { Modal, Input, Button } from "@/components/ui";
import publicSalesOrderService from "@/service/public/salesOrder.service";

const CreateOrderModal = ({
    isOpen,
    onClose,
    product,
    storeId,
    orderSource = "ONLINE"
}) => {
    const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        quantity: 1
    });

    // OTP State
    const [otp, setOtp] = useState("");
    const [token, setToken] = useState(null);
    const [orderResult, setOrderResult] = useState(null);

    const calculateTotal = () => {
        return (product?.sellingPrice || 0) * (formData.quantity || 1);
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!formData.customerName || !formData.customerPhone) {
            setError("Please fill in all details");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload = {
                store: storeId,
                items: [{
                    product: product._id,
                    quantity: parseInt(formData.quantity)
                }],
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                orderSource
            };

            const response = await publicSalesOrderService.createOrder(payload);

            if (response.success) {
                setToken(response.data.token);
                setStep(2);
            } else {
                setError(response.message || "Failed to initiate order");
            }
        } catch (err) {
            console.log(err)
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await publicSalesOrderService.verifyOtp({ otp }, token);

            if (response.success) {
                setOrderResult(response.data);
                setStep(3);
            } else {
                setError(response.message || "Invalid OTP");
            }
        } catch (err) {
            setError(err.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setFormData({ customerName: "", customerPhone: "", quantity: 1 });
        setOtp("");
        setToken(null);
        setOrderResult(null);
        setError(null);
        onClose();
    };

    if (!product) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={resetAndClose}
            size="md"
            showCloseButton={false}
            className="p-0 overflow-hidden"
        >
            {/* Header with Product Info */}
            <div className="bg-[rgb(var(--color-bg-secondary))] p-6 border-b border-[rgb(var(--color-border-primary))]">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                        {step === 1 ? "Place Order" : step === 2 ? "Verify Phone" : "Order Placed!"}
                    </h3>
                    <button
                        onClick={resetAndClose}
                        className="p-1 rounded-full hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors"
                    >
                        <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
                    </button>
                </div>

                {/* Product Summary Mini Card */}
                <div className="flex gap-4 items-center bg-[rgb(var(--color-bg-primary))] p-3 rounded-xl border border-[rgb(var(--color-border-primary))]">
                    <div className="w-12 h-12 bg-[rgb(var(--color-bg-tertiary))] rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <ShoppingBag className="w-6 h-6 text-[rgb(var(--color-text-tertiary))]" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[rgb(var(--color-text-primary))] truncate">{product.name}</p>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                            ₹{product.sellingPrice.toLocaleString()} {step === 1 && `x ${formData.quantity}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-[rgb(var(--color-primary))]">
                            ₹{calculateTotal().toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {step === 1 && (
                    <form onSubmit={handleCreateOrder} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase mb-1 block">Full Name</label>
                                <Input
                                    placeholder="Enter your name"
                                    value={formData.customerName}
                                    onChange={(val) => setFormData(prev => ({ ...prev, customerName: val }))}
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase mb-1 block">Qty</label>
                                <Input
                                    type="number"
                                    min="1"
                                    max={product.stock > 0 ? product.stock : 100}
                                    value={formData.quantity}
                                    onChange={(val) => setFormData(prev => ({ ...prev, quantity: Math.max(1, parseInt(val) || 1) }))}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase mb-1 block">Phone Number</label>
                            <Input
                                placeholder="Enter 10-digit number"
                                value={formData.customerPhone}
                                onChange={(val) => setFormData(prev => ({ ...prev, customerPhone: val.replace(/\D/g, '').slice(0, 10) }))}
                                required
                                type="tel"
                            />
                            <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] mt-1">
                                We'll send an OTP to verify this number.
                            </p>
                        </div>

                        {error && <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg">{error}</p>}

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                            className="mt-4"
                            rightIcon={ArrowRight}
                        >
                            Continue to Verify
                        </Button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="text-center mb-6">
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                Enter the 6-digit code sent to <span className="font-bold text-[rgb(var(--color-text-primary))]">{formData.customerPhone}</span>
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <Input
                                value={otp}
                                onChange={(val) => setOtp(val.replace(/\D/g, '').slice(0, 6))}
                                className="text-center font-mono text-2xl tracking-[0.5em] w-48 font-bold"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        {error && <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg text-center">{error}</p>}

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                            className="mt-4"
                        >
                            Confirm Order
                        </Button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-center text-xs text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-primary))] mt-2 font-medium"
                        >
                            Change Phone Number
                        </button>
                    </form>
                )}

                {step === 3 && orderResult && (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-2">Order Successful!</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
                            Your order <span className="font-mono font-bold">{orderResult.orderNumber}</span> has been placed successfully.
                        </p>

                        <div className="space-y-3">
                            <Button
                                href={orderResult.trackingUrl}
                                target="_blank"
                                variant="outline"
                                fullWidth
                            >
                                Track Order
                            </Button>
                            <Button
                                onClick={resetAndClose}
                                variant="primary"
                                fullWidth
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CreateOrderModal;
