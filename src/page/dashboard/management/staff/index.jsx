"use client";
import React, { useState, useEffect, useRef } from "react";
import { Users, UserPlus, Search, Loader2, CalendarCheck, IndianRupee } from "lucide-react";
import { SideDrawer, Button } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import InviteStaffDrawer from "@/components/staff/InviteStaffDrawer";
import UpdateStaffDrawer from "@/components/staff/UpdateStaffDrawer";
import StaffCard from "@/components/staff/StaffCard";
import StaffEmptyState from "@/components/staff/StaffEmptyState";
import StaffAttendanceTab from "@/components/staff/StaffAttendanceTab";
import StaffSalaryTab from "@/components/staff/StaffSalaryTab";
import MarkAttendanceDrawer from "@/components/staff/MarkAttendanceDrawer";
import RecordSalaryDrawer from "@/components/staff/RecordSalaryDrawer";
import ManagementShortcuts from "@/components/dashboard/management/Shortcuts";
import { useTranslation } from "@/hooks/ui/useTranslation";
import staffService from "@/service/retailer/staff.service";
import useApiResponse from "@/hooks/useApiResponse";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";

const PAGE_TABS = [
    { label: "Team", value: "TEAM" },
    { label: "Attendance", value: "ATTENDANCE" },
    { label: "Salary", value: "SALARY" },
];

