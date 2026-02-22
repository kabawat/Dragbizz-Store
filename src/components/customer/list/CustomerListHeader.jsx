"use client";
import { useState, useRef } from "react";
import { Download, Grid3X3, List, Mic, Plus, Search } from "lucide-react";
import { Button, Input, SideDrawer } from "@/components/ui";
import { VoiceAICustomer } from "@/components/customer";
import CustomerDownloadDrawer from "@/components/customer/CustomerDownloadDrawer";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";

const CustomerListHeader = ({
    searchValue,
    onSearchChange,
    viewMode,
    onViewModeChange,
    onAddCustomer,
    onSuccess,
    hasCustomers,
    selectedStore,
    t,
}) => {
    const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);
    const [showVoiceAIDrawer, setShowVoiceAIDrawer] = useState(false);
    const searchInputRef = useRef(null);

    const storeId = selectedStore?.storeId || "";

    // Component-level Hotkeys
    useCommonHotkeys({
        onDownload: () => setShowDownloadDrawer(true),
        onSearch: () => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        },
        onViewTable: () => onViewModeChange("table"),
        onViewGrid: () => onViewModeChange("card"),
        onVoiceAI: () => setShowVoiceAIDrawer(true),
        onClose: () => {
            if (showDownloadDrawer) setShowDownloadDrawer(false);
            else if (showVoiceAIDrawer) setShowVoiceAIDrawer(false);
        }
    });

    const handleVoiceAICustomer = () => {
        setShowVoiceAIDrawer(true);
    };

    const handleDownload = () => {
        setShowDownloadDrawer(true);
    };

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                <div className="w-100">
                    <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder={`${t("common.search")} ${t("customers.title").toLowerCase()}...`}
                        value={searchValue}
                        onChange={(value) => onSearchChange(value)}
                        leftIcon={Search}
                        className="w-100"
                    />
                </div>

                <div className="flex gap-3">
                    {hasCustomers && (
                        <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <button
                                onClick={() => onViewModeChange("table")}
                                className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "table"
                                    ? "bg-[rgb(var(--color-primary))] text-white"
                                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                    }`}
                            >
                                <List className="w-4 h-4" />
                                {t("common.tableView")}
                            </button>
                            <button
                                onClick={() => onViewModeChange("card")}
                                className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "card"
                                    ? "bg-[rgb(var(--color-primary))] text-white"
                                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                    }`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                                {t("common.cardView")}
                            </button>
                        </div>
                    )}

                    <Button
                        variant="secondary"
                        onClick={handleDownload}
                        className="flex items-center gap-2 h-9"
                    >
                        <Download className="w-4 h-4" />
                        {t("customers.download")}
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={handleVoiceAICustomer}
                        className="flex items-center gap-2 h-9"
                    >
                        <Mic className="w-4 h-4" />
                        {t("customers.voiceAI")}
                    </Button>

                    <Button variant="primary" onClick={onAddCustomer} leftIcon={Plus}>
                        {t("customers.addCustomer")}
                    </Button>
                </div>
            </div>

            {/* Content-specific Drawers kept inside the component */}
            {showDownloadDrawer && (
                <CustomerDownloadDrawer
                    isOpen={showDownloadDrawer}
                    onClose={() => setShowDownloadDrawer(false)}
                />
            )}

            <SideDrawer
                isOpen={showVoiceAIDrawer}
                onClose={() => setShowVoiceAIDrawer(false)}
                title={t("customers.createWithVoiceAI")}
                icon={Mic}
                description={t("customers.voiceAIDescription")}
                width="w-full md:w-2/3 lg:w-1/2"
            >
                <div className="h-full">
                    <VoiceAICustomer
                        storeId={storeId}
                        onSuccess={(customerData) => {
                            onSuccess(customerData);
                            setShowVoiceAIDrawer(false);
                        }}
                        onCancel={() => setShowVoiceAIDrawer(false)}
                    />
                </div>
            </SideDrawer>
        </div>
    );
};

export default CustomerListHeader;
