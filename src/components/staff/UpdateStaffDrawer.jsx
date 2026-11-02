"use client";
import { UpdateStaffDrawerView } from "@dragorbit/features/management";

import { useEffect, useMemo, useState } from "react";
import useApiResponse from "@/hooks/useApiResponse";
import staffService from "@/service/retailer/staff.service";
import { useAppSelector } from "@/store/hooks";
import { pickStoreId } from "@/utils/store.util";

const MODULES = [
  { key: "billing", label: "Billing", description: "Create & manage bills" },
  { key: "invoice", label: "Invoice", description: "Create & manage invoices" },
  { key: "product", label: "Products", description: "Manage product catalog" },
  { key: "inventory", label: "Inventory", description: "Track stock levels" },
  {
    key: "supplier",
    label: "Suppliers",
    description: "Manage supplier records",
  },
  { key: "customer", label: "Customers", description: "Manage customer data" },
  { key: "expense", label: "Expenses", description: "Track store expenses" },
  {
    key: "purchase_order",
    label: "Purchase Orders",
    description: "Manage purchase orders",
  },
  {
    key: "sales_order",
    label: "Sales Orders",
    description: "Manage sales orders",
  },
  { key: "reports", label: "Reports", description: "View reports & analytics" },
];

const ACTIONS = [
  { key: "create", label: "Create" },
  { key: "read", label: "View" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "report", label: "Reports" },
  { key: "analytics", label: "Analytics" },
];

const PRESET_ROLES = [
  {
    label: "Manager",
    description: "Full access to all modules",
    permissions: MODULES.map((m) => ({
      module: m.key,
      create: true,
      read: true,
      edit: true,
      delete: true,
      report: true,
      analytics: true,
    })),
  },
  {
    label: "Cashier",
    description: "Billing & invoices only",
    permissions: [
      {
        module: "billing",
        create: true,
        read: true,
        edit: true,
        delete: false,
        report: false,
        analytics: false,
      },
      {
        module: "invoice",
        create: true,
        read: true,
        edit: false,
        delete: false,
        report: false,
        analytics: false,
      },
      {
        module: "customer",
        create: false,
        read: true,
        edit: false,
        delete: false,
        report: false,
        analytics: false,
      },
    ],
  },
  {
    label: "Inventory Staff",
    description: "Products & inventory only",
    permissions: [
      {
        module: "product",
        create: false,
        read: true,
        edit: true,
        delete: false,
        report: false,
        analytics: false,
      },
      {
        module: "inventory",
        create: true,
        read: true,
        edit: true,
        delete: false,
        report: true,
        analytics: false,
      },
    ],
  },
];

const DEFAULT_PERMISSION = (moduleKey) => ({
  module: moduleKey,
  create: false,
  read: false,
  edit: false,
  delete: false,
  report: false,
  analytics: false,
});

const UpdateStaffDrawer = ({ staff, onSuccess, onCancel }) => {
  const [roleName, setRoleName] = useState(staff?.roleName || "");
  const [permissions, setPermissions] = useState(staff?.permissions || []);
  const [managedStoreIds, setManagedStoreIds] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [error, setError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const { execute, loading: isLoading } = useApiResponse();

  const { stores: allStores } = useAppSelector((state) => state.profile);

  const storeOptions = useMemo(
    () =>
      allStores?.filter(Boolean).map((s) => ({
        label: s.storeName || s.name || s.storeId || "Unnamed Store",
        value: pickStoreId(s),
      })) || [],
    [allStores]
  );

  useEffect(() => {
    if (staff) {
      setRoleName(staff.roleName || "");
      setPermissions(staff.permissions || []);

      // Extract store IDs from staff.stores (could be array of objects or strings)
      const storeIds = staff.stores?.map((s) => pickStoreId(s) || s) || [];
      setManagedStoreIds(storeIds);

      // Auto expand modules that have permissions enabled
      const expanded = {};
      if (staff.permissions) {
        staff.permissions.forEach((p) => {
          expanded[p.module] = true;
        });
      }
      setExpandedModules(expanded);
    }
  }, [staff]);

  const toggleModule = (moduleKey) => {
    const existing = permissions.find((p) => p.module === moduleKey);
    if (existing) {
      setPermissions((prev) => prev.filter((p) => p.module !== moduleKey));
    } else {
      setPermissions((prev) => [
        ...prev,
        { ...DEFAULT_PERMISSION(moduleKey), read: true },
      ]);
      setExpandedModules((prev) => ({ ...prev, [moduleKey]: true }));
    }
  };

  const toggleAction = (moduleKey, actionKey) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.module === moduleKey ? { ...p, [actionKey]: !p[actionKey] } : p
      )
    );
  };

  const applyPreset = (preset) => {
    setSelectedPreset(preset.label);
    setRoleName(preset.label);
    setPermissions(preset.permissions);
    const expanded = {};
    preset.permissions.forEach((p) => {
      expanded[p.module] = false;
    });
    setExpandedModules(expanded);
  };

  const isModuleEnabled = (moduleKey) =>
    permissions.some((p) => p.module === moduleKey);
  const getModulePerms = (moduleKey) =>
    permissions.find((p) => p.module === moduleKey);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName || permissions.length === 0) {
      setError(
        "Please provide a role and select at least one permission module."
      );
      return;
    }

    if (!managedStoreIds || managedStoreIds.length === 0) {
      setError("At least one store must be selected.");
      return;
    }

    setError(null);

    const data = { roleName, permissions, stores: managedStoreIds };

    const result = await execute(staffService.updateStaff(staff._id, data), {
      message: "Staff permissions updated successfully!",
    });

    if (result?.success) {
      onSuccess?.();
    } else {
      setError(result?.message || "Failed to update staff. Please try again.");
    }
  };

  if (!staff) return null;

  return (
    <UpdateStaffDrawerView
      model={{
        handleSubmit,
        staff,
        roleName,
        setRoleName,
        setSelectedPreset,
        storeOptions,
        managedStoreIds,
        setManagedStoreIds,
        PRESET_ROLES,
        applyPreset,
        selectedPreset,
        permissions,
        MODULES,
        isModuleEnabled,
        getModulePerms,
        expandedModules,
        toggleModule,
        setExpandedModules,
        ACTIONS,
        toggleAction,
        error,
        isLoading,
        onCancel,
      }}
    />
  );
};

export default UpdateStaffDrawer;
