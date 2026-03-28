"use client";
import { UserPlus, Users } from "lucide-react";

const StaffEmptyState = ({ hasSearch, onClearSearch, onInvite }) => {
    return (
        <div className="bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(var(--color-primary),0.1)] flex items-center justify-center mb-4">
                <Users size={28} className="text-[rgb(var(--color-primary))]" />
            </div>

            {hasSearch ? (
                <>
                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-1">No staff found</h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
                        No staff members match your search.
                    </p>
                    <button
                        onClick={onClearSearch}
                        className="px-4 py-2 text-sm border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] hover:border-[rgb(var(--color-primary))]/50 transition-all"
                    >
                        Clear Search
                    </button>
                </>
            ) : (
                <>
                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-1">No staff members yet</h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-5">
                        Invite your first team member to start managing your store together.
                    </p>
                    <button
                        onClick={onInvite}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[rgb(var(--color-primary))] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <UserPlus size={16} />
                        Invite First Staff
                    </button>
                </>
            )}
        </div>
    );
};

export default StaffEmptyState;
