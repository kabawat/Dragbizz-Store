"use client";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedStore } from "@/store/slices/profileSlice";
import { useTranslation } from "@/hooks/ui/useTranslation";

const StoreSelector = ({ isCollapsed, onStoreChange }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { stores: reduxStores, selectedStore } = useAppSelector(
        (state) => state.profile
    );

    const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
    const storeDropdownRef = useRef(null);

    // Handle store selection
    const handleStoreSelect = (store) => {
        dispatch(setSelectedStore(store));
        setIsStoreDropdownOpen(false);
        if (onStoreChange) {
            onStoreChange(store);
        }
    };

    // Close dropdown when sidebar collapses
    useEffect(() => {
        if (isCollapsed) {
            setIsStoreDropdownOpen(false);
        }
    }, [isCollapsed]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isDropdownToggle = event.target.closest(
                "button[data-dropdown-toggle]"
            );
            if (isDropdownToggle) return;

            if (
                storeDropdownRef.current &&
                !storeDropdownRef.current.contains(event.target)
            ) {
                setIsStoreDropdownOpen(false);
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener("click", handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    // Don't render when sidebar is collapsed
    if (isCollapsed) return null;

    return (
        <div className="p-3 border-b border-[rgb(var(--color-border-primary))]">
            <div className="relative" ref={storeDropdownRef}>
                {/* Dropdown Trigger */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsStoreDropdownOpen((prev) => !prev);
                    }}
                    data-dropdown-toggle
                    className="flex items-center justify-between p-2 bg-[rgb(var(--color-primary))]/5 border-2 border-[rgb(var(--color-primary))]/10 rounded-lg cursor-pointer hover:bg-[rgb(var(--color-primary))]/10 transition-colors"
                >
                    <div>
                        <div className="font-semibold text-sm text-gray-900">
                            {selectedStore?.name ||
                                selectedStore?.storeName ||
                                t("sidebar.selectStore")}
                        </div>
                        <div className="text-xs text-gray-600">
                            GST: {selectedStore?.gst || t("common.notAvailable")}
                        </div>
                    </div>
                    <ChevronDown
                        className={`w-3 h-3 text-[rgb(var(--color-primary))] transition-transform duration-200 ${isStoreDropdownOpen ? "rotate-180" : ""
                            }`}
                    />
                </div>

                {/* Dropdown List */}
                {isStoreDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-[9999]">
                        <div className="p-1">
                            {reduxStores.map((store) => {
                                const isSelected =
                                    selectedStore &&
                                    store.storeName === selectedStore.storeName;
                                return (
                                    <div
                                        key={store.storeName || store.name || store.id}
                                        onClick={() => handleStoreSelect(store)}
                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] transition-colors ${isSelected ? "bg-[rgb(var(--color-primary))]/5" : ""
                                            }`}
                                    >
                                        <div>
                                            <div className="font-medium text-sm text-gray-900">
                                                {store.storeName}
                                            </div>
                                            <div
                                                className={`text-xs ${isSelected ? "text-gray-600" : "text-gray-500"
                                                    }`}
                                            >
                                                GST: {store.gst}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-3 h-3 text-[rgb(var(--color-primary))]" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreSelector;
