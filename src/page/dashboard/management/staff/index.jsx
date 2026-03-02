"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Search, Loader2 } from "lucide-react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { SideDrawer, Button } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import InviteStaffDrawer from "@/components/staff/InviteStaffDrawer";
import StaffCard from "@/components/staff/StaffCard";
import StaffEmptyState from "@/components/staff/StaffEmptyState";
import ManagementShortcuts from "@/components/dashboard/management/Shortcuts";
import staffService from "@/service/retailer/staff.service";
import { useGlobalToast } from "@/contexts/ToastContext";

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
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");

    const [staffList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { showError } = useGlobalToast();

    const fetchStaff = useCallback(async () => {
        if (!storeId) return;
        setIsLoading(true);
        try {
            const response = await staffService.getStaff();
            setStaffList(Array.isArray(response?.data) ? response.data : []);
        } catch (err) {
            showError(err?.response?.data?.message || "Failed to load staff");
        } finally {
            setIsLoading(false);
        }
    }, [storeId]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const handleDeleteTempStaff = async (staffId) => {
        try {
            await staffService.deleteTempStaff(staffId);
            setStaffList((prev) => prev.filter((s) => s._id !== staffId));
        } catch (err) {
            showError(err?.response?.data?.message || "Failed to cancel invitation");
        }
    };

    const handleRemoveStaff = async (staffId) => {
        try {
            await staffService.removeStaff(staffId);
            setStaffList((prev) =>
                prev.map((s) => s._id === staffId ? { ...s, status: "REMOVED" } : s)
            );
        } catch (err) {
            showError(err?.response?.data?.message || "Failed to remove staff member");
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
        </div>
    );
};

export default StaffPage;
