import { AlertCircle } from "lucide-react";

export default function ErrorDisplay({ errors, error }) {
    if (!errors.general && !error) return null;

    return (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                <span className="text-red-700 text-sm">
                    {errors.general || error}
                </span>
            </div>
        </div>
    );
}
