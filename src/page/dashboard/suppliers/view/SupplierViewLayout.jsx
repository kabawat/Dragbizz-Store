"use client";
import React from "react";
import SupplierBasicInfo from "./components/SupplierBasicInfo";
import SupplierAddress from "./components/SupplierAddress";
import SupplierAccountDetails from "./components/SupplierAccountDetails";
import SupplierActions from "./components/SupplierActions";

const SupplierViewLayout = ({
    supplierData,
    supplierId,
    storeId,
    onEdit,
    onDownloadPDF,
    t,
    fetching,
}) => {
    if (!supplierData) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
            <div className="lg:col-span-2">
                <div className="overflow-y-auto pe-3 space-y-6 h-[calc(100vh-150px)] custom-scrollbar">
                    <SupplierBasicInfo supplierData={supplierData} />
                    <SupplierAddress address={supplierData.address} />
                    <SupplierAccountDetails account={supplierData.account} />
                </div>
            </div>

            <SupplierActions
                supplierData={supplierData}
                supplierId={supplierId}
                storeId={storeId}
                onEdit={onEdit}
                onDownload={onDownloadPDF}
                fetching={fetching}
            />
        </div>
    );
};

export default SupplierViewLayout;
