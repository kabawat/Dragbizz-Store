"use client";
import {
  getQuickActions as buildActions,
  createDashboardRoutes,
  QuickActions as SharedQuickActions,
} from "@dragorbit/features/dashboard";

const routes = createDashboardRoutes("/dashboard");
export const getQuickActions = (t) =>
  buildActions(t, routes).map((action) => ({
    ...action,
    path: action.id,
    icon: action.logo,
  }));
export const QuickActions = ({ onActionClick, ...props }) => (
  <SharedQuickActions {...props} routes={routes} onNavigate={onActionClick} />
);
