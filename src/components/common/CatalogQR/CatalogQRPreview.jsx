import { ShoppingBag } from "lucide-react";
import React from "react";

const CatalogQRPreview = ({ qrUrl, size = "md", className = "" }) => {
    const sizeClasses = {
        sm: "w-28 h-28",
        md: "w-36 h-36 sm:w-40 sm:h-40",
        lg: "w-48 h-48 sm:w-52 sm:h-52",
    };

    const containerPadding = {
        sm: "p-3 rounded-xl",
        md: "p-5 rounded-2xl",
        lg: "p-8 rounded-[1.5rem]",
    };

    return (
        <div
            className={`bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary)/0.2)] flex-shrink-0 flex items-center justify-center ${
                containerPadding[size] || containerPadding.md
            } ${className}`}
        >
            <div className="bg-white p-2 rounded-xl border border-[rgb(var(--color-border-primary))]/50 shadow-sm">
                {qrUrl ? (
                    <img
                        src={qrUrl}
                        alt="QR Code"
                        className={`${sizeClasses[size] || sizeClasses.md} block object-contain`}
                    />
                ) : (
                    <div
                        className={`${sizeClasses[size] || sizeClasses.md} flex items-center justify-center bg-gray-50 text-gray-400`}
                    >
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CatalogQRPreview;

