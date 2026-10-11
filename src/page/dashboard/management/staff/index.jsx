"use client";
import { StaffScreen } from "@dragorbit/features/management";

import { useState, useEffect, useRef } from "react";

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
  const [showMarkAttendanceDrawer, setShowMarkAttendanceDrawer] =
    useState(false);
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
  const {
    execute: executeFetch,
    data: fetchedStaff,
    loading: isLoading,
  } = useApiResponse();
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

  const refreshStaff = () =>
    executeFetch(staffService.getStaff(), { showToast: false });

  const handleDeleteTempStaff = async (staffId) => {
    const result = await executeAction(staffService.deleteTempStaff(staffId), {
      message: "Invitation cancelled successfully",
    });
    if (result?.success) {
      setStaffList((prev) => prev.filter((s) => s._id !== staffId));
    }
  };

  const handleResendInvite = async (staffId) => {
    const result = await executeAction(
      staffService.resendStaffInvite(staffId),
      { message: "Staff invitation resent successfully" },
    );
    if (result?.success) {
      setStaffList((prev) =>
        prev.map((s) =>
          s._id === staffId
            ? {
                ...s,
                expiresAt:
                  result.data?.data?.expiresAt || result.data?.expiresAt,
              }
            : s,
        ),
      );
    }
  };

  const handleRemoveStaff = async (staffId) => {
    const result = await executeAction(staffService.removeStaff(staffId), {
      message: "Staff member removed successfully",
    });
    if (result?.success) {
      setStaffList((prev) =>
        prev.map((s) => (s._id === staffId ? { ...s, status: "REMOVED" } : s)),
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
    <StaffScreen
      model={{
        isOnline: true,
        t,
        PAGE_TABS,
        setPageTab,
        pageTab,
        StaffAttendanceTab,
        storeId,
        staffList,
        attendanceRefreshKey,
        attendanceSavedDate,
        setShowMarkAttendanceDrawer,
        StaffSalaryTab,
        salaryRefreshKey,
        salarySavedPeriodMonth,
        setShowRecordSalaryDrawer,
        searchValue,
        setSearchValue,
        STATUS_TABS,
        setActiveTab,
        activeTab,
        handleInviteOpen: () => setShowInviteDrawer(true),
        listLoading: isLoading,
        filteredStaff,
        StaffEmptyState,
        StaffCard,
        handleDeleteTempStaff,
        handleResendInvite,
        handleRemoveStaff,
        handleEditStaff: setEditingStaff,
        loadLocalStaff: refreshStaff,
        isSyncing: false,
        ManagementShortcuts,
        showMarkAttendanceDrawer,
        MarkAttendanceDrawer,
        setAttendanceSavedDate,
        setAttendanceRefreshKey,
        showRecordSalaryDrawer,
        RecordSalaryDrawer,
        setSalarySavedPeriodMonth,
        setSalaryRefreshKey,
        showInviteDrawer,
        setShowInviteDrawer,
        InviteStaffDrawer,
        editingStaff,
        setEditingStaff,
        UpdateStaffDrawer,
      }}
    />
  );
};

export default StaffPage;
