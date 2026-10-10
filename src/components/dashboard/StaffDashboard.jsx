"use client";
import {
  createDashboardRoutes,
  getStaffModules,
  StaffDashboard as SharedStaffDashboard,
} from "@dragorbit/features/dashboard";
import { useRouter } from "next/navigation";

const routes = createDashboardRoutes("/dashboard");
export const StaffDashboard = ({ permissions = [] }) => {
  const router = useRouter();
  return (
    <SharedStaffDashboard
      modules={getStaffModules(permissions, routes)}
      onNavigate={(module) => router.push(module.path)}
    />
  );
};
