"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Search, Loader2 } from "lucide-react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { SideDrawer, Button } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import InviteStaffDrawer from "@/components/staff/InviteStaffDrawer";
import UpdateStaffDrawer from "@/components/staff/UpdateStaffDrawer";
import StaffCard from "@/components/staff/StaffCard";
import StaffEmptyState from "@/components/staff/StaffEmptyState";
import ManagementShortcuts from "@/components/dashboard/management/Shortcuts";
import staffService from "@/service/retailer/staff.service";
import useApiResponse from "@/hooks/useApiResponse";

const STATUS_TABS = [
    { label: "All", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Pending", value: "PENDING" },
    { label: "Inactive", value: "INACTIVE" },
    { label: "Removed", value: "REMOVED" },
];

const StaffPage = () => {
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?._id || selectedStore?.storeId;

    const [showInviteDrawer, setShowInviteDrawer] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");

    const [staffList, setStaffList] = useState([]);
    const { execute: executeFetch, loading: isLoading } = useApiResponse();
    const { execute: executeDelete } = useApiResponse();
    const { execute: executeRemove } = useApiResponse();

    const fetchStaff = useCallback(async () => {
        if (!storeId) return;
        const result = await executeFetch(
            staffService.getStaff(),
            { showToast: false }
        );
        if (result?.success) {
            setStaffList(Array.isArray(result.data) ? result.data : []);
        }
    }, [storeId, executeFetch]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const handleDeleteTempStaff = async (staffId) => {
        const result = await executeDelete(
            staffService.deleteTempStaff(staffId),
            { message: "Invitation cancelled successfully" }
        );
        if (result?.success) {
            setStaffList((prev) => prev.filter((s) => s._id !== staffId));
        }
    };

    const handleRemoveStaff = async (staffId) => {
        const result = await executeRemove(
            staffService.removeStaff(staffId),
            { message: "Staff member removed successfully" }
        );
        if (result?.success) {
            setStaffList((prev) =>
                prev.map((s) => s._id === staffId ? { ...s, status: "REMOVED" } : s)
            );
        }
    };

    const filteredStaff = staffList.filter((s) => {
        const matchesSearch =
            s.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
            s.roleName?.toLowerCase().includes(searchValue.toLowerCase());
        const matchesTab = activeTab === "ALL" || s.status === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <Sidebar />
            <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
                <Header title="Staff Management" description="Manage your store team and access permissions" />

                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                    <div className="max-w-8xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                            {/* Main Content (3/4) */}
                            <div className="lg:col-span-3 space-y-4">
                                {/* Header Bar */}
                                <div className="bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary)/0.4)] rounded-xl p-4">
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        {/* Search */}
                                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" />
                                            <input
                                                type="text"
                                                placeholder="Search staff..."
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2.5 text-sm bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-secondary))] focus:outline-none focus:border-[rgb(var(--color-primary))]"
                                            />
                                        </div>

                                        {/* Status Tabs */}
                                        <div className="flex items-center gap-1 bg-[rgb(var(--color-bg-secondary))] rounded-lg p-1">
                                            {STATUS_TABS.map((tab) => (
                                                <button
                                                    key={tab.value}
                                                    onClick={() => setActiveTab(tab.value)}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === tab.value
                                                        ? "bg-[rgb(var(--color-primary))] text-white shadow-sm"
                                                        : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                                        }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Invite Button */}
                                        <Button
                                            onClick={() => setShowInviteDrawer(true)}
                                            className="flex items-center gap-2"
                                        >
                                            <UserPlus size={16} />
                                            Invite Staff
                                        </Button>
                                    </div>
                                </div>

                                {/* List Section */}
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader2 size={28} className="animate-spin text-[rgb(var(--color-primary))]" />
                                    </div>
                                ) : filteredStaff.length === 0 ? (
                                    <StaffEmptyState
                                        hasSearch={!!searchValue}
                                        onClearSearch={() => setSearchValue("")}
                                        onInvite={() => setShowInviteDrawer(true)}
                                    />
                                ) : (
                                    <div className="grid gap-3">
                                        {filteredStaff.map((staff) => (
                                            <StaffCard
                                                key={staff._id}
                                                staff={staff}
                                                onDeleteTemp={handleDeleteTempStaff}
                                                onRemoveStaff={handleRemoveStaff}
                                                onEditStaff={(s) => setEditingStaff(s)}
                                                onRefresh={fetchStaff}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Column (1/4) */}
                            <div className="lg:col-span-1 space-y-4">
                                <ManagementShortcuts />
                                <div className="p-5 bg-[rgb(var(--color-primary))]/5 border border-dashed border-[rgb(var(--color-primary))]/20 rounded-xl">
                                    <h4 className="text-sm font-bold text-[rgb(var(--color-text-primary))] mb-1">Staff Note</h4>
                                    <p className="text-[11px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                                        Users with the role 'store_staff' have limited access to management features.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Staff Drawer */}
            <SideDrawer
                isOpen={showInviteDrawer}
                onClose={() => setShowInviteDrawer(false)}
                title="Invite Staff Member"
                icon={UserPlus}
                width="max-w-[768px]"
            >
                <InviteStaffDrawer
                    storeId={storeId}
                    onSuccess={() => { setShowInviteDrawer(false); fetchStaff(); }}
                    onCancel={() => setShowInviteDrawer(false)}
                />
            </SideDrawer>

            {/* Update Staff Drawer */}
            <SideDrawer
                isOpen={!!editingStaff}
                onClose={() => setEditingStaff(null)}
                title="Edit Staff Permissions"
                icon={Users}
                width="max-w-[768px]"
            >
                <UpdateStaffDrawer
                    staff={editingStaff}
                    onSuccess={() => { setEditingStaff(null); fetchStaff(); }}
                    onCancel={() => setEditingStaff(null)}
                />
            </SideDrawer>
        </div>
    );
};

export default StaffPage;
