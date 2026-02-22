"use client";


export default function LoadingSkeleton({ type = "catalog", count = 8 }) {
    if (type === "header") {
        return (
            <div className="sticky top-0 z-50 bg-[rgb(var(--color-bg-primary))] border-b border-[rgb(var(--color-border-primary))] h-20 animate-pulse">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-bg-tertiary))]" />
                        <div className="hidden sm:block space-y-2">
                            <div className="h-4 w-32 bg-[rgb(var(--color-bg-tertiary))] rounded" />
                            <div className="h-3 w-24 bg-[rgb(var(--color-bg-tertiary))] rounded" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-9 w-20 bg-[rgb(var(--color-bg-tertiary))] rounded-lg" />
                        <div className="h-9 w-28 bg-[rgb(var(--color-bg-tertiary))] rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (type === "product") {
        return (
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-primary))] overflow-hidden animate-pulse">
                <div className="aspect-square bg-[rgb(var(--color-bg-tertiary))]" />
                <div className="p-5 space-y-3">
                    <div className="h-3 w-16 bg-[rgb(var(--color-bg-tertiary))] rounded" />
                    <div className="h-4 w-full bg-[rgb(var(--color-bg-tertiary))] rounded" />
                    <div className="h-4 w-3/4 bg-[rgb(var(--color-bg-tertiary))] rounded" />
                    <div className="pt-4 space-y-2">
                        <div className="h-6 w-24 bg-[rgb(var(--color-bg-tertiary))] rounded" />
                        <div className="grid grid-cols-2 gap-2">
                            <div className="h-10 bg-[rgb(var(--color-bg-tertiary))] rounded-xl" />
                            <div className="h-10 bg-[rgb(var(--color-bg-tertiary))] rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Full catalog skeleton
    return (
        <div className="min-h-screen bg-[rgb(var(--color-bg-secondary))] flex flex-col">
            <LoadingSkeleton type="header" />

            <div className="container mx-auto px-4 py-8 flex-1">
                <div className="flex flex-col gap-8">
                    {/* Welcome Area Skeleton */}
                    <div className="space-y-2 animate-pulse">
                        <div className="h-8 w-64 bg-[rgb(var(--color-bg-tertiary))] rounded" />
                        <div className="h-4 w-96 bg-[rgb(var(--color-bg-tertiary))] rounded" />
                    </div>

                    {/* Search and Filters Skeleton */}
                    <div className="flex flex-col lg:flex-row gap-4 animate-pulse">
                        <div className="h-12 w-full lg:max-w-md bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-xl" />
                        <div className="flex gap-2 overflow-x-auto">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-10 w-28 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-full flex-shrink-0" />
                            ))}
                        </div>
                    </div>

                    {/* Products Grid Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: count }).map((_, i) => (
                            <LoadingSkeleton key={i} type="product" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
