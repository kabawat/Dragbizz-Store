import { Building2, Store } from "lucide-react";

export default function StoreFormHeader({ agency }) {
    return (
        <>
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
                <div className="w-14 h-14 bg-[rgb(var(--color-primary))] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Store className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                    DragBizz Store
                </h1>
            </div>

            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                    <Store className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-1">
                    Create Your Store 🏪
                </h1>

                <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-2">
                    Now let's set up your first store
                </p>

                <div className="flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))] mr-2" />
                    <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                        Agency:{" "}
                        <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {agency.agencyName}
                        </span>
                    </span>
                </div>
            </div>
        </>
    );
}
