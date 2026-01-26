"use client";
import Image from "next/image";
import { Building2, MapPin, Phone, Share2 } from "lucide-react";
import { Button } from "@/components/ui";


export default function CatalogHeader({ store, onShare, onCall }) {
    return (
        <header className="sticky top-0 z-50 bg-[rgb(var(--color-bg-primary))]/80 backdrop-blur-md border-b border-[rgb(var(--color-border-primary))]/50 shadow-sm transition-all h-20">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
                {/* Store Info */}
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[rgb(var(--color-border-primary))] bg-white shadow-sm flex-shrink-0">
                        {store.logo ? (
                            <Image
                                src={store.logo}
                                alt={store.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[rgb(var(--color-primary))]/10">
                                <Building2 className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                            </div>
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-lg font-bold text-[rgb(var(--color-text-primary))] leading-none mb-1">
                            {store.name}
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-[rgb(var(--color-text-secondary))]">
                            <MapPin className="w-3 h-3" />
                            <span>{store.address?.city}, {store.address?.state}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden md:flex gap-2"
                        onClick={onShare}
                        aria-label="Share catalog"
                    >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                    </Button>
                    {store.phone && (
                        <Button
                            variant="success"
                            size="sm"
                            className="gap-2 bg-green-500 hover:bg-green-600 text-white border-none"
                            onClick={onCall}
                            aria-label={`Call ${store.name}`}
                        >
                            <Phone className="w-4 h-4" />
                            <span className="hidden sm:inline">Call Store</span>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
