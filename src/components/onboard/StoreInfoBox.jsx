import { CheckCircle } from "lucide-react";

export default function StoreInfoBox() {
    return (
        <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-xl p-3">
            <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-[rgb(var(--color-primary))] mr-2 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                        Almost there!
                    </p>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                        Once you create your store, you'll have access to the full
                        dashboard with inventory management, customer tracking, and more.
                    </p>
                </div>
            </div>
        </div>
    );
}
