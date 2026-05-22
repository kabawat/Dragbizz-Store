import React from "react";
import { UserPlus, Users, SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui";

const StaffEmptyState = ({ hasSearch, onClearSearch, onInvite }) => {
    if (hasSearch) {
        return (
            <EmptyState
                title="No staff found"
                description="No staff members match your search criteria. Try adjusting your filters or search term."
                icon={SearchX}
                type="empty"
                actionButton={{
                    label: "Clear Search",
                    onClick: onClearSearch,
                    variant: "outline"
                }}
            />
        );
    }

    return (
        <EmptyState
            title="Your team is empty"
            description="Invite your first staff member to start managing your store together with custom roles and permissions."
            icon={Users}
            type="empty"
            actionButton={{
                label: "Invite First Staff",
                onClick: onInvite,
                icon: UserPlus
            }}
        />
    );
};

export default StaffEmptyState;
