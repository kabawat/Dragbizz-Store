"use client";
import { StaffEmptyStateView } from "@dragorbit/features/management";

import { UserPlus, Users } from "lucide-react";
import { EmptyState } from "@/components/ui";

const StaffEmptyState = ({ hasSearch, onClearSearch, onInvite }) => {
  if (hasSearch) {
    return <StaffEmptyStateView model={{ onClearSearch }} />;
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
        icon: UserPlus,
      }}
    />
  );
};

export default StaffEmptyState;
