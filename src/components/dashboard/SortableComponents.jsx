"use client";
import React from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";

export const SortableSection = ({ id, children, isVisible }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group mb-6 break-inside-avoid break-inside-avoid-column"
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute -left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
                <div className="w-6 h-6 bg-[rgb(var(--color-bg-primary))] rounded border border-[rgb(var(--color-border-primary))] flex items-center justify-center shadow-sm">
                    <GripVertical className="w-3 h-3 text-[rgb(var(--color-text-secondary))]" />
                </div>
            </div>
            <div className={`transition-all duration-300 ${!isVisible ? "opacity-50 pointer-events-none" : ""}`}>
                {children}
            </div>
        </div>
    );
};

export const SortableMetricCard = ({
    id,
    title,
    value,
    change,
    changeType,
    icon: Icon,
    iconColor,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const ChangeIcon = changeType === "up" ? TrendingUp : TrendingDown;
    const changeColor = changeType === "up" ? "text-green-600" : "text-red-600";

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 transition-all duration-300 hover:bg-[rgb(var(--color-bg-primary))]/30 relative group"
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute -left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
                <div className="w-6 h-6 bg-[rgb(var(--color-bg-primary))] rounded border border-[rgb(var(--color-border-primary))] flex items-center justify-center shadow-sm">
                    <GripVertical className="w-3 h-3 text-[rgb(var(--color-text-secondary))]" />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                        {value}
                    </p>
                    <div className={`flex items-center mt-2 ${changeColor}`}>
                        <ChangeIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{change}</span>
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
};

export const AnalyticsCard = ({ title, icon: Icon, iconColor, children, linkTo }) => (
    <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${iconColor} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                    {title}
                </h2>
            </div>
            {linkTo && (
                <Link href={linkTo} className="flex items-center text-sm font-medium text-[rgb(var(--color-primary))] hover:brightness-110 transition-all group">
                    Details
                    <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </Link>
            )}
        </div>
        {children}
    </div>
);

export const SortableAnalyticsCard = ({
    id,
    title,
    icon: Icon,
    iconColor,
    children,
    isVisible,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const linkMap = {
        revenueAnalytics: "/dashboard/analytics/revenue",
        salesAnalytics: "/dashboard/analytics/sales",
        stockAnalytics: "/dashboard/analytics/stock",
        productAnalytics: "/dashboard/analytics/products",
        customerAnalytics: "/dashboard/analytics/customers",
        supplierAnalytics: "/dashboard/analytics/suppliers",
        billAnalytics: "/dashboard/analytics/bills",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group mb-6 break-inside-avoid break-inside-avoid-column"
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute -left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
                <div className="w-6 h-6 bg-[rgb(var(--color-bg-primary))] rounded border border-[rgb(var(--color-border-primary))] flex items-center justify-center shadow-sm">
                    <GripVertical className="w-3 h-3 text-[rgb(var(--color-text-secondary))]" />
                </div>
            </div>

            <div className={`transition-all duration-300 ${!isVisible ? "opacity-50 pointer-events-none" : ""}`}>
                <AnalyticsCard
                    title={title}
                    icon={Icon}
                    iconColor={iconColor}
                    linkTo={linkMap[id] || null}
                >
                    {children}
                </AnalyticsCard>
            </div>
        </div>
    );
};
