"use client";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui";


export default function EmptyState({
    icon: Icon = Layers,
    title = "No items found",
    description = "Try adjusting your filters or search query.",
    actionLabel,
    onAction
}) {
    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-3xl border border-[rgb(var(--color-border-primary))] border-dashed p-20 text-center">
            <div className="w-20 h-20 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon className="w-10 h-10 text-[rgb(var(--color-text-tertiary))] opacity-30" />
            </div>
            <h3 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">{title}</h3>
            <p className="text-[rgb(var(--color-text-secondary))] max-w-sm mx-auto mb-8">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button variant="outline" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
