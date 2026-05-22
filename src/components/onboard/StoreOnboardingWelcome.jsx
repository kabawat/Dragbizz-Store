import { BarChart3, Package, Store, Users } from "lucide-react";

export default function StoreOnboardingWelcome() {
    return (
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center">
            <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center relative z-10 pl-4 sm:pl-6 lg:pl-8 xl:pl-10">
                <div className="flex flex-col justify-center xl:pl-35 pr-8 xl:pr-22 py-12 w-full max-w-full">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-300/30">
                            <Store className="w-8 h-8 text-indigo-700" />
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
                            Create Your Store 🏪
                        </h1>
                        <p className="text-xl text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
                            Set up your first store and start managing your business
                            operations
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="mt-16 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                                <Package className="w-6 h-6 text-indigo-700" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                                    Inventory Management
                                </h3>
                                <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                                    Track and manage your products efficiently
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                                <BarChart3 className="w-6 h-6 text-indigo-700" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                                    Sales Analytics
                                </h3>
                                <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                                    Monitor your store's performance and growth
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                                <Users className="w-6 h-6 text-indigo-700" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                                    Customer Management
                                </h3>
                                <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                                    Build and maintain customer relationships
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Text */}
                    <div className="mt-auto pt-8">
                        <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                            © 2025 DragBizz. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
