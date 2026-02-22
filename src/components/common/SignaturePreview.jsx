"use client";

import React from "react";

const SignaturePreview = ({ signature, size = "md", className = "" }) => {
    if (!signature) return null;

    const { method, content, config } = signature;

    const renderContent = () => {
        switch (method) {
            case "type":
                return (
                    <span
                        style={{
                            fontFamily: config?.fontFamily || "'Dancing Script', cursive",
                            fontSize: size === "sm" ? "1.2rem" : "1.8rem"
                        }}
                        className="text-[rgb(var(--color-text-primary))] text-center break-all px-2"
                    >
                        {content}
                    </span>
                );
            case "draw":
            case "upload":
                return (
                    <img
                        src={content}
                        alt="Signature"
                        className={`max-w-full ${size === "sm" ? "max-h-12" : "max-h-24"} object-contain`}
                    />
                );
            case "identity":
                return (
                    <div className="text-center">
                        <p className="font-serif text-[8px] italic text-blue-600 mb-0.5 uppercase tracking-tighter">Digitally Verified</p>
                        <p className="font-black text-sm tracking-widest">{content}</p>
                    </div>
                );
            default:
                return <span className="text-xs italic text-[rgb(var(--color-text-tertiary))]">Unknown method</span>;
        }
    };

    return (
        <div className={`flex items-center justify-center w-full h-full overflow-hidden ${className}`}>
            {renderContent()}
        </div>
    );
};

export default SignaturePreview;