const STATUS_TABS = [
    { label: "All", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Pending", value: "PENDING" },
    { label: "Inactive", value: "INACTIVE" },
    { label: "Removed", value: "REMOVED" },
];

const StaffPage = () => {
    const { t } = useTranslation();
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?._id || selectedStore?.storeId;

    useDashboardHeader(t("staff.title"), t("staff.description"));

    const [showInviteDrawer, setShowInviteDrawer] = useState(false);
    const [showMarkAttendanceDrawer, setShowMarkAttendanceDrawer] = useState(false);
    const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);
    const [attendanceSavedDate, setAttendanceSavedDate] = useState(null);
    const [showRecordSalaryDrawer, setShowRecordSalaryDrawer] = useState(false);
    const [salaryRefreshKey, setSalaryRefreshKey] = useState(0);
    const [salarySavedPeriodMonth, setSalarySavedPeriodMonth] = useState(null);
    const [editingStaff, setEditingStaff] = useState(null);
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");
    const [pageTab, setPageTab] = useState("TEAM");

    const [staffList, setStaffList] = useState([]);
    const { execute: executeFetch, data: fetchedStaff, loading: isLoading } = useApiResponse();
    const { execute: executeAction } = useApiResponse();
    const fetchedStoreId = useRef(null);

    useEffect(() => {
        if (fetchedStaff) {
            setStaffList(Array.isArray(fetchedStaff) ? fetchedStaff : []);
        }
    }, [fetchedStaff]);

    useEffect(() => {
        if (storeId && fetchedStoreId.current !== storeId) {
            fetchedStoreId.current = storeId;
            executeFetch(staffService.getStaff(), { showToast: false });
        }
    }, [storeId, executeFetch]);

    const refreshStaff = () => executeFetch(staffService.getStaff(), { showToast: false });

    const handleDeleteTempStaff = async (staffId) => {
        const result = await executeAction(
            staffService.deleteTempStaff(staffId),
            { message: "Invitation cancelled successfully" }
        );
        if (result?.success) {
            setStaffList((prev) => prev.filter((s) => s._id !== staffId));
        }
    };

    const handleResendInvite = async (staffId) => {
        const result = await executeAction(
            staffService.resendStaffInvite(staffId),
            { message: "Staff invitation resent successfully" }
        );
        if (result?.success) {
            setStaffList((prev) =>
                prev.map((s) =>
                    s._id === staffId ? { ...s, expiresAt: result.data?.data?.expiresAt || result.data?.expiresAt } : s
                )
            );
        }
    };

    const handleRemoveStaff = async (staffId) => {
        const result = await executeAction(
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
        <div className="p-5">
            <div className="max-w-8xl mx-auto">
                <div className="mb-4 flex items-center gap-1 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-1 w-fit">
                    {PAGE_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setPageTab(tab.value)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                                pageTab === tab.value
                                    ? "bg-[rgb(var(--color-primary))] text-white shadow-sm"
                                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {pageTab === "ATTENDANCE" ? (
                    <StaffAttendanceTab
                        storeId={storeId}
                        staffList={staffList}
                        refreshKey={attendanceRefreshKey}
                        savedDate={attendanceSavedDate}
                        onOpenMarkDrawer={() => setShowMarkAttendanceDrawer(true)}
                    />
                ) : pageTab === "SALARY" ? (
                    <StaffSalaryTab
                        storeId={storeId}
                        staffList={staffList}
                        refreshKey={salaryRefreshKey}
                        savedPeriodMonth={salarySavedPeriodMonth}
                        onOpenRecordDrawer={() => setShowRecordSalaryDrawer(true)}
                    />
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary)/0.4)] rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between gap-4 flex-wrap text-sm">
                                <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))]" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email or role..."
                                            value={searchValue}
                                            onChange={(e) => setSearchValue(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 text-sm bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-tertiary))] focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors"
                                        />
                                    </div>

                                    <div className="flex items-center gap-1 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-1 overflow-hidden">
                                        {STATUS_TABS.map((tab) => (
                                            <button
                                                key={tab.value}
                                                type="button"
                                                onClick={() => setActiveTab(tab.value)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${activeTab === tab.value
                                                    ? "bg-[rgb(var(--color-primary))] text-white shadow-sm"
                                                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] shadow-none"
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button leftIcon={UserPlus} className="px-5" onClick={() => setShowInviteDrawer(true)}>
                                    Invite Staff
                                </Button>
                            </div>
                        </div>

                        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary)/0.4)] overflow-hidden">
                            <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar p-1">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                                        <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))] animate-pulse">Fetching store team...</p>
                                    </div>
                                ) : filteredStaff.length === 0 ? (
                                    <div className="py-12">
                                        <StaffEmptyState
                                            hasSearch={!!searchValue || activeTab !== "ALL"}
                                            onClearSearch={() => { setSearchValue(""); setActiveTab("ALL"); }}
                                            onInvite={() => setShowInviteDrawer(true)}
                                        />
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[rgb(var(--color-border-primary)/0.3)]">
                                        {filteredStaff.map((staff) => (
                                            <div key={staff._id} className="p-1">
                                                <StaffCard
                                                    staff={staff}
                                                    onDeleteTemp={handleDeleteTempStaff}
                                                    onResendInvite={handleResendInvite}
                                                    onRemoveStaff={handleRemoveStaff}
                                                    onEditStaff={(s) => setEditingStaff(s)}
                                                    onRefresh={refreshStaff}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {!isLoading && filteredStaff.length > 0 && (
                                <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary)/0.5)] px-6 py-3">
                                    <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))] flex items-center gap-2">
                                        <Users size={14} className="text-[rgb(var(--color-primary))]" />
                                        Showing {filteredStaff.length} team members
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-4">
                        <ManagementShortcuts />
                        <div className="p-5 bg-[rgb(var(--color-primary))]/5 border border-dashed border-[rgb(var(--color-primary))]/20 rounded-xl">
                            <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-1.5">Staff Note</h4>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))] leading-relaxed">
                                Users with the role &apos;store_staff&apos; have limited access to management features.
                            </p>
                        </div>
                    </div>
                </div>
                )}
            </div>

            <SideDrawer
                isOpen={showMarkAttendanceDrawer}
                onClose={() => setShowMarkAttendanceDrawer(false)}
                title={t("staff.attendance.markTitle") || "Mark attendance"}
                description={
                    t("staff.attendance.markDescription") ||
                    "Record daily attendance for your active team members."
                }
                icon={CalendarCheck}
                width="w-full md:w-[500px]"
                closeOnOutsideClick={false}
            >
                <MarkAttendanceDrawer
                    storeId={storeId}
                    staffList={staffList}
                    onSuccess={(savedDate) => {
                        setShowMarkAttendanceDrawer(false);
                        setAttendanceSavedDate(savedDate || null);
                        setAttendanceRefreshKey((key) => key + 1);
                    }}
                    onCancel={() => setShowMarkAttendanceDrawer(false)}
                />
            </SideDrawer>

            <SideDrawer
                isOpen={showRecordSalaryDrawer}
                onClose={() => setShowRecordSalaryDrawer(false)}
                title={t("staff.salary.recordTitle") || "Record salary"}
                description={
                    t("staff.salary.recordDescription") ||
                    "Record salary payment for an active team member."
                }
                icon={IndianRupee}
                width="w-full md:w-[500px]"
                closeOnOutsideClick={false}
            >
                <RecordSalaryDrawer
                    storeId={storeId}
                    staffList={staffList}
                    onSuccess={(periodMonth) => {
                        setShowRecordSalaryDrawer(false);
                        setSalarySavedPeriodMonth(periodMonth || null);
                        setSalaryRefreshKey((key) => key + 1);
                    }}
                    onCancel={() => setShowRecordSalaryDrawer(false)}
                />
            </SideDrawer>

            <SideDrawer
                isOpen={showInviteDrawer}
                onClose={() => setShowInviteDrawer(false)}
                title="Invite Staff Member"
                description="Invite a new team member and assign them to one or more stores with specific roles."
                icon={UserPlus}
                width="max-w-2xl"
                closeOnOutsideClick={false}
            >
                <InviteStaffDrawer
                    storeId={storeId}
                    onSuccess={() => { setShowInviteDrawer(false); refreshStaff(); }}
                    onCancel={() => setShowInviteDrawer(false)}
                />
            </SideDrawer>

            <SideDrawer
                isOpen={!!editingStaff}
                onClose={() => setEditingStaff(null)}
                title="Edit Staff Member"
                description="Update roles, permissions, and assigned stores for this staff member."
                icon={Users}
                width="max-w-2xl"
                closeOnOutsideClick={false}
            >
                <UpdateStaffDrawer
                    staff={editingStaff}
                    onSuccess={() => { setEditingStaff(null); refreshStaff(); }}
                    onCancel={() => setEditingStaff(null)}
                />
            </SideDrawer>
        </div>
    );
};

export default StaffPage;
