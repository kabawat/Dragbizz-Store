"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, MapPin, Phone, Mail, User, ShieldCheck, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Button, Input, Card, CardBody } from "@/components/ui";
import { clearCart } from "@/store/slices/publicCartSlice";
import publicSalesOrderService from "@/service/public/salesOrder.service";
import { useToast } from "@/hooks/useToast";

export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const dispatch = useDispatch();
    const toast = useToast();
    const catalogId = params?.catalogId;

    // Redux Cart State
    const items = useSelector(state => state.publicCart.items);

    // Local State
    const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [otp, setOtp] = useState("");
    const [secret, setSecret] = useState(null);
    const [orderResult, setOrderResult] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        deliveryAddress: {
            line1: "",
            city: "",
            state: "",
            pincode: ""
        }
    });

    const subtotal = items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);

    useEffect(() => {
        // Redirect if cart is empty and not on success step
        if (items.length === 0 && step !== 3) {
            router.push(`/c/${catalogId}`);
        }
    }, [items, step, catalogId, router]);

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!formData.name || (!formData.phone && !formData.email)) {
            setError("Please provide your name and contact details");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload = {
                store_catalog_id: catalogId,
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                items: items.map(item => ({
                    product: item._id,
                    quantity: parseInt(item.quantity)
                })),
                deliveryAddress: formData.deliveryAddress,
                orderSource: "ONLINE"
            };

            const response = await publicSalesOrderService.createOrder(payload);

            if (response.success) {
                setSecret(response.data?.secret);
                setStep(2);
                toast.showSuccess("OTP sent successfully!");
            } else {
                setError(response.message || "Failed to initiate order");
            }
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 5) return;

        try {
            setLoading(true);
            setError(null);

            const response = await publicSalesOrderService.verifyOtp({
                secret,
                otp
            });

            if (response.success) {
                setOrderResult(response.data);
                dispatch(clearCart());
                setStep(3);
                toast.showSuccess("Order placed successfully!");
            } else {
                setError(response.message || "Invalid OTP");
            }
        } catch (err) {
            setError(err.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && step !== 3) return null;

    return (
        <div className="min-h-screen bg-[rgb(var(--color-bg-tertiary))]/50">
            {/* Header */}
            <header className="bg-[rgb(var(--color-bg-primary))] border-b border-[rgb(var(--color-border-primary))]/50 sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] transition-colors font-medium text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Shop</span>
                    </button>
                    <div className="flex items-center gap-2 text-sm font-bold text-[rgb(var(--color-text-primary))]">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span>Generic Checkout</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column - Forms */}
                    <div className="lg:col-span-7 space-y-6">
                        {step === 1 && (
                            <div className="animate-in slide-in-from-left-4 duration-500">
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">Shipping Details</h1>
                                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">Where should we deliver your order?</p>
                                </div>

                                <Card className="border-none shadow-sm overflow-hidden bg-[rgb(var(--color-bg-primary))]">
                                    <CardBody className="p-0">
                                        <form onSubmit={handleCreateOrder} className="p-6 md:p-8 space-y-6">
                                            {/* Contact Info */}
                                            <section className="space-y-4">
                                                <h3 className="text-sm font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider flex items-center gap-2">
                                                    <User className="w-4 h-4" /> Contact Information
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="col-span-2">
                                                        <label className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] mb-1.5 block">Full Name</label>
                                                        <Input
                                                            placeholder="John Doe"
                                                            value={formData.name}
                                                            onChange={(val) => setFormData(prev => ({ ...prev, name: val }))}
                                                            required
                                                            className="bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))] focus:bg-[rgb(var(--color-bg-primary))] transition-colors"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Phone Number</label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                                            <Input
                                                                placeholder="9876543210"
                                                                value={formData.phone}
                                                                onChange={(val) => setFormData(prev => ({ ...prev, phone: val.replace(/\D/g, '').slice(0, 10) }))}
                                                                type="tel"
                                                                className="pl-10 bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))] focus:bg-[rgb(var(--color-bg-primary))] transition-colors"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Email Address</label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                                            <Input
                                                                placeholder="john@example.com"
                                                                value={formData.email}
                                                                onChange={(val) => setFormData(prev => ({ ...prev, email: val }))}
                                                                type="email"
                                                                className="pl-10 bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))] focus:bg-[rgb(var(--color-bg-primary))] transition-colors"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <div className="h-px bg-gray-100" />

                                            {/* Address Info */}
                                            <section className="space-y-4">
                                                <h3 className="text-sm font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" /> Delivery Address
                                                </h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Street Address</label>
                                                        <Input
                                                            placeholder="House No, Building, Street Area"
                                                            value={formData.deliveryAddress.line1}
                                                            onChange={(val) => setFormData(prev => ({ ...prev, deliveryAddress: { ...prev.deliveryAddress, line1: val } }))}
                                                            required
                                                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                        <div className="col-span-2 md:col-span-1">
                                                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">City</label>
                                                            <Input
                                                                placeholder="Mumbai"
                                                                value={formData.deliveryAddress.city}
                                                                onChange={(val) => setFormData(prev => ({ ...prev, deliveryAddress: { ...prev.deliveryAddress, city: val } }))}
                                                                required
                                                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">State</label>
                                                            <Input
                                                                placeholder="Maharashtra"
                                                                value={formData.deliveryAddress.state}
                                                                onChange={(val) => setFormData(prev => ({ ...prev, deliveryAddress: { ...prev.deliveryAddress, state: val } }))}
                                                                required
                                                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Pincode</label>
                                                            <Input
                                                                placeholder="400001"
                                                                value={formData.deliveryAddress.pincode}
                                                                onChange={(val) => setFormData(prev => ({ ...prev, deliveryAddress: { ...prev.deliveryAddress, pincode: val } }))}
                                                                required
                                                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            {error && (
                                                <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                                                    {error}
                                                </div>
                                            )}

                                            <div className="pt-4">
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    fullWidth
                                                    loading={loading}
                                                    className="!h-12 !rounded-xl !text-base shadow-lg shadow-[rgb(var(--color-primary))]/20 hover:shadow-xl hover:shadow-[rgb(var(--color-primary))]/30 transition-all font-bold"
                                                    rightIcon={ArrowRight}
                                                >
                                                    Continue to Payment
                                                </Button>
                                                <p className="text-xs text-center text-gray-400 mt-4">
                                                    Detailed step skipped for testing purposes. We'll verify your phone next.
                                                </p>
                                            </div>
                                        </form>
                                    </CardBody>
                                </Card>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in zoom-in-95 duration-500">
                                <div className="max-w-md mx-auto">
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-[rgb(var(--color-primary))]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[rgb(var(--color-primary))]">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">Verify it's you</h1>
                                        <p className="text-gray-500 text-sm">
                                            We've sent a 5-digit code to <span className="font-bold text-[rgb(var(--color-text-primary))]">{formData.phone || formData.email}</span>
                                        </p>
                                    </div>

                                    <Card className="border-none shadow-sm">
                                        <CardBody className="p-8">
                                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase text-center block">Enter OTP Code</label>
                                                    <Input
                                                        value={otp}
                                                        onChange={(val) => setOtp(val.replace(/\D/g, '').slice(0, 5))}
                                                        className="text-center font-mono text-3xl tracking-[0.5em] h-16 font-bold bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))] focus:bg-[rgb(var(--color-bg-primary))] transition-all text-[rgb(var(--color-text-primary))]"
                                                        placeholder="00000"
                                                        maxLength={5}
                                                        autoFocus
                                                        required
                                                    />
                                                </div>

                                                {error && (
                                                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
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
                                                    onClick={() => setStep(1)}
                                                    className="w-full text-center text-sm text-gray-400 hover:text-[rgb(var(--color-primary))] font-medium transition-colors"
                                                >
                                                    Change Phone Number
                                                </button>
                                            </form>
                                        </CardBody>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {step === 3 && orderResult && (
                            <div className="animate-in zoom-in-95 duration-500">
                                <div className="max-w-md mx-auto text-center pt-8">
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in shadow-xl shadow-green-100">
                                        <CheckCircle className="w-12 h-12 text-green-600" />
                                    </div>
                                    <h1 className="text-3xl font-black text-[rgb(var(--color-text-primary))] mb-2">Order Confirmed!</h1>
                                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                                        Thank you for your purchase. Your order <span className="font-mono font-bold text-[rgb(var(--color-text-primary))]">#{orderResult.orderNumber}</span> has been placed successfully.
                                    </p>

                                    <Card className="border-none shadow-sm mb-8 bg-[rgb(var(--color-bg-secondary))]">
                                        <CardBody className="p-6">
                                            <div className="flex justify-between items-center text-sm mb-4 pb-4 border-b border-gray-200/50">
                                                <span className="text-gray-500">Order ID</span>
                                                <span className="font-mono font-bold">{orderResult.orderNumber}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Amount Paid</span>
                                                <span className="font-bold text-green-600">₹{subtotal.toLocaleString()}</span>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    <div className="space-y-3">
                                        <Button
                                            href={orderResult.trackingUrl}
                                            target="_blank"
                                            variant="primary"
                                            fullWidth
                                            className="!h-12 !rounded-xl font-bold shadow-lg shadow-[rgb(var(--color-primary))]/20"
                                        >
                                            Track Order Status
                                        </Button>
                                        <Button
                                            onClick={() => router.push(`/c/${catalogId}`)}
                                            variant="outline"
                                            fullWidth
                                            className="!h-12 !rounded-xl font-bold border-gray-200 hover:bg-white"
                                        >
                                            Continue Shopping
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Order Summary */}
                    {step !== 3 && (
                        <div className="lg:col-span-5">
                            <div className="sticky top-24">
                                <Card className="border-none shadow-lg shadow-gray-100/50 overflow-hidden">
                                    <div className="bg-[rgb(var(--color-bg-secondary))]/50 p-6 border-b border-[rgb(var(--color-border-primary))]/50">
                                        <h3 className="font-bold text-[rgb(var(--color-text-primary))] text-lg">Order Summary</h3>
                                    </div>
                                    <CardBody className="p-6">
                                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {items.map((item) => (
                                                <div key={item._id} className="flex gap-4">
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                                        {item.images?.[0]?.url ? (
                                                            <Image
                                                                src={item.images[0].url}
                                                                alt={item.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ShoppingBag className="w-6 h-6 text-gray-200" />
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-0 right-0 bg-black/50 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg font-bold">
                                                            x{item.quantity}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-[rgb(var(--color-text-primary))] truncate mb-1">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-xs text-[rgb(var(--color-text-tertiary))] mb-2">
                                                            {item.brand || 'Brand'}
                                                        </p>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
                                                                ₹{(item.sellingPrice * item.quantity).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="h-px bg-gray-100 my-6" />

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>Subtotal</span>
                                                <span>₹{subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>Delivery</span>
                                                <span className="text-green-600 font-bold">FREE</span>
                                            </div>
                                            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                                                <span className="text-base font-bold text-[rgb(var(--color-text-primary))]">Total Amount</span>
                                                <span className="text-xl font-bold text-[rgb(var(--color-primary))]">
                                                    ₹{subtotal.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>

                                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Secure Checkout powered by DragBizz</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
